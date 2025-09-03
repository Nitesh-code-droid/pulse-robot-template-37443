import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Moon, Book, Heart, Play, FileText } from 'lucide-react';

const WellnessHub = () => {
  const resources = [
    {
      title: "Stress Relief Techniques",
      description: "Quick exercises to manage stress and anxiety",
      icon: Brain,
      type: "Guide",
      gradient: "from-calm-500 to-mindbridge-500"
    },
    {
      title: "Sleep Hygiene Guide",
      description: "Tips for better sleep quality and routine",
      icon: Moon,
      type: "Article",
      gradient: "from-healing-500 to-calm-400"
    },
    {
      title: "Exam Stress Management",
      description: "Strategies for academic pressure",
      icon: Book,
      type: "PDF",
      gradient: "from-mindbridge-500 to-healing-500"
    },
    {
      title: "Guided Meditation",
      description: "5-minute breathing exercises",
      icon: Heart,
      type: "Audio",
      gradient: "from-healing-400 to-mindbridge-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Wellness Hub 🌿
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of mental wellness resources designed specifically for students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="hover-lift group cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${resource.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <resource.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WellnessHub;