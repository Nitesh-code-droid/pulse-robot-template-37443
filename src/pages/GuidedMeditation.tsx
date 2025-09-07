import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Heart, Brain, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuidedMeditation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  const [selectedIntensity, setSelectedIntensity] = useState<'gentle' | 'moderate' | 'deep'>('moderate');
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);

  const meditationSessions = [
    {
      id: 'anxiety-relief',
      title: 'Anxiety Relief',
      duration: '5 minutes',
      description: 'Calm racing thoughts and reduce anxiety with guided breathing',
      icon: Heart,
      color: 'blue',
      script: [
        "Welcome to this anxiety relief meditation. Find a comfortable position and close your eyes if you feel comfortable doing so.",
        "Take a moment to notice your breath. Don't try to change it, just observe.",
        "Now, let's begin with some deep breathing. Breathe in slowly through your nose for 4 counts... 1, 2, 3, 4.",
        "Hold your breath gently for 4 counts... 1, 2, 3, 4.",
        "Now exhale slowly through your mouth for 6 counts... 1, 2, 3, 4, 5, 6.",
        "Continue this pattern. With each exhale, imagine releasing any tension or worry.",
        "If anxious thoughts arise, acknowledge them gently and return your focus to your breath.",
        "You are safe in this moment. You are exactly where you need to be.",
        "Continue breathing at your own pace, feeling more calm and centered with each breath.",
        "When you're ready, slowly open your eyes and take this sense of calm with you."
      ]
    },
    {
      id: 'focus-concentration',
      title: 'Focus & Concentration',
      duration: '7 minutes',
      description: 'Improve mental clarity and concentration for studying',
      icon: Brain,
      color: 'purple',
      script: [
        "Welcome to this focus and concentration meditation. Sit comfortably with your spine straight.",
        "Begin by taking three deep breaths to center yourself.",
        "Now, imagine your mind as a clear, still lake. Any distracting thoughts are like ripples on the surface.",
        "Focus your attention on a single point - perhaps your breath at the tip of your nose.",
        "When you notice your mind wandering, gently guide it back to this focal point.",
        "With each breath, your concentration grows stronger, like a muscle being exercised.",
        "Visualize your mind becoming sharper and more focused with each moment.",
        "See yourself studying with complete clarity and understanding.",
        "Your ability to concentrate is natural and powerful. Trust in this ability.",
        "Continue to breathe steadily, maintaining this focused awareness.",
        "When you're ready, slowly return your attention to the room, carrying this clarity with you."
      ]
    },
    {
      id: 'sleep-preparation',
      title: 'Sleep Preparation',
      duration: '10 minutes',
      description: 'Wind down and prepare your mind and body for restful sleep',
      icon: Waves,
      color: 'indigo',
      script: [
        "Welcome to this sleep preparation meditation. Make yourself comfortable in your bed or a quiet space.",
        "Close your eyes and take a deep, slow breath in... and let it out with a gentle sigh.",
        "Starting from the top of your head, begin to relax each part of your body.",
        "Feel your forehead smooth and relaxed. Let go of any tension around your eyes.",
        "Relax your jaw, your neck, and your shoulders. Let them drop and soften.",
        "Feel your arms becoming heavy and relaxed, from your shoulders down to your fingertips.",
        "Now relax your chest and back. With each breath, feel yourself sinking deeper into relaxation.",
        "Let your stomach soften, and feel your hips and legs becoming heavy and comfortable.",
        "Your whole body is now relaxed and ready for sleep.",
        "Imagine yourself in a peaceful place - perhaps a quiet beach or a serene forest.",
        "With each breath, you're becoming more drowsy and peaceful.",
        "Let go of the day's worries. Tomorrow will take care of itself.",
        "Allow yourself to drift into peaceful, restorative sleep."
      ]
    }
  ];

  const breathingExercises = [
    {
      name: '4-7-8 Technique',
      description: 'Inhale for 4, hold for 7, exhale for 8. Great for anxiety.',
      steps: ['Inhale through nose (4 counts)', 'Hold breath (7 counts)', 'Exhale through mouth (8 counts)', 'Repeat 3-4 times']
    },
    {
      name: 'Box Breathing',
      description: 'Equal counts for inhale, hold, exhale, hold. Builds focus.',
      steps: ['Inhale (4 counts)', 'Hold (4 counts)', 'Exhale (4 counts)', 'Hold (4 counts)']
    },
    {
      name: 'Belly Breathing',
      description: 'Deep diaphragmatic breathing for relaxation.',
      steps: ['Place one hand on chest, one on belly', 'Breathe so only belly hand moves', 'Inhale slowly through nose', 'Exhale slowly through mouth']
    }
  ];

  useEffect(() => {
    if (!isPlaying || !activeSession) return;

    const interval = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        // Auto-advance script based on timing
        const session = meditationSessions.find(s => s.id === activeSession);
        if (session) {
          const baseInterval = selectedIntensity === 'gentle' ? 45 : selectedIntensity === 'moderate' ? 30 : 20;
          const newScriptIndex = Math.floor(newTime / baseInterval);
          if (newScriptIndex !== currentScriptIndex && newScriptIndex < session.script.length) {
            setCurrentScriptIndex(newScriptIndex);
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, activeSession, selectedIntensity, currentScriptIndex]);

  const startSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setSessionTime(0);
    setCurrentScriptIndex(0);
    setIsPlaying(true);
    setShowCustomization(false);
  };

  const startCustomSession = (sessionId: string) => {
    const session = meditationSessions.find(s => s.id === sessionId);
    if (session) {
      // Apply customizations
      const customScript = getCustomizedScript(session.script, selectedDuration, selectedIntensity);
      // Update the session with custom script (in a real app, this would be handled differently)
      startSession(sessionId);
    }
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const stopSession = () => {
    if (activeSession && sessionTime > 60) { // Mark as completed if played for more than 1 minute
      setCompletedSessions(prev => [...new Set([...prev, activeSession])]);
    }
    setActiveSession(null);
    setSessionTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentScript = () => {
    const session = meditationSessions.find(s => s.id === activeSession);
    if (!session) return '';
    
    // Adjust script timing based on selected duration and intensity
    const baseInterval = selectedIntensity === 'gentle' ? 45 : selectedIntensity === 'moderate' ? 30 : 20;
    const scriptIndex = Math.floor(sessionTime / baseInterval);
    return session.script[scriptIndex] || session.script[session.script.length - 1];
  };

  const getCustomizedScript = (baseScript: string[], duration: number, intensity: string) => {
    // Customize script based on user preferences
    let customScript = [...baseScript];
    
    if (intensity === 'gentle') {
      // Add more pauses and gentle language
      customScript = customScript.map(line => 
        line.includes('breathe') ? line + ' Take your time with each breath.' : line
      );
    } else if (intensity === 'deep') {
      // Add more focused and intensive guidance
      customScript = customScript.map(line => 
        line.includes('focus') ? line + ' Concentrate deeply on this sensation.' : line
      );
    }
    
    // Adjust for duration
    if (duration < 5) {
      customScript = customScript.slice(0, Math.ceil(customScript.length * 0.6));
    } else if (duration > 10) {
      // Add extended content for longer sessions
      const extensions = [
        'Continue to deepen your practice with each breath.',
        'Allow yourself to go even deeper into this peaceful state.',
        'Feel the benefits of this practice spreading throughout your entire being.'
      ];
      customScript = [...customScript, ...extensions];
    }
    
    return customScript;
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
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
              Guided Meditation 🧘‍♀️
            </h1>
            <p className="text-xl text-muted-foreground">
              Find peace and clarity through guided meditation sessions and breathing exercises.
            </p>
          </div>

          {/* Active Session Player */}
          {activeSession && (
            <Card className="wellness-card mb-8 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Now Playing: {meditationSessions.find(s => s.id === activeSession)?.title}</span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={isPlaying ? pauseSession : resumeSession}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={stopSession}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">{formatTime(sessionTime)}</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {selectedIntensity.charAt(0).toUpperCase() + selectedIntensity.slice(1)} intensity • {selectedDuration} minutes
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((sessionTime / (selectedDuration * 60)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-accent/30 rounded-lg p-6 text-center relative">
                  <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                    Step {currentScriptIndex + 1} of {meditationSessions.find(s => s.id === activeSession)?.script.length}
                  </div>
                  <p className="text-lg text-foreground leading-relaxed">
                    {getCurrentScript()}
                  </p>
                  
                  {/* Breathing indicator for breathing-related sessions */}
                  {activeSession === 'anxiety-relief' && isPlaying && (
                    <div className="mt-6">
                      <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-8 h-8 bg-primary rounded-full animate-ping"></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Follow the rhythm</p>
                    </div>
                  )}
                </div>
                
                {/* Session insights */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">Progress</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((sessionTime / (selectedDuration * 60)) * 100)}%
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">Remaining</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(Math.max(0, (selectedDuration * 60) - sessionTime))}
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">Focus Level</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {selectedIntensity}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customization Panel */}
          <Card className="wellness-card mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Customize Your Experience</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowCustomization(!showCustomization)}
                >
                  {showCustomization ? 'Hide' : 'Show'} Options
                </Button>
              </CardTitle>
            </CardHeader>
            {showCustomization && (
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Session Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map(duration => (
                      <Button
                        key={duration}
                        size="sm"
                        variant={selectedDuration === duration ? "default" : "outline"}
                        onClick={() => setSelectedDuration(duration)}
                      >
                        {duration} min
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Guidance Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'gentle', label: 'Gentle', desc: 'Slower pace, more pauses' },
                      { key: 'moderate', label: 'Moderate', desc: 'Balanced guidance' },
                      { key: 'deep', label: 'Deep', desc: 'Intensive focus' }
                    ].map(intensity => (
                      <Button
                        key={intensity.key}
                        size="sm"
                        variant={selectedIntensity === intensity.key ? "default" : "outline"}
                        onClick={() => setSelectedIntensity(intensity.key as any)}
                        className="h-auto p-3 flex flex-col"
                      >
                        <span className="font-medium">{intensity.label}</span>
                        <span className="text-xs text-muted-foreground mt-1">{intensity.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Meditation Sessions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {meditationSessions.map((session) => (
              <Card key={session.id} className="wellness-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <session.icon className={`h-6 w-6 mr-2 text-${session.color}-500`} />
                    {session.title}
                  </CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                      {showCustomization ? `${selectedDuration} min` : session.duration}
                    </span>
                    {completedSessions.includes(session.id) && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  {showCustomization && (
                    <div className="mb-4 p-3 bg-accent/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Customized for:</div>
                      <div className="text-sm font-medium text-foreground">
                        {selectedDuration} min • {selectedIntensity} intensity
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => showCustomization ? startCustomSession(session.id) : startSession(session.id)}
                    className="w-full gradient-button"
                    disabled={activeSession === session.id && isPlaying}
                  >
                    {activeSession === session.id && isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {showCustomization ? 'Start Custom Session' : 'Start Session'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Breathing Exercises */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle>Quick Breathing Exercises</CardTitle>
              <CardDescription>
                Simple techniques you can use anytime to center yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {breathingExercises.map((exercise, index) => (
                  <div key={index} className="p-4 bg-accent rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {exercise.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card className="wellness-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Meditation Journey</h3>
                <p className="text-muted-foreground mb-4">
                  You've completed {completedSessions.length} out of {meditationSessions.length} meditation sessions
                </p>
                <div className="w-full bg-border rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSessions.length / meditationSessions.length) * 100}%` }}
                  ></div>
                </div>
                
                {/* Personalized recommendations */}
                <div className="mt-6 p-4 bg-background/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Recommended for You</h4>
                  <p className="text-sm text-muted-foreground">
                    {completedSessions.length === 0 
                      ? "Start with 'Anxiety Relief' for a gentle introduction to meditation."
                      : completedSessions.includes('anxiety-relief') && !completedSessions.includes('focus-concentration')
                      ? "Try 'Focus & Concentration' to enhance your study sessions."
                      : completedSessions.includes('focus-concentration') && !completedSessions.includes('sleep-preparation')
                      ? "End your day peacefully with 'Sleep Preparation'."
                      : "Experiment with different durations and intensities to find your perfect practice."
                    }
                  </p>
                </div>
                
                {completedSessions.length === meditationSessions.length && (
                  <p className="text-primary font-medium mt-4">🧘‍♀️ Congratulations! You've completed all meditation sessions!</p>
                )}
                
                {activeSession && (
                  <p className="text-muted-foreground text-sm mt-2">
                    🎵 Currently meditating: {meditationSessions.find(s => s.id === activeSession)?.title}
                  </p>
                )}
              </div>

              {/* Enhanced Prototype Notice */}
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  🧘‍♀️ <strong>Enhanced Meditation Experience:</strong> This prototype features dynamic content that adapts to your preferences. The full version would include audio guidance, background sounds, and personalized meditation paths based on your progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GuidedMeditation;
