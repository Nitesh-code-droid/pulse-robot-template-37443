import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { getRankedCounsellors } from '@/lib/counsellorRanking';

type QuestionnaireModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | undefined;
  onSuggestions?: (counsellorIds: string[]) => void;
};

type AnswerMap = {
  q1?: string;
  q2?: string;
  q3?: string;
  freeText?: string;
};

type CounsellorRow = {
  id: string;
  specialization: string;
  fees: number;
  affiliation: string;
  experience_years: number | null;
  is_available: boolean | null;
};

const keywordBuckets: Record<string, string[]> = {
  anxiety: ['anxiety', 'stress', 'panic', 'overwhelm', 'worry'],
  depression: ['depression', 'sad', 'low', 'hopeless', 'down'],
  relationships: ['relationship', 'friends', 'family', 'breakup', 'peer'],
  academics: ['exam', 'study', 'academic', 'grades', 'deadline'],
  sleep: ['sleep', 'insomnia', 'tired'],
};

function scoreCounsellor(row: CounsellorRow, answers: AnswerMap, classifiedLabel?: string): number {
  const specialization = row.specialization.toLowerCase();
  let score = 0;

  const addIfIncludes = (text: string, weight: number) => {
    if (specialization.includes(text)) score += weight;
  };

  if (answers.q1) addIfIncludes(answers.q1.toLowerCase(), 3);
  if (answers.q2) addIfIncludes(answers.q2.toLowerCase(), 2);
  if (answers.q3) addIfIncludes(answers.q3.toLowerCase(), 2);
  if (classifiedLabel) addIfIncludes(classifiedLabel.toLowerCase(), 4);

  // Availability and experience mild boosts
  if (row.is_available) score += 1;
  if ((row.experience_years ?? 0) >= 5) score += 1;

  // Slight penalty for very high fees (assume > 500)
  if (row.fees > 500) score -= 0.5;

  return score;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ open, onOpenChange, studentId, onSuggestions }) => {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [suggestedIds, setSuggestedIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const disabled = useMemo(() => submitting, [submitting]);

  const classifyFreeText = async (text: string): Promise<string | undefined> => {
    if (!text || text.trim().length < 5) return undefined;
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) return undefined;
      const data = await response.json();
      return typeof data?.label === 'string' ? data.label : undefined;
    } catch {
      return undefined;
    }
  };

  const persistResponses = async (payload: { student_id: string; answers: Record<string, unknown>; free_text?: string }) => {
    try {
      console.log('Attempting to save questionnaire with payload:', payload);
      const { data, error } = await (supabase as any)
        .from('questionnaire_responses')
        .insert(payload);
      
      if (error) {
        console.error('Supabase error saving questionnaire responses:', error);
        throw error;
      }
      console.log('Questionnaire responses saved successfully:', data);
      return data;
    } catch (err) {
      console.error('Error in persistResponses:', err);
      throw err;
    }
  };

  const fetchAndRankCounsellors = async (finalAnswers: AnswerMap, classifiedLabel?: string): Promise<string[]> => {
    // Use centralized ranking that returns mapped names
    try {
      const profileId = studentId; // Questionnaire receives profile.id as studentId
      const ranked = await getRankedCounsellors(profileId);
      // Return top 5 counsellor NAMES
      return ranked.slice(0, 5).map(r => r.name);
    } catch (e) {
      console.warn('Falling back to local ranking due to error:', e);
      const { data } = await (supabase as any).from('counsellors').select('id, specialization, fees, affiliation, experience_years, is_available');
      const rows = (data ?? []) as unknown as CounsellorRow[];
      const scored = rows.map((row) => ({ id: row.id, score: scoreCounsellor(row, finalAnswers, classifiedLabel) }));
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 5).map((s) => s.id);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const freeLabel = await classifyFreeText(answers.freeText ?? '');
      // Try to persist responses, but do not block on failure
      if (studentId) {
        try {
          console.log('Saving questionnaire for student:', studentId);
          await persistResponses({ student_id: studentId, answers: { q1: answers.q1, q2: answers.q2, q3: answers.q3 }, free_text: answers.freeText });
          console.log('Questionnaire saved successfully for student:', studentId);
        } catch (persistErr) {
          console.warn('Proceeding without saving questionnaire (will still show suggestions). Error:', persistErr);
        }
      }
      // Always proceed to compute suggestions
      const ids = await fetchAndRankCounsellors(answers, freeLabel);
      setSuggestedIds(ids);
      onSuggestions?.(ids);
      setSubmitted(true);
      setError(null);
      // mark completion for this browser
      try { localStorage.setItem('questionnaire_completed', '1'); } catch {}
    } catch (e) {
      console.error('Error in handleSubmit:', e);
      // Show blocking error; do not mark as completed or proceed
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setSuggestedIds(null);
      setAnswers({});
      setError(null);
      setStepIndex(0);
    }
  }, [open]);

  // Build conditional steps based on prior answers
  type Step = {
    key: 'q1' | 'q2' | 'q3' | 'freeText';
    label: string;
    canProceed: boolean;
    render: React.ReactNode;
  };

  const moodBranch = answers.q1 === 'Anxiety' || answers.q1 === 'Depression';

  const steps: Step[] = [
    {
      key: 'q1',
      label: 'Q1. Lorem ipsum dolor sit amet?',
      canProceed: Boolean(answers.q1),
      render: (
        <div className="space-y-3">
          <Label>Q1. Lorem ipsum dolor sit amet?</Label>
          <RadioGroup
            value={answers.q1}
            onValueChange={(v) => setAnswers((a) => ({ ...a, q1: v }))}
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Anxiety" id="q1-a" />
              <Label htmlFor="q1-a">Anxiety</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Depression" id="q1-b" />
              <Label htmlFor="q1-b">Depression</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Relationships" id="q1-c" />
              <Label htmlFor="q1-c">Relationships</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Academics" id="q1-d" />
              <Label htmlFor="q1-d">Academics</Label>
            </div>
          </RadioGroup>
        </div>
      ),
    },
    {
      key: 'q2',
      label: moodBranch ? 'Q2. Consectetur adipiscing elit?' : 'Q2. Amet, consectetur adipiscing elit?',
      canProceed: Boolean(answers.q2),
      render: (
        <div className="space-y-3">
          <Label>{moodBranch ? 'Q2. Consectetur adipiscing elit?' : 'Q2. Amet, consectetur adipiscing elit?'}</Label>
          <RadioGroup
            value={answers.q2}
            onValueChange={(v) => setAnswers((a) => ({ ...a, q2: v }))}
            className="grid grid-cols-2 gap-3"
          >
            {moodBranch ? (
              <>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Sleep" id="q2-a" />
                  <Label htmlFor="q2-a">Sleep</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Stress" id="q2-b" />
                  <Label htmlFor="q2-b">Stress</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Panic" id="q2-c" />
                  <Label htmlFor="q2-c">Panic</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Mood" id="q2-d" />
                  <Label htmlFor="q2-d">Mood</Label>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="On-Campus Support" id="q2-e" />
                  <Label htmlFor="q2-e">On-Campus Support</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Off-Campus Support" id="q2-f" />
                  <Label htmlFor="q2-f">Off-Campus Support</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Budget Focus" id="q2-g" />
                  <Label htmlFor="q2-g">Budget Focus</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded">
                  <RadioGroupItem value="Experienced Counsellor" id="q2-h" />
                  <Label htmlFor="q2-h">Experienced Counsellor</Label>
                </div>
              </>
            )}
          </RadioGroup>
        </div>
      ),
    },
    {
      key: 'q3',
      label: 'Q3. Sed do eiusmod tempor?',
      canProceed: Boolean(answers.q3),
      render: (
        <div className="space-y-3">
          <Label>Q3. Sed do eiusmod tempor?</Label>
          <RadioGroup
            value={answers.q3}
            onValueChange={(v) => setAnswers((a) => ({ ...a, q3: v }))}
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="On-Campus" id="q3-a" />
              <Label htmlFor="q3-a">On-Campus</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Off-Campus" id="q3-b" />
              <Label htmlFor="q3-b">Off-Campus</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Budget" id="q3-c" />
              <Label htmlFor="q3-c">Budget</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <RadioGroupItem value="Experience" id="q3-d" />
              <Label htmlFor="q3-d">Experience</Label>
            </div>
          </RadioGroup>
        </div>
      ),
    },
    {
      key: 'freeText',
      label: 'Optional: Type in your own words',
      canProceed: true,
      render: (
        <div className="space-y-2">
          <Label>If you prefer, type in your own words</Label>
          <Textarea
            placeholder="Describe how we can help. Lorem ipsum..."
            value={answers.freeText ?? ''}
            onChange={(e) => setAnswers((a) => ({ ...a, freeText: e.target.value }))}
            className="min-h-[96px]"
          />
        </div>
      ),
    },
  ];

  const atFirst = stepIndex === 0;
  const atLast = stepIndex === steps.length - 1;

  const goNext = () => {
    if (!steps[stepIndex].canProceed) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const goBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-3xl w-[92vw] max-w-[900px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Quick Check-in</DialogTitle>
          <DialogDescription>
            Answer a few short questions to personalize your support. This questionnaire is required to access your dashboard.
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-6">
            <div key={stepIndex} className="transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-bottom-1">
              <p className="text-sm text-muted-foreground mb-2">Step {stepIndex + 1} of {steps.length}</p>
              {steps[stepIndex].render}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter className="flex items-center justify-between gap-2">
              <Button variant="outline" onClick={goBack} disabled={atFirst || submitting} className="transition-transform duration-200 hover:scale-[1.02]">Back</Button>
              {!atLast ? (
                <Button onClick={goNext} disabled={!steps[stepIndex].canProceed || submitting} className="gradient-button transition-transform duration-200 hover:scale-[1.02]">Next</Button>
              ) : (
                <Button disabled={disabled} onClick={handleSubmit} className="gradient-button transition-transform duration-200 hover:scale-[1.02]">
                  {submitting ? 'Submitting...' : 'Complete & Get Suggestions'}
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-lg font-medium">Your personalized suggestions are ready</h3>
            <p className="text-sm text-muted-foreground">We used your answers to rank counsellors. You can proceed to booking; suggestions will be reflected there.</p>
            {suggestedIds && suggestedIds.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Top matches:</span>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {suggestedIds.map((id) => (
                    <div key={id} className="px-3 py-2 border rounded text-muted-foreground transition-all duration-200 hover:bg-muted/40">
                      <div className="font-medium">{id}</div>
                      <div className="text-xs text-muted-foreground">Suggested based on your responses</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => {
                console.log('Closing questionnaire modal');
                onOpenChange(false);
              }} className="gradient-button w-full transition-transform duration-200 hover:scale-[1.02]">Continue to Dashboard</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuestionnaireModal;


