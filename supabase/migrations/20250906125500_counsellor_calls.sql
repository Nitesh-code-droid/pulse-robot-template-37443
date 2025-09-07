-- Create table for counsellor call logs
create extension if not exists pgcrypto;

create table if not exists public.counsellor_calls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  counsellor_user_id uuid not null, -- auth.users.id of the counsellor
  booking_id uuid,                  -- optional: if linked to a booking entity
  student_phone_last4 text,         -- store last4 only for privacy
  student_phone_hash text,          -- salted hash for dedup/analytics
  counsellor_phone_last4 text,
  counsellor_phone_hash text,
  twilio_call_sid text,             -- returned by Twilio
  status text default 'initiated',  -- initiated|ringing|in-progress|completed|busy|failed|no-answer|canceled
  raw_response jsonb                -- store Twilio payload for debugging
);

-- Indexes
create index if not exists idx_counsellor_calls_user_created on public.counsellor_calls(counsellor_user_id, created_at desc);
create index if not exists idx_counsellor_calls_status on public.counsellor_calls(status);

-- Enable RLS
alter table public.counsellor_calls enable row level security;

-- Policies: Counsellor can insert/select their own rows
create policy if not exists counsellor_calls_insert_self
  on public.counsellor_calls
  for insert to authenticated
  with check (counsellor_user_id = auth.uid());

create policy if not exists counsellor_calls_select_self
  on public.counsellor_calls
  for select to authenticated
  using (counsellor_user_id = auth.uid());
