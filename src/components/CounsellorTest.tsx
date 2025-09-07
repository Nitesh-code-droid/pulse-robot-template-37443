import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Question = {
  id: string;
  prompt: string;
  type: 'mcq' | 'input';
  choices: { id: string; label: string }[] | null;
  correct_answer: string | null;
};

interface CounsellorTestProps {
  email: string;
  onPassed: () => void;
  onClosed: () => void;
}

const normalize = (s: string) => s.trim().toLowerCase();

const CounsellorTest: React.FC<CounsellorTestProps> = ({ email, onPassed, onClosed }) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let data: any[] | null = null;
        // Try RPC first
        const rpc = await (supabase as any).rpc('get_random_counsellor_questions', { sample_size: 30 });
        if (!rpc.error) {
          data = rpc.data as any[];
        } else {
          // Fallback to random SELECT if RPC missing
          const sel = await (supabase as any)
            .from('counsellor_questions')
            .select('id, prompt, type, choices, correct_answer')
            .order('created_at', { ascending: false });
          if (sel.error) throw sel.error;
          // Shuffle and take 30
          const shuffled = [...(sel.data ?? [])].sort(() => Math.random() - 0.5);
          data = shuffled.slice(0, 30);
        }
        const mapped = (data ?? []).map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
          type: q.type,
          choices: q.choices ?? null,
          correct_answer: q.correct_answer ?? null,
        })) as Question[];
        setQuestions(mapped);
      } catch (e) {
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const total = questions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const canSubmit = total > 0 && answeredCount === total;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      let correct = 0;
      const detail: any[] = [];
      for (const q of questions) {
        const given = answers[q.id] ?? '';
        let isCorrect = false;
        if (q.type === 'mcq') {
          isCorrect = q.correct_answer ? normalize(given) === normalize(q.correct_answer) : false;
        } else {
          if (q.correct_answer) {
            try {
              const pattern = new RegExp(q.correct_answer, 'i');
              isCorrect = pattern.test(given);
            } catch {
              isCorrect = normalize(given) === normalize(q.correct_answer);
            }
          }
        }
        if (isCorrect) correct += 1;
        detail.push({ question_id: q.id, answer: given, correct: isCorrect });
      }
      const computedScore = Math.round((correct / total) * 100);
      setScore(computedScore);
      setSubmitted(true);
      await (supabase as any).from('counsellor_test_attempts').insert({
        email,
        score: computedScore,
        total,
        answers: detail,
      });
      if (computedScore >= 80) {
        toast.success('Congrats! You passed. You can sign up now.');
        onPassed();
      } else {
        toast.error('Score below 80%. Please try again.');
      }
    } catch (e) {
      toast.error('Failed to submit attempt');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    onClosed();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="sm:max-w-3xl w-[92vw] max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Qualifying Test for Counsellors</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {loading && <p className="text-sm text-muted-foreground">Loading questions...</p>}
          {!loading && questions.map((q, idx) => (
            <div key={q.id} className="p-4 border rounded-lg">
              <div className="mb-2 font-medium">{idx + 1}. {q.prompt}</div>
              {q.type === 'mcq' ? (
                <RadioGroup value={answers[q.id] ?? ''} onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} className="grid grid-cols-1 gap-2">
                  {(q.choices ?? []).map((c) => (
                    <div key={c.id} className="flex items-center space-x-2 p-2 border rounded">
                      <RadioGroupItem value={c.id} id={`${q.id}-${c.id}`} />
                      <Label htmlFor={`${q.id}-${c.id}`}>{c.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={`input-${q.id}`}>Your answer</Label>
                  <Input id={`input-${q.id}`} value={answers[q.id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Progress value={total ? (answeredCount / total) * 100 : 0} />
          {!submitted ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={close} disabled={loading}>Close</Button>
              <Button className="gradient-button" onClick={handleSubmit} disabled={!canSubmit || loading}>Submit Test</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm">Score: <span className="font-semibold">{score}%</span> {score >= 80 ? '(Passed)' : '(Try again)'}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={close}>Close</Button>
                <Button onClick={() => { setSubmitted(false); setAnswers({}); }}>
                  Retake Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounsellorTest;


