import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import PrivacyDisclaimer from '@/components/PrivacyDisclaimer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookCounsellor = () => {
  const navigate = useNavigate();
  const [selectedCounsellor, setSelectedCounsellor] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];
  
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
      
      {/* Floating Theme Toggle - Always Visible */}
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Privacy Disclaimer */}
          <div className="mb-8">
            <PrivacyDisclaimer />
          </div>

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
                  <Button 
                    className="w-full gradient-button"
                    onClick={() => {
                      setSelectedCounsellor(counsellor);
                      setShowTimeSlots(true);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Time Slot Selection Modal */}
          {showTimeSlots && selectedCounsellor && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="wellness-card w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Select Time Slot</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowTimeSlots(false)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred appointment time with {selectedCounsellor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{selectedCounsellor.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCounsellor.specialization} • ₹{selectedCounsellor.fees}/session
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Available Time Slots - Today
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(slot => (
                        <Button
                          key={slot}
                          size="sm"
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className="text-sm"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedTimeSlot && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 dark:text-green-300">
                        ✓ Selected: {selectedTimeSlot} appointment with {selectedCounsellor.name}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowTimeSlots(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gradient-button"
                      onClick={() => {
                        if (selectedTimeSlot) {
                          navigate('/payment', {
                            state: {
                              counsellorName: selectedCounsellor.name,
                              sessionType: 'Individual Session',
                              amount: `₹${selectedCounsellor.fees}`,
                              timeSlot: selectedTimeSlot
                            }
                          });
                        }
                      }}
                      disabled={!selectedTimeSlot}
                    >
                      Continue to Payment
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

export default BookCounsellor;