import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import RealTimeSync from '@/components/RealTimeSync';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, CheckCircle, XCircle, Phone, MessageSquare, Bell, Activity, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CounsellorBookings = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([
    {
      id: 'book-1',
      studentName: "Anonymous Student",
      studentId: "student-1",
      date: "2024-01-15",
      time: "10:00 AM",
      issue: "Anxiety",
      severity: "medium",
      status: "pending",
      message: "Having trouble with exam stress and need guidance. This has been affecting my sleep and concentration during studies.",
      createdAt: "2024-01-14T15:30:00Z",
      urgency: "medium",
      previousSessions: 0,
      preferredMode: "video"
    },
    {
      id: 'book-2',
      studentName: "Anonymous Student",
      studentId: "student-2",
      date: "2024-01-16", 
      time: "2:00 PM",
      issue: "Depression",
      severity: "high",
      status: "accepted",
      message: "Feeling overwhelmed with coursework and personal issues. Need someone to talk to.",
      createdAt: "2024-01-13T10:15:00Z",
      urgency: "high",
      previousSessions: 2,
      preferredMode: "audio"
    },
    {
      id: 'book-3',
      studentName: "Anonymous Student",
      studentId: "student-3",
      date: "2024-01-17", 
      time: "4:00 PM",
      issue: "Academic Stress",
      severity: "low",
      status: "pending",
      message: "Need help with time management and study strategies.",
      createdAt: "2024-01-15T09:00:00Z",
      urgency: "low",
      previousSessions: 1,
      preferredMode: "video"
    }
  ]);
  
  const [callingId, setCallingId] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New booking request from student", time: "5 minutes ago", type: "booking" },
    { id: 2, message: "Student completed session feedback", time: "1 hour ago", type: "feedback" },
    { id: 3, message: "Upcoming session in 30 minutes", time: "2 hours ago", type: "reminder" }
  ]);

  const stats = [
    { label: "Pending Requests", value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: "text-yellow-600" },
    { label: "Today's Sessions", value: "3", icon: Calendar, color: "text-blue-600" },
    { label: "This Week", value: "12", icon: Activity, color: "text-green-600" },
    { label: "Avg Rating", value: "4.8", icon: Star, color: "text-purple-600" }
  ];

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

  const handleAcceptBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'accepted' }
        : booking
    ));
    toast.success('Booking accepted successfully!');
    // In real app, this would sync with database and notify student
  };

  const handleDeclineBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'declined' }
        : booking
    ));
    toast.success('Booking declined. Student will be notified.');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Counsellor Dashboard 📋
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage student appointments, track progress, and provide support.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="wellness-card">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notifications Panel */}
          <Card className="wellness-card mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Bell className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'booking' ? 'bg-blue-500' :
                        notification.type === 'feedback' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm text-foreground">{notification.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Requests */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Student Booking Requests</h2>
            {bookings.map((booking) => (
              <Card key={booking.id} className="wellness-card hover-lift">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="flex items-center space-x-2 text-foreground">
                          <User className="h-5 w-5" />
                          <span>{booking.studentName}</span>
                        </CardTitle>
                        <Badge className={getSeverityColor(booking.severity)}>
                          {booking.severity} priority
                        </Badge>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div><strong>Issue:</strong> {booking.issue}</div>
                        <div><strong>Date:</strong> {booking.date}</div>
                        <div><strong>Time:</strong> {booking.time}</div>
                        <div><strong>Mode:</strong> {booking.preferredMode}</div>
                        <div><strong>Previous Sessions:</strong> {booking.previousSessions}</div>
                        <div><strong>Requested:</strong> {new Date(booking.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium text-foreground mb-2">Student Message:</h4>
                    <p className="text-muted-foreground bg-accent/30 p-3 rounded-lg">{booking.message}</p>
                  </div>
                  
                  {/* Response Section */}
                  {activeBookingId === booking.id && (
                    <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Response Message (Optional)
                      </label>
                      <Textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Add a personal message for the student..."
                        className="mb-3"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          className="gradient-button"
                          onClick={() => {
                            if (activeBookingId === booking.id) {
                              handleAcceptBooking(booking.id);
                              setActiveBookingId(null);
                              setResponseMessage('');
                            } else {
                              setActiveBookingId(booking.id);
                            }
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {activeBookingId === booking.id ? 'Confirm Accept' : 'Accept'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            if (activeBookingId === booking.id) {
                              handleDeclineBooking(booking.id);
                              setActiveBookingId(null);
                              setResponseMessage('');
                            } else {
                              setActiveBookingId(booking.id);
                            }
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {activeBookingId === booking.id ? 'Confirm Decline' : 'Decline'}
                        </Button>
                        {activeBookingId === booking.id && (
                          <Button 
                            variant="ghost"
                            onClick={() => {
                              setActiveBookingId(null);
                              setResponseMessage('');
                            }}
                          >
                            Cancel
                          </Button>
                        )}
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
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <RealTimeSync />
    </div>
  );
};

export default CounsellorBookings;