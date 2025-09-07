import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, CheckCircle, Clock, Smartphone, Coffee, Bed, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const SleepHygieneGuide = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [bedtimeSet, setBedtimeSet] = useState(false);
  const [selectedBedtime, setSelectedBedtime] = useState('22:00');

  const sleepChecklist = [
    {
      id: 'no-screens',
      title: 'No screens 1 hour before bed',
      description: 'Avoid phones, tablets, TV, and computers to reduce blue light exposure',
      icon: Smartphone,
      category: 'evening'
    },
    {
      id: 'fixed-bedtime',
      title: 'Set a consistent bedtime',
      description: 'Go to bed and wake up at the same time every day, even on weekends',
      icon: Clock,
      category: 'routine'
    },
    {
      id: 'no-caffeine',
      title: 'No caffeine after 2 PM',
      description: 'Avoid coffee, tea, energy drinks, and chocolate in the afternoon',
      icon: Coffee,
      category: 'diet'
    },
    {
      id: 'comfortable-environment',
      title: 'Create a sleep-friendly environment',
      description: 'Keep your room cool (60-67°F), dark, and quiet',
      icon: Bed,
      category: 'environment'
    },
    {
      id: 'bedtime-ritual',
      title: 'Develop a relaxing bedtime ritual',
      description: 'Read, meditate, or do gentle stretches 30 minutes before sleep',
      icon: Moon,
      category: 'ritual'
    }
  ];

  const bedtimeRituals = [
    {
      activity: 'Gentle Reading',
      duration: '15-20 minutes',
      description: 'Read a calming book (avoid exciting or stressful content)'
    },
    {
      activity: 'Meditation or Deep Breathing',
      duration: '10-15 minutes',
      description: 'Practice mindfulness or the 4-7-8 breathing technique'
    },
    {
      activity: 'Light Stretching',
      duration: '10 minutes',
      description: 'Gentle yoga poses or simple stretches to release tension'
    },
    {
      activity: 'Gratitude Journaling',
      duration: '5-10 minutes',
      description: 'Write down 3 things you\'re grateful for from the day'
    }
  ];

  const sleepTips = [
    'If you can\'t fall asleep within 20 minutes, get up and do a quiet activity until sleepy',
    'Keep a sleep diary to track patterns and identify what helps or hurts your sleep',
    'Exercise regularly, but not within 3 hours of bedtime',
    'Avoid large meals, alcohol, and excessive fluids before bedtime',
    'Use your bed only for sleep and relaxation, not for studying or work'
  ];

  const toggleChecklistItem = (itemId: string) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateSleepScore = () => {
    const baseScore = (checkedItems.length / sleepChecklist.length) * 80;
    const bedtimeBonus = bedtimeSet ? 20 : 0;
    return Math.round(baseScore + bedtimeBonus);
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
              Sleep Hygiene Guide 🌙
            </h1>
            <p className="text-xl text-muted-foreground">
              Build healthy sleep habits for better rest, focus, and academic performance.
            </p>
          </div>

          {/* Track Your Sleep - Main Feature Box */}
          <Card className="wellness-card mb-8 bg-healing-50 dark:bg-healing-900/20 border-healing-200 dark:border-healing-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Moon className="h-6 w-6 mr-2 text-healing-600 dark:text-healing-400" />
                Track Your Sleep
              </CardTitle>
              <CardDescription>
                Keep a detailed sleep diary to identify patterns and improve your sleep quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-4">
                  Monitor your bedtime, wake time, and how rested you feel. Track patterns to discover what works best for your sleep schedule.
                </p>
                <Link to="/wellness/sleep-diary">
                  <Button className="gradient-button">
                    <Calendar className="mr-2 h-4 w-4" />
                    Open Sleep Diary
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-semibold text-healing-600 dark:text-healing-400">📊</div>
                  <div className="text-sm text-muted-foreground">Sleep Analytics</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-semibold text-healing-600 dark:text-healing-400">📅</div>
                  <div className="text-sm text-muted-foreground">Calendar View</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-semibold text-healing-600 dark:text-healing-400">⭐</div>
                  <div className="text-sm text-muted-foreground">Quality Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Health Score */}
          <Card className="wellness-card mb-8 bg-healing-50 dark:bg-healing-900/20 border-healing-200 dark:border-healing-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 mr-2 text-healing-600 dark:text-healing-400" />
                Sleep Health Score
              </CardTitle>
              <CardDescription>
                Track your sleep hygiene habits and see your overall sleep health score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-healing-600 dark:text-healing-400 mb-2">
                  {calculateSleepScore()}%
                </div>
                <p className="text-muted-foreground">
                  {calculateSleepScore() >= 80 ? 'Excellent sleep hygiene!' : 
                   calculateSleepScore() >= 60 ? 'Good progress, keep it up!' : 
                   'Room for improvement'}
                </p>
              </div>
              <div className="w-full bg-border rounded-full h-3">
                <div 
                  className="bg-healing-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculateSleepScore()}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Bedtime Setter */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                Set Your Consistent Bedtime
              </CardTitle>
              <CardDescription>
                Choose a bedtime you can stick to every night, including weekends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="time"
                  value={selectedBedtime}
                  onChange={(e) => setSelectedBedtime(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <Button 
                  onClick={() => setBedtimeSet(true)}
                  className="gradient-button"
                  disabled={bedtimeSet}
                >
                  {bedtimeSet ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bedtime Set!
                    </>
                  ) : (
                    'Set Bedtime'
                  )}
                </Button>
              </div>
              {bedtimeSet && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Great! Your bedtime is set for {selectedBedtime}. Try to stick to this time every night.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sleep Hygiene Checklist */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle>Sleep Hygiene Checklist</CardTitle>
              <CardDescription>
                Check off the habits you're currently following. Aim to implement all of them gradually.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sleepChecklist.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-start p-4 rounded-lg border transition-all cursor-pointer ${
                      checkedItems.includes(item.id) 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-accent border-border hover:border-primary/20'
                    }`}
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mt-0.5 flex items-center justify-center ${
                      checkedItems.includes(item.id)
                        ? 'bg-primary border-primary text-white'
                        : 'border-border'
                    }`}>
                      {checkedItems.includes(item.id) && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <item.icon className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bedtime Ritual Ideas */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle>Relaxing Bedtime Ritual Ideas</CardTitle>
              <CardDescription>
                Choose 2-3 activities to create your personalized wind-down routine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {bedtimeRituals.map((ritual, index) => (
                  <div key={index} className="p-4 bg-accent rounded-lg border border-border/50">
                    <h4 className="font-medium text-foreground mb-1">{ritual.activity}</h4>
                    <p className="text-sm text-primary font-medium mb-2">{ritual.duration}</p>
                    <p className="text-sm text-muted-foreground">{ritual.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sleep Tips */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle>Additional Sleep Tips</CardTitle>
              <CardDescription>
                Extra strategies to improve your sleep quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sleepTips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default SleepHygieneGuide;
