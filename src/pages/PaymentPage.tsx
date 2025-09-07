import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PaymentPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success'
  const location = useLocation();
  const counsellorName = location.state?.counsellorName || 'Professional Counsellor';
  const sessionType = location.state?.sessionType || 'Individual Session';
  const amount = location.state?.amount || '₹2,500';
  const timeSlot = location.state?.timeSlot || '10:00 AM';

  const handleConfirmPayment = () => {
    setPaymentStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('success');
    }, 2000);
  };

  if (paymentStep === 'processing') {
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
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="wellness-card text-center">
              <CardContent className="p-12">
                <div className="mb-8">
                  <LoadingSpinner size="lg" className="mb-6" />
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Processing Payment...</h2>
                    <p className="text-muted-foreground">
                      Please wait while we securely process your payment. This may take a few moments.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>256-bit SSL Encryption</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-accent/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Processing payment for:</p>
                  <p className="font-medium text-foreground">{sessionType} with {counsellorName}</p>
                  <p className="text-lg font-bold text-primary">{amount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (paymentStep === 'success') {
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
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="wellness-card text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-12">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground flex items-center justify-center">
                      <Sparkles className="h-6 w-6 mr-2 text-yellow-500" />
                      Payment Successful!
                    </h2>
                    <p className="text-muted-foreground">
                      Your session has been booked successfully. You will receive a confirmation email shortly.
                    </p>
                  </div>
                </div>
                
                <div className="bg-background/50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-foreground mb-4">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Counsellor:</span>
                      <span className="text-foreground font-medium">{counsellorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session Type:</span>
                      <span className="text-foreground font-medium">{sessionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Slot:</span>
                      <span className="text-foreground font-medium">{timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="text-foreground font-medium">{amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking ID:</span>
                      <span className="text-foreground font-medium">NEX-{Math.floor(Math.random() * 10000)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/dashboard">
                    <Button className="gradient-button w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/booking">
                    <Button variant="outline" className="w-full">
                      Book Another Session
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📧 Check your email for session details and meeting link. Our counsellor will contact you within 24 hours to schedule your session.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/booking" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Counsellors
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Complete Your Booking 💳
            </h1>
            <p className="text-muted-foreground">
              Secure payment for your counselling session
            </p>
          </div>

          {/* Booking Summary */}
          <Card className="wellness-card mb-8">
            <CardHeader>
              <CardTitle>Booking Confirmation</CardTitle>
              <CardDescription>
                Please review your appointment details before confirming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Counsellor:</span>
                    <span className="font-medium text-foreground">{counsellorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session Type:</span>
                    <span className="font-medium text-foreground">{sessionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Slot:</span>
                    <span className="font-medium text-foreground">{timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium text-foreground">50 minutes</span>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">{amount}</div>
                    <div className="text-sm text-muted-foreground">Session Fee</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300 text-center">
                  💳 <strong>Simplified Payment Flow:</strong> This is a prototype confirmation system. In the full version, secure payment processing would be integrated.
                </p>
              </div>
              
              <Button 
                className="gradient-button w-full"
                onClick={handleConfirmPayment}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Booking
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="wellness-card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Secure Booking System</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your appointment is confirmed instantly</li>
                    <li>• Email confirmation sent automatically</li>
                    <li>• Counsellor will contact you within 24 hours</li>
                    <li>• Full refund available if cancelled 24 hours in advance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
