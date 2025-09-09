import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { record } = await req.json()
    
    // Extract user data from the auth.users record
    const userId = record.id
    const email = record.email
    const provider = record.app_metadata?.provider || 'email'
    const userName = record.user_metadata?.full_name || record.user_metadata?.name || null

    console.log(`Processing signup for user ${userId} with provider ${provider}`)

    // Determine role based on provider
    let role = 'student' // Default role
    
    // All users default to student role
    // Counsellors must be manually promoted by admin
    if (provider === 'google') {
      role = 'student'
    } else if (provider === 'email') {
      role = 'student'
    }

    // Insert profile record
    const { data, error } = await supabaseClient
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        name: userName,
        role: role,
        counsellor_exam_passed: false // Always false by default
      })

    if (error) {
      console.error('Error creating profile:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Successfully created profile for user ${userId} with role ${role}`)

    return new Response(
      JSON.stringify({ 
        message: 'Profile created successfully',
        userId: userId,
        role: role
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
