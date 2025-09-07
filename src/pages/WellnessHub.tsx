import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Moon, Book, Heart, Play, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WellnessHub = () => {
  const resources = [
    {
      title: "Stress Relief Techniques",
      description: "Quick exercises to manage stress and anxiety",
      icon: Brain,
      type: "Interactive Guide",
      gradient: "from-calm-500 to-mindbridge-500",
      link: "/wellness/stress-relief"
    },
    {
      title: "Sleep Hygiene Guide",
      description: "Tips for better sleep quality and routine",
      icon: Moon,
      type: "Checklist",
      gradient: "from-healing-500 to-calm-400",
      link: "/wellness/sleep-hygiene"
    },
    {
      title: "Exam Stress Management",
      description: "Strategies for academic pressure",
      icon: Book,
      type: "Activities",
      gradient: "from-mindbridge-500 to-healing-500",
      link: "/wellness/exam-stress"
    },
    {
      title: "Guided Meditation",
      description: "5-minute breathing exercises",
      icon: Heart,
      type: "Audio Guide",
      gradient: "from-healing-400 to-mindbridge-400",
      link: "/wellness/meditation"
    }
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Floating Theme Toggle - Always Visible */}
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Wellness Hub – Balance Your Mind & Body 🌿
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a guide to explore healthy practices & stress relief techniques designed specifically for students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="wellness-card hover-lift group cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${resource.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <resource.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl text-foreground">{resource.title}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                      {resource.type}
                    </span>
                  </div>
                  <CardDescription className="text-muted-foreground mb-4">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={resource.link}>
                    <Button className="w-full gradient-button group">
                      Start Guide
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WellnessHub;