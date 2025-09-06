// supabase/functions/voice-call/index.ts
// Deno Edge Function to initiate a Twilio bridged call (counsellor -> student)
// Preferred JSON body: { booking_id: string, counsellor_phone: string }
// Backward-compat body: { counsellor_phone: string, student_phone?: string }

// Environment variables required (configure via Supabase secrets):
// - TWILIO_ACCOUNT_SID
// - TWILIO_AUTH_TOKEN
// - TWILIO_CALLER_ID  (your Twilio verified/owned phone number in E.164, e.g. +14155551234)
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY (server-side only; DO NOT expose in client)
// Optional envs to adapt schema:
// - BOOKINGS_TABLE (default: bookings)
// - BOOKINGS_ID_COLUMN (default: id)
// - BOOKINGS_STUDENT_PHONE_COLUMN (default: student_phone)

// deno-types="jsr:@supabase/functions-js/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_BASE = "https://api.twilio.com/2010-04-01";

function isE164(phone: string) {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}

async function getStudentPhoneByBooking(bookingId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  const table = Deno.env.get("BOOKINGS_TABLE") || "bookings";
  const idCol = Deno.env.get("BOOKINGS_ID_COLUMN") || "id";
  const phoneCol = Deno.env.get("BOOKINGS_STUDENT_PHONE_COLUMN") || "student_phone";

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data, error } = await admin
    .from(table)
    .select(`${phoneCol}`)
    .eq(idCol, bookingId)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Supabase lookup error", error);
    return null;
  }
  const phone = (data as any)?.[phoneCol] as string | undefined;
  return phone ?? null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { booking_id, counsellor_phone, student_phone: studentPhoneRaw } = await req.json();
    if (!counsellor_phone) {
      return new Response(JSON.stringify({ error: "Missing counsellor_phone" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (!isE164(counsellor_phone)) {
      return new Response(JSON.stringify({ error: "counsellor_phone must be E.164 format (e.g. +14155551234)" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    let student_phone: string | null = null;
    if (booking_id) {
      student_phone = await getStudentPhoneByBooking(booking_id);
      if (!student_phone) {
        return new Response(JSON.stringify({ error: "Could not resolve student phone for booking_id" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      }
    } else if (studentPhoneRaw) {
      // Backward-compat path; not recommended for privacy
      student_phone = studentPhoneRaw;
    } else {
      return new Response(JSON.stringify({ error: "Provide booking_id (preferred) or student_phone" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (!student_phone || !isE164(student_phone)) {
      return new Response(JSON.stringify({ error: "Resolved student phone is missing or not E.164 formatted" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    // TypeScript hint: at this point student_phone is a non-null string
    const studentPhone: string = student_phone;

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const callerId = Deno.env.get("TWILIO_CALLER_ID");

    if (!accountSid || !authToken || !callerId) {
      return new Response(JSON.stringify({ error: "Missing Twilio configuration on server" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // TwiML to dial the student once the counsellor answers.
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Dial callerId="${callerId}">${studentPhone}</Dial>\n</Response>`;

    // Build URL-encoded body for Twilio Calls API
    const body = new URLSearchParams({
      To: counsellor_phone,
      From: callerId,
      Twiml: twiml,
    });

    const url = `${TWILIO_BASE}/Accounts/${accountSid}/Calls.json`;
    const authHeader = "Basic " + btoa(`${accountSid}:${authToken}`);

    const twilioResp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await twilioResp.json();
    if (!twilioResp.ok) {
      return new Response(JSON.stringify({ error: "Twilio error", details: data }), {
        status: twilioResp.status,
        headers: { "content-type": "application/json" },
      });
    }

    // Do not include student phone in the response
    return new Response(JSON.stringify({ ok: true, twilio: { sid: data.sid, status: data.status } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad request", details: String(e) }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
});
