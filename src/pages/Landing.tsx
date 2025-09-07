import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Brain, Users, Calendar, MessageCircle, BookOpen, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Landing = () => {
  const [userType, setUserType] = useState<'student' | 'counsellor' | null>(null);

  const features = [
    {
      icon: Brain,
      title: "AI First-Aid",
      description: "24/7 immediate mental health support with personalized guidance",
      gradient: "from-calm-500 to-mindbridge-500"
    },
    {
      icon: BookOpen,
      title: "Wellness Hub",
      description: "Comprehensive resources for stress, sleep, and mental wellness",
      gradient: "from-healing-500 to-calm-400"
    },
    {
      icon: Calendar,
      title: "Book Counsellor",
      description: "Connect with certified counsellors with transparent fees",
      gradient: "from-mindbridge-500 to-healing-500"
    },
    {
      icon: Users,
      title: "Peer Support",
      description: "Anonymous community forum for sharing and healing together",
      gradient: "from-healing-400 to-mindbridge-400"
    }
  ];

  const stats = [
    { number: "24/7", label: "Available Support" },
    { number: "100%", label: "Confidential" },
    { number: "₹0-500", label: "Affordable Fees" },
    { number: "50+", label: "Expert Counsellors" }
  ];

  const testimonials = [
    {
      content: "MindBridge provided me immediate support during my panic attacks. The AI first-aid feature was a lifesaver.",
      author: "Anonymous Student",
      role: "Engineering Student",
      rating: 5
    },
    {
      content: "As a counsellor, the platform helps me manage appointments efficiently while focusing on what matters - helping students.",
      author: "Dr. Sarah M.",
      role: "Licensed Counsellor",
      rating: 5
    },
    {
      content: "The peer support forum made me realize I wasn't alone. The community here truly understands student struggles.",
      author: "Anonymous Student",
      role: "Medical Student",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary fill-current" />
              <span className="font-display text-xl font-bold text-foreground">Nexion</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Theme Toggle - Always Visible */}
      <ThemeToggle variant="floating" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20">
            <Shield className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Safe • Confidential • Accessible</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Nexion
            <span className="block bg-mindbridge-gradient bg-clip-text text-transparent">
              A Safe Space for Student Mental Wellness
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Breaking barriers to mental health support for students. Get immediate AI-powered assistance, 
            connect with professional counsellors, and join a supportive community.
          </p>

          {/* User Type Selection */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                userType === 'student' ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setUserType('student')}
            >
              <CardHeader className="text-center pb-4">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">I'm a Student</CardTitle>
                <CardDescription>
                  Access AI support, wellness resources, and professional counselling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                userType === 'counsellor' ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setUserType('counsellor')}
            >
              <CardHeader className="text-center pb-4">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">I'm a Counsellor</CardTitle>
                <CardDescription>
                  Manage appointments, set availability, and help students thrive
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {userType && (
            <div className="animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="gradient-button text-lg px-8 py-4">
                  Get Started as {userType === 'student' ? 'Student' : 'Counsellor'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools and support designed specifically for student mental health needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift group border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3 text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Trusted by Students & Counsellors
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content.replace(/MindBridge/g, 'Nexion')}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-mindbridge-gradient rounded-3xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have found support, healing, and community through Nexion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Start as Student
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Join as Counsellor
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-primary fill-current" />
              <span className="font-display text-lg font-bold text-foreground">Nexion</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Completely Confidential</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Nexion. Made with ❤️ for student mental wellness.</p>
            <p className="mt-2">
              Emergency: <a href="tel:1800-891-4416" className="text-red-500 font-semibold hover:underline">Tele-MANAS 1800-891-4416</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;