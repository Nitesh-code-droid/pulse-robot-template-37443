import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, Calendar, MessageCircle, BookOpen, Activity, Clock, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuestionnaireModal from '@/components/QuestionnaireModal';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'student';
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isStudent || !profile?.id) return;
    const key = `questionnaire_completed:${profile.id}`;
    const sessionKey = `questionnaire_submitted_session:${profile.id}`;
    // Quick session check (protects immediately after submit)
    try {
      const s = sessionStorage.getItem(sessionKey);
      if (s === '1') {
        setShowQuestionnaire(false);
        return;
      }
    } catch {}
    // Then check localStorage as a quick check (namespaced per student)
    try {
      const localCompleted = localStorage.getItem(key);
      if (localCompleted === '1') {
        console.log('Questionnaire completed (localStorage namespaced check)');
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
          try { localStorage.setItem(key, '1'); } catch {}
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
      gradient: "from-primary to-primary/80"
    },
    {
      icon: Clock,
      title: "Set Availability",
      description: "Configure your available time slots for appointments",
      link: "/availability", 
      gradient: "from-healing-500 to-primary"
    }
  ];

  const stats = isStudent ? [
    { label: "AI Sessions", value: "12", icon: Brain },
    { label: "Resources Viewed", value: "8", icon: BookOpen },
    { label: "Forum Posts", value: "3", icon: MessageCircle },
    { label: "Wellness Score", value: "85%", icon: TrendingUp }
  ] : [
    { label: "Total Students", value: "24", icon: Users },
    { label: "This Week", value: "6", icon: Calendar },
    { label: "Avg Rating", value: "4.8", icon: Star },
    { label: "Active Hours", value: "32", icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {(isStudent ? studentFeatures : counsellorFeatures).map((feature, index) => (
              <Card key={index} className="group hover-lift overflow-hidden border-0 shadow-lg">
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                <CardHeader className="pb-4">
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
    </div>
  );
};

export default Dashboard;