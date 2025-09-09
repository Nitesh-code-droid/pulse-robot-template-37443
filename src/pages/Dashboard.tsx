import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, Calendar, MessageCircle, BookOpen, Activity, Clock, Star, TrendingUp, X, MapPin, Video, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuestionnaireModal from '@/components/QuestionnaireModal';
import ThemeToggle from '@/components/ThemeToggle';
import RealTimeSync from '@/components/RealTimeSync';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'student';
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    if (!isStudent || !profile?.id) return;
    
    // First check localStorage as a quick check
    try {
      const localCompleted = localStorage.getItem('questionnaire_completed');
      if (localCompleted === '1') {
        console.log('Questionnaire completed (localStorage check)');
        setShowQuestionnaire(false);
        return;
      }
    } catch (e) {
      console.log('localStorage check failed, proceeding to database check');
    }
    
    // Check if questionnaire was completed in database
    const checkQuestionnaireCompletion = async () => {
      try {
        console.log('Checking questionnaire completion for student:', profile.id);
        const { data, error } = await (supabase as any)
          .from('questionnaire_responses')
          .select('id')
          .eq('student_id', profile.id)
          .limit(1);
        
        if (error) {
          console.error('Error checking questionnaire completion:', error);
          setShowQuestionnaire(true);
          return;
        }
        
        console.log('Database response:', data);
        
        // If no responses found, show questionnaire
        if (!data || data.length === 0) {
          console.log('No questionnaire responses found, showing questionnaire');
          setShowQuestionnaire(true);
        } else {
          // Questionnaire completed, don't show it
          console.log('Questionnaire already completed, not showing');
          setShowQuestionnaire(false);
          // Also set localStorage for future quick checks
          try { localStorage.setItem('questionnaire_completed', '1'); } catch {}
        }
      } catch (error) {
        console.error('Error checking questionnaire completion:', error);
        setShowQuestionnaire(true);
      }
    };
    
    checkQuestionnaireCompletion();
  }, [isStudent, profile?.id]);

  const studentFeatures = [
    {
      icon: Brain,
      title: "AI First-Aid",
      description: "Get immediate mental health support with AI-powered guidance",
      link: "/chat",
      gradient: "from-calm-500 to-mindbridge-500",
      image: "/lovable-uploads/ai first support.jpg"
    },
    {
      icon: BookOpen,
      title: "Wellness Hub",
      description: "Access resources for stress, sleep, and mental wellness",
      link: "/resources",
      gradient: "from-healing-500 to-calm-400",
      image: "/lovable-uploads/wellnesshub.jpg"
    },
    {
      icon: Calendar,
      title: "Book Counsellor",
      description: "Schedule sessions with certified mental health professionals",
      link: "/booking",
      gradient: "from-mindbridge-500 to-healing-500",
      image: "/lovable-uploads/booking appoinmnet.jpg"
    },
    {
      icon: Users,
      title: "Peer Support",
      description: "Connect with other students in a safe, anonymous community",
      link: "/forum",
      gradient: "from-healing-400 to-mindbridge-400",
      image: "/lovable-uploads/peer support.jpg"
    }
  ];

  const counsellorFeatures = [
    {
      icon: Calendar,
      title: "Booking Details",
      description: "View and manage student appointment requests",
      link: "/counsellor-bookings",
      gradient: "from-primary to-primary/80",
      stats: "3 pending requests"
    },
    {
      icon: Clock,
      title: "Set Availability",
      description: "Configure your available time slots for appointments",
      link: "/availability", 
      gradient: "from-healing-500 to-primary",
      stats: "12 slots available"
    },
  ];

  // Dynamic stats that would update in real-time
  const [dynamicStats, setDynamicStats] = useState({
    student: {
      aiSessions: 12,
      resourcesViewed: 8,
      forumPosts: 3,
      wellnessScore: 85,
      nextSession: "Tomorrow at 2:00 PM",
      lastActivity: "2 hours ago"
    },
    counsellor: {
      totalStudents: 24,
      thisWeek: 6,
      avgRating: 4.8,
      activeHours: 32,
      pendingRequests: 3,
      nextSession: "Today at 4:00 PM"
    }
  });

  const stats = isStudent ? [
    { label: "AI Sessions", value: dynamicStats.student.aiSessions.toString(), icon: Brain, trend: "+2 this week" },
    { label: "Resources Viewed", value: dynamicStats.student.resourcesViewed.toString(), icon: BookOpen, trend: "+1 today" },
    { label: "Forum Posts", value: dynamicStats.student.forumPosts.toString(), icon: MessageCircle, trend: "Active" },
    { label: "Wellness Score", value: `${dynamicStats.student.wellnessScore}%`, icon: TrendingUp, trend: "+5% this week" }
  ] : [
    { label: "Total Students", value: dynamicStats.counsellor.totalStudents.toString(), icon: Users, trend: "+2 new" },
    { label: "This Week", value: dynamicStats.counsellor.thisWeek.toString(), icon: Calendar, trend: "6 sessions" },
    { label: "Avg Rating", value: dynamicStats.counsellor.avgRating.toString(), icon: Star, trend: "Excellent" },
    { label: "Pending Requests", value: dynamicStats.counsellor.pendingRequests.toString(), icon: Activity, trend: "Needs attention" }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicStats(prev => ({
        ...prev,
        student: {
          ...prev.student,
          lastActivity: "Just now"
        },
        counsellor: {
          ...prev.counsellor,
          pendingRequests: Math.max(0, prev.counsellor.pendingRequests + (Math.random() > 0.7 ? 1 : 0))
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Floating Theme Toggle - Always Visible */}
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-12">
        <GlobalButtons 
          sidebarOpen={sidebarOpen} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isStudent && (
            <QuestionnaireModal 
              open={showQuestionnaire} 
              onOpenChange={setShowQuestionnaire} 
              studentId={profile?.id}
            />
          )}
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Welcome back, {profile?.full_name}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              {isStudent 
                ? "Your mental wellness journey continues here. How are you feeling today?" 
                : "Ready to support students on their mental wellness journey?"
              }
            </p>
          </div>

          {/* Enhanced Upcoming Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card 
              className="wellness-card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer transform hover:scale-[1.02]"
              onClick={() => setShowSessionModal(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {isStudent ? "🗓️ Next Session" : "📅 Upcoming Session"}
                  </h3>
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors group-hover:rotate-12">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">
                    {isStudent ? dynamicStats.student.nextSession : dynamicStats.counsellor.nextSession}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {isStudent ? "with Dr. Sarah M." : "with Anonymous Student"}
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>60 minutes</span>
                  </div>
                  <div className="mt-3 text-xs text-primary font-medium opacity-75 group-hover:opacity-100 transition-opacity">
                    Click to view calendar →
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="wellness-card bg-gradient-to-br from-green-50 via-emerald-50 to-transparent dark:from-green-900/20 dark:via-emerald-900/10 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-green-600 transition-colors">
                    {isStudent ? "📈 Wellness Progress" : "🎯 Student Progress"}
                  </h3>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600 mb-2 group-hover:scale-105 transition-transform">
                    {isStudent ? `${dynamicStats.student.wellnessScore}%` : "Improving"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isStudent ? "Great progress this week!" : "Students showing positive trends"}
                  </div>
                  {isStudent && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${dynamicStats.student.wellnessScore}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="wellness-card hover-lift">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-xs text-primary font-medium">{stat.trend}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {(isStudent ? studentFeatures : counsellorFeatures).map((feature, index) => (
              <Card key={index} className="group wellness-card hover-lift overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                    {('stats' in feature) && feature.stats && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">{feature.stats}</div>
                        <div className="text-xs text-muted-foreground">Live updates</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {('image' in feature) && feature.image && (
                    <div className="mb-4 rounded-lg overflow-hidden relative aspect-[16/9]">
                      <img 
                        src={String(feature.image)} 
                        alt={feature.title}
                        className="absolute inset-0 w-full h-full object-cover object-center scale-110"
                      />
                    </div>
                  )}
                  <Link to={feature.link}>
                    <Button className="w-full gradient-button">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions for Students */}
          {isStudent && (
            <Card className="mt-12 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Mental Health Check</CardTitle>
                <CardDescription>
                  How are you feeling today? Get personalized support based on your current mood.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link to="/chat">
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                      😰 Anxious
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                      😔 Sad
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                      😴 Tired
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                      😤 Stressed
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                      🤔 Confused
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Support for Students */}
          {isStudent && (
            <Card className="mt-8 bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Need Immediate Help?</h3>
                <p className="text-red-700 mb-4">
                  If you're experiencing a mental health emergency, don't wait. Get help now.
                </p>
                <a 
                  href="tel:1800-891-4416" 
                  className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  📞 Call Tele-MANAS: 1800-891-4416
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Compact Session Calendar Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {isStudent ? "My Sessions" : "Scheduled Sessions"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your upcoming appointments
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSessionModal(false)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Compact Calendar */}
              <div className="space-y-3">
                {/* Today's Session */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">Today - 4:00 PM</p>
                      <p className="text-xs text-muted-foreground">
                        {isStudent ? "with Dr. Sarah M." : "with Student #2024001"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">30 min</Badge>
                </div>
                
                {/* Next Session - Highlighted */}
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-foreground">
                        {isStudent ? dynamicStats.student.nextSession : dynamicStats.counsellor.nextSession}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isStudent ? "with Dr. Sarah M." : "with Student #2024001"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">60 min</Badge>
                </div>
                
                {/* Friday Session */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">Friday - 3:00 PM</p>
                      <p className="text-xs text-muted-foreground">
                        {isStudent ? "with Dr. Sarah M." : "with Student #2024002"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">45 min</Badge>
                </div>
                
                {/* Next Week Sessions */}
                <div className="pt-3 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Next Week</p>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-foreground">Monday - 2:00 PM</p>
                        <p className="text-xs text-muted-foreground">
                          {isStudent ? "with Dr. Sarah M." : "with Student #2024003"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">60 min</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mt-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-foreground">Wednesday - 11:00 AM</p>
                        <p className="text-xs text-muted-foreground">
                          {isStudent ? "with Dr. Sarah M." : "with Student #2024004"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">30 min</Badge>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 p-3 bg-gradient-to-r from-primary/5 to-healing/5 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Sessions This Week:</span>
                  <span className="font-semibold text-foreground">3</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Next Available:</span>
                  <span className="font-semibold text-primary">
                    {isStudent ? "Friday 4:00 PM" : "Thursday 10:00 AM"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Real-time Sync Component */}
      <RealTimeSync />
    </div>
  );
};

export default Dashboard;