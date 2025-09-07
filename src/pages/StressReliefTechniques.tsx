import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle, Brain, Wind, Timer, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Link } from 'react-router-dom';

const StressReliefTechniques = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale, pause
  const [breathingCount, setBreathingCount] = useState(4);
  const [completedTechniques, setCompletedTechniques] = useState<string[]>([]);
  
  // Audio player state
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const techniques = [
    {
      id: 'breathing',
      title: '4-7-8 Breathing Technique',
      description: 'A powerful technique to reduce anxiety and promote relaxation',
      icon: Wind,
      steps: [
        'Exhale completely through your mouth',
        'Close your mouth and inhale through nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat 3-4 times'
      ]
    },
    {
      id: 'stretches',
      title: 'Quick Desk Stretches',
      description: 'Simple stretches you can do at your study desk',
      icon: Brain,
      steps: [
        'Neck rolls: Slowly roll your head in circles (5 each direction)',
        'Shoulder shrugs: Lift shoulders to ears, hold 5 seconds, release',
        'Wrist circles: Rotate wrists clockwise and counterclockwise',
        'Spinal twist: Sit tall, twist gently left and right',
        'Deep breathing: Take 5 deep breaths between stretches'
      ]
    }
  ];

  const calmingSounds = [
    { 
      name: 'Ocean Waves', 
      duration: '10:00', 
      description: 'Gentle ocean sounds for deep relaxation',
      url: 'https://www.soundjay.com/misc/sounds/ocean-wave-1.wav' // Placeholder URL
    },
    { 
      name: 'Forest Rain', 
      duration: '15:00', 
      description: 'Peaceful rainfall in a quiet forest',
      url: 'https://www.soundjay.com/misc/sounds/rain-1.wav' // Placeholder URL
    },
    { 
      name: 'Meditation Bells', 
      duration: '5:00', 
      description: 'Soft bells for mindful breathing',
      url: 'https://www.soundjay.com/misc/sounds/bell-1.wav' // Placeholder URL
    },
    { 
      name: 'White Noise', 
      duration: '20:00', 
      description: 'Consistent background noise for focus',
      url: 'https://www.soundjay.com/misc/sounds/white-noise.wav' // Placeholder URL
    },
    { 
      name: 'Nature Sounds', 
      duration: '12:00', 
      description: 'Birds chirping and gentle breeze',
      url: 'https://www.soundjay.com/misc/sounds/nature-1.wav' // Placeholder URL
    },
    { 
      name: 'Soft Piano', 
      duration: '8:00', 
      description: 'Calming piano melodies for study',
      url: 'https://www.soundjay.com/misc/sounds/piano-1.wav' // Placeholder URL
    }
  ];

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingCount(4);
  };

  const stopBreathingExercise = () => {
    setBreathingActive(false);
    setBreathingPhase('inhale');
    setBreathingCount(4);
  };

  const markTechniqueComplete = (techniqueId: string) => {
    if (!completedTechniques.includes(techniqueId)) {
      setCompletedTechniques([...completedTechniques, techniqueId]);
    }
  };

  // Audio player functions
  const playTrack = (index: number) => {
    if (currentTrack === index && isPlaying) {
      pauseTrack();
      return;
    }
    
    setCurrentTrack(index);
    setIsPlaying(true);
    
    // In a real app, you would load and play the actual audio file
    // For this prototype, we'll simulate audio playback
    if (audioRef.current) {
      audioRef.current.src = calmingSounds[index].url;
      audioRef.current.play().catch(() => {
        // Handle play error - for prototype, we'll just simulate
        console.log('Audio playback simulated for:', calmingSounds[index].name);
      });
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopTrack = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const nextTrack = () => {
    if (currentTrack !== null && currentTrack < calmingSounds.length - 1) {
      playTrack(currentTrack + 1);
    }
  };

  const previousTrack = () => {
    if (currentTrack !== null && currentTrack > 0) {
      playTrack(currentTrack - 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Simulate audio time updates for prototype
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack !== null) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const maxTime = parseInt(calmingSounds[currentTrack].duration.split(':')[0]) * 60 + 
                         parseInt(calmingSounds[currentTrack].duration.split(':')[1]);
          if (prev >= maxTime) {
            setIsPlaying(false);
            setCurrentTrack(null);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, calmingSounds]);

  useEffect(() => {
    if (currentTrack !== null) {
      const trackDuration = parseInt(calmingSounds[currentTrack].duration.split(':')[0]) * 60 + 
                           parseInt(calmingSounds[currentTrack].duration.split(':')[1]);
      setDuration(trackDuration);
    }
  }, [currentTrack, calmingSounds]);

  React.useEffect(() => {
    if (!breathingActive) return;

    const interval = setInterval(() => {
      setBreathingCount(prev => {
        if (prev > 1) return prev - 1;
        
        // Move to next phase
        if (breathingPhase === 'inhale') {
          setBreathingPhase('hold');
          return 7;
        } else if (breathingPhase === 'hold') {
          setBreathingPhase('exhale');
          return 8;
        } else if (breathingPhase === 'exhale') {
          setBreathingPhase('pause');
          return 2;
        } else {
          setBreathingPhase('inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase]);

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
              Stress Relief Techniques 🧘‍♀️
            </h1>
            <p className="text-xl text-muted-foreground">
              Quick and effective techniques to manage stress and anxiety in the moment.
            </p>
          </div>

          {/* Interactive Breathing Exercise */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="h-6 w-6 mr-2 text-primary" />
                Interactive 4-7-8 Breathing
              </CardTitle>
              <CardDescription>
                Follow along with this guided breathing exercise to calm your nervous system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="mb-6">
                  <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-1000 ${
                    breathingActive 
                      ? breathingPhase === 'inhale' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-110' 
                        : breathingPhase === 'hold'
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 scale-110'
                        : breathingPhase === 'exhale'
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20 scale-90'
                        : 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-border bg-card'
                  }`}>
                    {breathingActive ? breathingCount : <Timer className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  {breathingActive && (
                    <div className="mt-4">
                      <p className="text-lg font-medium capitalize text-foreground">{breathingPhase}</p>
                      <p className="text-sm text-muted-foreground">
                        {breathingPhase === 'inhale' && 'Breathe in slowly through your nose'}
                        {breathingPhase === 'hold' && 'Hold your breath gently'}
                        {breathingPhase === 'exhale' && 'Exhale slowly through your mouth'}
                        {breathingPhase === 'pause' && 'Brief pause before next cycle'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-4">
                  {!breathingActive ? (
                    <Button onClick={startBreathingExercise} className="gradient-button">
                      <Play className="h-4 w-4 mr-2" />
                      Start Exercise
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopBreathingExercise} variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button onClick={() => markTechniqueComplete('breathing')} className="gradient-button">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technique Cards */}
          <div className="grid gap-6 mb-8">
            {techniques.map((technique) => (
              <Card key={technique.id} className="wellness-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <technique.icon className="h-6 w-6 mr-2 text-primary" />
                      {technique.title}
                    </div>
                    {completedTechniques.includes(technique.id) && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  <CardDescription>{technique.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {technique.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <p className="text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => markTechniqueComplete(technique.id)}
                    className="w-full mt-4 gradient-button"
                    disabled={completedTechniques.includes(technique.id)}
                  >
                    {completedTechniques.includes(technique.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      'Mark as Completed'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calming Sounds Playlist */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-6 w-6 mr-2 text-primary" />
                Calming Sounds Playlist
              </CardTitle>
              <CardDescription>
                Background sounds to help you relax and focus while studying
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Audio Player Controls */}
              {currentTrack !== null && (
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-foreground">{calmingSounds[currentTrack].name}</h4>
                      <p className="text-sm text-muted-foreground">{calmingSounds[currentTrack].description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={previousTrack} disabled={currentTrack === 0}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => isPlaying ? pauseTrack() : playTrack(currentTrack)}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={nextTrack} disabled={currentTrack === calmingSounds.length - 1}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={stopTrack}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-3">
                    <Button size="sm" variant="ghost" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                  </div>
                </div>
              )}
              
              {/* Playlist */}
              <div className="grid md:grid-cols-2 gap-4">
                {calmingSounds.map((sound, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer hover:bg-accent/50 ${
                      currentTrack === index 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-accent border-border/50'
                    }`}
                    onClick={() => playTrack(index)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{sound.name}</h4>
                      <p className="text-sm text-muted-foreground">{sound.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-primary">{sound.duration}</p>
                      <Button size="sm" variant="outline" className="mt-1">
                        {currentTrack === index && isPlaying ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Prototype Notice */}
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  🎵 <strong>Audio Player Prototype:</strong> This demonstrates the audio player interface. In the full version, actual calming sound files would be loaded and played.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card className="wellness-card mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Progress</h3>
                <p className="text-muted-foreground mb-4">
                  You've completed {completedTechniques.length} out of {techniques.length} stress relief techniques
                </p>
                <div className="w-full bg-border rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedTechniques.length / techniques.length) * 100}%` }}
                  ></div>
                </div>
                {completedTechniques.length === techniques.length && (
                  <p className="text-primary font-medium">🎉 Congratulations! You've completed all stress relief techniques!</p>
                )}
                {currentTrack !== null && (
                  <p className="text-muted-foreground text-sm mt-2">
                    🎵 Currently playing: {calmingSounds[currentTrack].name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StressReliefTechniques;
