-- Create questionnaire_responses table
create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_id uuid not null,
  answers jsonb not null,
  free_text text,
  constraint questionnaire_responses_student_fk
    foreign key (student_id) references public.profiles(id) on delete cascade
);

-- Enable RLS
alter table public.questionnaire_responses enable row level security;

-- Policies
create policy "Students can insert their own questionnaire responses"
  on public.questionnaire_responses
  for insert
  with check (auth.uid() = student_id);

create policy "Students can read their own questionnaire responses"
  on public.questionnaire_responses
  for select
  using (auth.uid() = student_id);

-- Optional: allow students to update their responses (not strictly needed)
create policy "Students can update their own questionnaire responses"
  on public.questionnaire_responses
  for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


