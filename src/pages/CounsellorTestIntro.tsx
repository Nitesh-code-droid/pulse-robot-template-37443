import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';

const CounsellorTestIntro: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    navigate(`/counsellor-test?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-mindbridge-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-display font-bold">Enroll for the Counsellor Qualifying Test</CardTitle>
            <CardDescription>Score at least 80% to become eligible to sign up as a counsellor.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                • 30 questions (MCQ + input). Randomized each attempt.
                <br />• You need an email so we can tie your result to your signup.
              </div>
              <form onSubmit={start} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email for test result</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <Button type="submit" className="w-full gradient-button">I’m ready – Start test</Button>
              </form>
              <div className="text-center text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">Back to login</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CounsellorTestIntro;


