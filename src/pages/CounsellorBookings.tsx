import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle, XCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CounsellorBookings = () => {
  // Demo data: do NOT include student phone numbers in the client
  const bookings = [
    {
      id: 'book-1',
      studentName: "Anonymous Student",
      date: "2024-01-15",
      time: "10:00 AM",
      issue: "Anxiety",
      status: "pending",
      message: "Having trouble with exam stress and need guidance",
    },
    {
      id: 'book-2',
      studentName: "Anonymous Student",
      date: "2024-01-16", 
      time: "2:00 PM",
      issue: "Depression",
      status: "accepted",
      message: "Feeling overwhelmed with coursework",
    }
  ];

  const [callingId, setCallingId] = useState<string | null>(null);

  const startCall = async (bookingId: string) => {
    try {
      if (callingId) return; // prevent concurrent
      const counsellorPhone = window.prompt("Enter your phone in E.164 format (e.g., +14155551234):")?.trim();
      if (!counsellorPhone) return;
      const e164 = /^\+[1-9]\d{1,14}$/;
      if (!e164.test(counsellorPhone)) {
        toast.error('Invalid phone format. Use E.164, e.g., +14155551234');
        return;
      }
      setCallingId(bookingId);
      toast.loading('Starting call...', { id: 'call' });
      const { data, error } = await supabase.functions.invoke('voice-call', {
        body: { booking_id: bookingId, counsellor_phone: counsellorPhone },
      });
      if (error) throw error;
      toast.success('Call initiated. You will receive a call shortly.', { id: 'call' });
      console.log('Twilio response', data);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || e?.error || 'Failed to initiate call';
      toast.error(msg, { id: 'call' });
    } finally {
      setCallingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Booking Details 📅
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your student appointment requests and schedule.
            </p>
          </div>

          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover-lift">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>{booking.studentName}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Issue: {booking.issue} • {booking.date} at {booking.time}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{booking.message}</p>
                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <Button className="gradient-button">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button variant="outline">
                          <XCircle className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                      </>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => startCall(booking.id)}
                      disabled={callingId === booking.id}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {callingId === booking.id ? 'Calling...' : 'Call Student'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounsellorBookings;