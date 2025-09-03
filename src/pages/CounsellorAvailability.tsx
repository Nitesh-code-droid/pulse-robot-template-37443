import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar } from 'lucide-react';

const CounsellorAvailability = () => {
  const timeSlots = [
    { time: "9:00 AM - 10:00 AM", available: true },
    { time: "10:00 AM - 11:00 AM", available: false },
    { time: "11:00 AM - 12:00 PM", available: true },
    { time: "2:00 PM - 3:00 PM", available: true },
    { time: "3:00 PM - 4:00 PM", available: false },
    { time: "4:00 PM - 5:00 PM", available: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Set Availability 🕒
            </h1>
            <p className="text-xl text-muted-foreground">
              Configure your available time slots for student appointments.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Weekly Schedule</span>
              </CardTitle>
              <CardDescription>
                Toggle your availability for each time slot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    <Button 
                      variant={slot.available ? "default" : "outline"}
                      className={slot.available ? "gradient-button" : ""}
                    >
                      {slot.available ? "Available" : "Unavailable"}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button className="w-full gradient-button">
                  Save Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CounsellorAvailability;