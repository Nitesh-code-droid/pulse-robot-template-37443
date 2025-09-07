import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Timer, PenTool, Star, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExamStressManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  const studyBreakCycle = {
    work: 25, // minutes
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4
  };

  const motivationalQuotes = [
    "You are capable of amazing things. One step at a time. 🌟",
    "Progress, not perfection. Every small effort counts. 💪",
    "Your future self will thank you for not giving up today. 🎯",
    "Stress is temporary, but your education lasts forever. 📚",
    "You've overcome challenges before. You can do this too. 🚀",
    "Take a deep breath. You're exactly where you need to be. 🌸",
    "Every expert was once a beginner. Keep learning. 🎓",
    "Your hard work will pay off. Trust the process. ✨"
  ];

  const journalPrompts = [
    "What specific thoughts are making me feel anxious about this exam?",
    "What are three things I've already learned well for this subject?",
    "How can I break down my study material into smaller, manageable chunks?",
    "What would I tell a friend who was feeling the same way I am right now?",
    "What's the worst that could realistically happen, and how would I handle it?",
    "What study methods have worked best for me in the past?",
    "How can I reward myself after completing my study goals today?"
  ];

  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [currentPrompt, setCurrentPrompt] = useState(journalPrompts[0]);

  useEffect(() => {
    if (!pomodoroActive) return;

    const interval = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev > 0) return prev - 1;
        
        // Time's up - switch phases
        if (pomodoroPhase === 'work') {
          const newCount = pomodoroCount + 1;
          setPomodoroCount(newCount);
          setPomodoroPhase('break');
          
          // Determine break length
          const isLongBreak = newCount % studyBreakCycle.cyclesBeforeLongBreak === 0;
          return (isLongBreak ? studyBreakCycle.longBreak : studyBreakCycle.shortBreak) * 60;
        } else {
          setPomodoroPhase('work');
          return studyBreakCycle.work * 60;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroPhase, pomodoroCount]);

  const startPomodoro = () => {
    setPomodoroActive(true);
  };

  const pausePomodoro = () => {
    setPomodoroActive(false);
  };

  const resetPomodoro = () => {
    setPomodoroActive(false);
    setPomodoroTime(25 * 60);
    setPomodoroPhase('work');
    setPomodoroCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
  };

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    setCurrentPrompt(journalPrompts[randomIndex]);
  };

  const saveJournalEntry = () => {
    // In a real app, this would save to a database
    localStorage.setItem('examStressJournal', journalEntry);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/resources" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wellness Hub
            </Link>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Exam Stress Management 📚
            </h1>
            <p className="text-xl text-muted-foreground">
              Effective strategies to manage academic pressure and study more efficiently.
            </p>
          </div>

          {/* Pomodoro Timer */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="h-6 w-6 mr-2 text-primary" />
                Pomodoro Study Timer
              </CardTitle>
              <CardDescription>
                Study in focused 25-minute blocks with regular breaks to maintain concentration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`w-40 h-40 mx-auto rounded-full border-8 flex flex-col items-center justify-center mb-6 transition-all duration-300 ${
                  pomodoroPhase === 'work' 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-green-400 bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className="text-3xl font-bold text-foreground">{formatTime(pomodoroTime)}</div>
                  <div className="text-sm text-muted-foreground capitalize">{pomodoroPhase}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Cycle {pomodoroCount}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {pomodoroPhase === 'work' 
                      ? 'Focus time! Eliminate distractions and dive deep into your studies.'
                      : `Break time! ${pomodoroCount % studyBreakCycle.cyclesBeforeLongBreak === 0 ? 'Take a longer break - you\'ve earned it!' : 'Take a short break to recharge.'}`
                    }
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  {!pomodoroActive ? (
                    <Button onClick={startPomodoro} className="gradient-button">
                      <Play className="h-4 w-4 mr-2" />
                      Start Focus Session
                    </Button>
                  ) : (
                    <Button onClick={pausePomodoro} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetPomodoro} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anxiety Journaling */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="h-6 w-6 mr-2 text-primary" />
                Anxiety Journaling
              </CardTitle>
              <CardDescription>
                Write down your worries to process them and gain perspective
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="font-medium text-foreground mb-2">Today's Prompt:</h4>
                <p className="text-muted-foreground italic mb-4">"{currentPrompt}"</p>
                <Button onClick={getRandomPrompt} variant="outline" size="sm">
                  Get New Prompt
                </Button>
              </div>
              
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Write your thoughts here... Remember, this is a safe space to express any worries or concerns."
                className="min-h-[120px] mb-4"
              />
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Your entries are private and stored locally on your device
                </p>
                <Button 
                  onClick={saveJournalEntry}
                  className="gradient-button"
                  disabled={!journalEntry.trim()}
                >
                  {journalSaved ? 'Saved!' : 'Save Entry'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Motivation Booster */}
          <Card className="wellness-card mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 mr-2 text-primary" />
                Motivation Booster
              </CardTitle>
              <CardDescription>
                Need a quick confidence boost? Here's a reminder of your strength
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="bg-card border border-border/50 rounded-lg p-6 mb-4">
                  <p className="text-lg text-foreground italic">"{currentQuote}"</p>
                </div>
                <Button onClick={getRandomQuote} className="gradient-button">
                  Get New Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Strategies */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="wellness-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stress Relief</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                    <p className="text-sm text-muted-foreground">Take 5 deep breaths (4 counts in, 6 counts out)</p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                    <p className="text-sm text-muted-foreground">Do 10 jumping jacks to release physical tension</p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                    <p className="text-sm text-muted-foreground">Drink a glass of water and stretch your neck</p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                    <p className="text-sm text-muted-foreground">Remind yourself: "I am prepared and capable"</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="wellness-card">
              <CardHeader>
                <CardTitle className="text-lg">Effective Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">📝</span>
                    <p className="text-sm text-muted-foreground">Create summary sheets for each topic</p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">🎯</span>
                    <p className="text-sm text-muted-foreground">Focus on understanding, not memorizing</p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">👥</span>
                    <p className="text-sm text-muted-foreground">Study with friends to test each other</p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">🏆</span>
                    <p className="text-sm text-muted-foreground">Reward yourself after study sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Support */}
          <Card className="wellness-card bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Feeling Overwhelmed?</h3>
              <p className="text-muted-foreground mb-4">
                Remember: One exam doesn't define you. If stress becomes too much, reach out for support.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/chat">
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    Talk to AI Counselor
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button className="gradient-button">
                    Book Professional Help
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExamStressManagement;
