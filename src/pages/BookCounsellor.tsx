import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, Clock } from 'lucide-react';

const BookCounsellor = () => {
  const counsellors = [
    {
      name: "Dr. Sarah Johnson",
      specialization: "Anxiety & Stress Management",
      affiliation: "On-Campus",
      fees: 300,
      rating: 4.9,
      experience: 8
    },
    {
      name: "Dr. Michael Chen", 
      specialization: "Depression & Academic Counseling",
      affiliation: "Off-Campus",
      fees: 450,
      rating: 4.8,
      experience: 6
    },
    {
      name: "Dr. Priya Sharma",
      specialization: "Relationship & Peer Support", 
      affiliation: "On-Campus",
      fees: 250,
      rating: 4.9,
      experience: 10
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
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Book a Counsellor 👩‍⚕️
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with certified mental health professionals for personalized support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {counsellors.map((counsellor, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{counsellor.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{counsellor.rating}</span>
                    </div>
                  </div>
                  <CardDescription>{counsellor.specialization}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{counsellor.affiliation}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{counsellor.experience} years experience</span>
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ₹{counsellor.fees}/session
                    </div>
                  </div>
                  <Button className="w-full gradient-button">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookCounsellor;