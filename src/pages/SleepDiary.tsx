import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Moon, Sun, Clock, Star, Plus, ChevronLeft, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepQuality: number;
  mood: string;
  notes: string;
  hoursSlept: number;
}

const SleepDiary = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([
    {
      date: '2024-01-15',
      bedtime: '23:30',
      wakeTime: '07:00',
      sleepQuality: 4,
      mood: 'Refreshed',
      notes: 'Good night sleep, felt well-rested',
      hoursSlept: 7.5
    },
    {
      date: '2024-01-14',
      bedtime: '00:15',
      wakeTime: '06:45',
      sleepQuality: 3,
      mood: 'Tired',
      notes: 'Stayed up late studying, felt groggy in the morning',
      hoursSlept: 6.5
    },
    {
      date: '2024-01-13',
      bedtime: '22:45',
      wakeTime: '07:15',
      sleepQuality: 5,
      mood: 'Energetic',
      notes: 'Perfect sleep schedule, woke up naturally',
      hoursSlept: 8.5
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    bedtime: '',
    wakeTime: '',
    sleepQuality: 3,
    mood: '',
    notes: ''
  });

  const moods = ['Energetic', 'Refreshed', 'Neutral', 'Tired', 'Exhausted'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEntryForDate = (date: string) => {
    return sleepEntries.find(entry => entry.date === date);
  };

  const calculateHoursSlept = (bedtime: string, wakeTime: string) => {
    if (!bedtime || !wakeTime) return 0;
    
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    
    let bedTimeMinutes = bedHour * 60 + bedMin;
    let wakeTimeMinutes = wakeHour * 60 + wakeMin;
    
    // Handle overnight sleep
    if (wakeTimeMinutes < bedTimeMinutes) {
      wakeTimeMinutes += 24 * 60;
    }
    
    return (wakeTimeMinutes - bedTimeMinutes) / 60;
  };

  const handleSaveEntry = () => {
    if (!selectedDate || !newEntry.bedtime || !newEntry.wakeTime) return;
    
    const hoursSlept = calculateHoursSlept(newEntry.bedtime, newEntry.wakeTime);
    const dateString = formatDate(selectedDate);
    
    const entry: SleepEntry = {
      date: dateString,
      bedtime: newEntry.bedtime,
      wakeTime: newEntry.wakeTime,
      sleepQuality: newEntry.sleepQuality,
      mood: newEntry.mood,
      notes: newEntry.notes,
      hoursSlept: Math.round(hoursSlept * 10) / 10
    };

    setSleepEntries(prev => {
      const filtered = prev.filter(e => e.date !== dateString);
      return [...filtered, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    setShowEntryForm(false);
    setNewEntry({
      bedtime: '',
      wakeTime: '',
      sleepQuality: 3,
      mood: '',
      notes: ''
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = formatDate(date);
      const entry = getEntryForDate(dateString);
      const isToday = dateString === formatDate(new Date());
      const isSelected = selectedDate && formatDate(selectedDate) === dateString;

      days.push(
        <div
          key={day}
          className={`h-12 border border-border/30 cursor-pointer transition-all hover:bg-accent/50 flex items-center justify-center relative ${
            isToday ? 'bg-primary/20 border-primary/50' : ''
          } ${isSelected ? 'bg-primary/30 border-primary' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            setShowEntryForm(true);
            if (entry) {
              setNewEntry({
                bedtime: entry.bedtime,
                wakeTime: entry.wakeTime,
                sleepQuality: entry.sleepQuality,
                mood: entry.mood,
                notes: entry.notes
              });
            }
          }}
        >
          <span className="text-sm font-medium text-foreground">{day}</span>
          {entry && (
            <div className="absolute bottom-1 right-1">
              <div className={`w-2 h-2 rounded-full ${
                entry.sleepQuality >= 4 ? 'bg-green-500' : 
                entry.sleepQuality >= 3 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const getAverageStats = () => {
    if (sleepEntries.length === 0) return { avgHours: 0, avgQuality: 0 };
    
    const totalHours = sleepEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0);
    const totalQuality = sleepEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0);
    
    return {
      avgHours: Math.round((totalHours / sleepEntries.length) * 10) / 10,
      avgQuality: Math.round((totalQuality / sleepEntries.length) * 10) / 10
    };
  };

  const stats = getAverageStats();

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/wellness/sleep-hygiene" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sleep Hygiene Guide
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Sleep Diary 🌙
            </h1>
            <p className="text-muted-foreground">
              Track your sleep patterns and improve your sleep quality over time
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="wellness-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-primary" />
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigateMonth('next')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Click on any date to add or view your sleep entry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Good Sleep (4-5★)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Fair Sleep (3★)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Poor Sleep (1-2★)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats & Recent Entries */}
            <div className="space-y-6">
              {/* Sleep Stats */}
              <Card className="wellness-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Sleep Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.avgHours}h</div>
                    <div className="text-sm text-muted-foreground">Average Sleep</div>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center">
                      {stats.avgQuality}
                      <Star className="h-5 w-5 ml-1 text-yellow-500" />
                    </div>
                    <div className="text-sm text-muted-foreground">Average Quality</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{sleepEntries.length}</div>
                    <div className="text-sm text-muted-foreground">Total Entries</div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Entries */}
              <Card className="wellness-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Recent Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sleepEntries.slice(0, 3).map((entry, index) => (
                      <div key={index} className="p-3 bg-accent rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium text-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < entry.sleepQuality ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.hoursSlept}h sleep • {entry.mood}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sleep Entry Form Modal */}
          {showEntryForm && selectedDate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="wellness-card w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Moon className="h-5 w-5 mr-2 text-primary" />
                      Sleep Entry
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowEntryForm(false)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Bedtime
                      </label>
                      <Input
                        type="time"
                        value={newEntry.bedtime}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, bedtime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Wake Time
                      </label>
                      <Input
                        type="time"
                        value={newEntry.wakeTime}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, wakeTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Sleep Quality
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setNewEntry(prev => ({ ...prev, sleepQuality: rating }))}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              rating <= newEntry.sleepQuality 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Morning Mood
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {moods.map(mood => (
                        <Button
                          key={mood}
                          size="sm"
                          variant={newEntry.mood === mood ? "default" : "outline"}
                          onClick={() => setNewEntry(prev => ({ ...prev, mood }))}
                        >
                          {mood}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="How did you sleep? Any factors that affected your sleep?"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {newEntry.bedtime && newEntry.wakeTime && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Sleep Time</div>
                      <div className="text-lg font-semibold text-primary">
                        {calculateHoursSlept(newEntry.bedtime, newEntry.wakeTime).toFixed(1)} hours
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowEntryForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gradient-button"
                      onClick={handleSaveEntry}
                      disabled={!newEntry.bedtime || !newEntry.wakeTime}
                    >
                      Save Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SleepDiary;
