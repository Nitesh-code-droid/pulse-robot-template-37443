import { supabase } from '@/integrations/supabase/client';

export type QuestionnaireAnswers = {
  q1?: string;
  q2?: string;
  q3?: string;
  freeText?: string;
};

export type RankedCounsellor = {
  id: string;
  name: string;
  specialization: string;
  affiliation: string | null;
  location_match: boolean;
  ranking_score: number;
  fees?: number | null;
  experience_years?: number | null;
};

const normalize = (s?: string | null) => (s ?? '').toLowerCase();

function scoreForSpecialization(cSpec: string, answers: QuestionnaireAnswers, classified?: string): number {
  const spec = normalize(cSpec);
  let score = 0;
  const addIfIncludes = (txt?: string, weight = 0) => {
    if (!txt) return;
    if (spec.includes(normalize(txt))) score += weight;
  };
  // Highest priority weights
  addIfIncludes(answers.q1, 5);
  addIfIncludes(answers.q2, 3);
  addIfIncludes(answers.q3, 2);
  addIfIncludes(classified, 4);
  return score;
}

function scoreForLocation(affiliation: string | null, answers: QuestionnaireAnswers): { score: number; match: boolean } {
  const aff = normalize(affiliation);
  const pref = normalize(answers.q3);
  let match = false;
  let score = 0;
  if (pref.includes('on-campus') && aff.includes('on')) { match = true; score += 2; }
  if (pref.includes('off-campus') && aff.includes('off')) { match = true; score += 2; }
  return { score, match };
}

function smallSignals(fees?: number | null, experience?: number | null): number {
  let s = 0;
  if ((experience ?? 0) >= 5) s += 0.5;
  if (fees && fees > 600) s -= 0.25;
  return s;
}

async function classifyFreeText(text?: string): Promise<string | undefined> {
  if (!text || text.trim().length < 5) return undefined;
  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return typeof data?.label === 'string' ? data.label : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchLatestAnswers(profileId: string): Promise<QuestionnaireAnswers | null> {
  const { data, error } = await (supabase as any)
    .from('questionnaire_responses')
    .select('answers, free_text')
    .eq('student_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return null;
  const row = data[0] as any;
  return { ...(row.answers || {}), freeText: row.free_text } as QuestionnaireAnswers;
}

export async function getRankedCounsellors(profileId?: string): Promise<RankedCounsellor[]> {
  // 1) Pull counsellors with joined profile to map names
  const { data: details, error } = await (supabase as any)
    .from('counsellors')
    .select(`id, specialization, fees, affiliation, experience_years, profiles:profile_id(full_name, email)`) // map profiles by foreign key
    .limit(200);

  if (error) throw error;

  const answers = profileId ? (await fetchLatestAnswers(profileId)) ?? {} : {};
  const classified = await classifyFreeText(answers.freeText);

  const ranked: RankedCounsellor[] = (details ?? []).map((c: any) => {
    const specScore = scoreForSpecialization(c.specialization || '', answers, classified);
    const loc = scoreForLocation(c.affiliation || null, answers);
    const extras = smallSignals(c.fees, c.experience_years);
    const score = specScore + loc.score + extras;
    const name = c.profiles?.full_name || (c.profiles?.email ? `Dr. ${String(c.profiles.email).split('@')[0]}` : 'Counsellor');
    return {
      id: c.id,
      name,
      specialization: c.specialization || 'Mental Health Specialist',
      affiliation: c.affiliation ?? null,
      location_match: loc.match,
      ranking_score: Number(score.toFixed(2)),
      fees: c.fees,
      experience_years: c.experience_years,
    } as RankedCounsellor;
  });

  // Order by score desc, then experience desc, then lower fees
  ranked.sort((a, b) => (b.ranking_score - a.ranking_score) || ((b.experience_years ?? 0) - (a.experience_years ?? 0)) || ((a.fees ?? 0) - (b.fees ?? 0)));
  return ranked;
}
