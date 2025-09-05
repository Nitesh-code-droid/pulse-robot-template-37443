-- Counsellor qualifying test schema
-- Ensure pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;
create table if not exists public.counsellor_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  type text not null check (type in ('mcq','input')),
  choices jsonb, -- for mcq, array of {id,label}
  correct_answer text, -- for mcq: choice id; for input: canonical answer or regex
  difficulty int2 default 1 check (difficulty between 1 and 5),
  category text, -- optional taxonomy
  created_at timestamptz default now()
);

create table if not exists public.counsellor_test_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  score numeric not null,
  total int2 not null,
  passed boolean generated always as (score >= 80) stored,
  answers jsonb not null, -- [{question_id, answer, correct}]
  created_at timestamptz default now()
);

-- Helpful index
create index if not exists idx_counsellor_attempts_email_created on public.counsellor_test_attempts(email, created_at desc);

-- Seed a few sample questions (actual app should seed ~150-100)
insert into public.counsellor_questions (prompt, type, choices, correct_answer, difficulty, category)
values
('Which of the following is a hallmark of cognitive behavioral therapy (CBT)?', 'mcq',
 '[{"id":"a","label":"Uncovering unconscious conflicts"},{"id":"b","label":"Challenging cognitive distortions"},{"id":"c","label":"Free association"},{"id":"d","label":"Dream interpretation"}]',
 'b', 2, 'therapy')
on conflict do nothing;

insert into public.counsellor_questions (prompt, type, choices, correct_answer, difficulty, category)
values
('Which screening tool is commonly used for depression in adults?', 'mcq',
 '[{"id":"a","label":"GAD-7"},{"id":"b","label":"PHQ-9"},{"id":"c","label":"AUDIT"},{"id":"d","label":"MMSE"}]',
 'b', 1, 'screening')
on conflict do nothing;

insert into public.counsellor_questions (prompt, type, correct_answer, difficulty, category)
values
('Name one immediate grounding technique for panic attacks.', 'input', '5-4-3-2-1|box breathing|deep breathing|name five things', 1, 'crisis')
on conflict do nothing;

-- RPC to fetch randomized 30-question set mixing mcq and input
create or replace function public.get_random_counsellor_questions(sample_size int default 30)
returns setof public.counsellor_questions
language sql
as $$
  select * from public.counsellor_questions
  order by random()
  limit sample_size;
$$;

grant execute on function public.get_random_counsellor_questions(int) to anon, authenticated;

-- RLS and policies
alter table public.counsellor_questions enable row level security;
alter table public.counsellor_test_attempts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where polname = 'counsellor_questions_read_all'
  ) then
    create policy counsellor_questions_read_all on public.counsellor_questions
      for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where polname = 'counsellor_attempts_insert_all'
  ) then
    create policy counsellor_attempts_insert_all on public.counsellor_test_attempts
      for insert to anon, authenticated with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where polname = 'counsellor_attempts_select_all'
  ) then
    create policy counsellor_attempts_select_all on public.counsellor_test_attempts
      for select to anon, authenticated using (true);
  end if;
end $$;

-- Bulk seed: 80 MCQ + 40 input dummy questions (customize later)
-- MCQs (80): choices A-D, correct cycles through a,b,c,d
insert into public.counsellor_questions (prompt, type, choices, correct_answer, difficulty, category)
select
  'MCQ Dummy Question #' || gs::text || ' — choose the best counselling practice.' as prompt,
  'mcq'::text as type,
  jsonb_build_array(
    jsonb_build_object('id','a','label','Option A'),
    jsonb_build_object('id','b','label','Option B'),
    jsonb_build_object('id','c','label','Option C'),
    jsonb_build_object('id','d','label','Option D')
  ) as choices,
  (array['a','b','c','d'])[(gs % 4) + 1] as correct_answer,
  ((gs % 5) + 1)::int2 as difficulty,
  'general' as category
from generate_series(1,80) as gs
on conflict do nothing;

-- Input (40): regex-style correct answers
insert into public.counsellor_questions (prompt, type, correct_answer, difficulty, category)
select
  'Input Dummy Question #' || gs::text || ' — name any valid grounding technique.' as prompt,
  'input'::text as type,
  '5-4-3-2-1|box breathing|deep breathing|progressive muscle relaxation|mindful naming' as correct_answer,
  ((gs % 5) + 1)::int2 as difficulty,
  'crisis' as category
from generate_series(1,40) as gs
on conflict do nothing;
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


