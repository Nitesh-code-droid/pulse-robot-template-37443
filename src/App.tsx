import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Landing from '@/pages/Landing';
import AuthPage from '@/pages/AuthPage';
import CounsellorTestIntro from '@/pages/CounsellorTestIntro';
import CounsellorTestPage from '@/pages/CounsellorTestPage';
import ProfilePage from '@/pages/ProfilePage';
import SuggestedCounsellors from '@/pages/SuggestedCounsellors';
import Dashboard from '@/pages/Dashboard';
import AIChat from '@/pages/AIChat';
import WellnessHub from '@/pages/WellnessHub';
import StressReliefTechniques from '@/pages/StressReliefTechniques';
import SleepHygieneGuide from '@/pages/SleepHygieneGuide';
import ExamStressManagement from '@/pages/ExamStressManagement';
import GuidedMeditation from '@/pages/GuidedMeditation';
import BookCounsellor from '@/pages/BookCounsellor';
import PaymentPage from '@/pages/PaymentPage';
import SleepDiary from '@/pages/SleepDiary';
import PeerSupport from '@/pages/PeerSupport';
import CounsellorBookings from '@/pages/CounsellorBookings';
import CounsellorAvailability from '@/pages/CounsellorAvailability';
import NotFound from '@/pages/NotFound';

// Protected Route wrapper
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/counsellor-enroll" element={<CounsellorTestIntro />} />
                <Route path="/counsellor-test" element={<CounsellorTestPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route 
                  path="/suggested-counsellors" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <SuggestedCounsellors />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Student Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <AIChat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/resources" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <WellnessHub />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wellness/stress-relief" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StressReliefTechniques />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wellness/sleep-hygiene" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <SleepHygieneGuide />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wellness/exam-stress" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ExamStressManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wellness/meditation" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <GuidedMeditation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wellness/sleep-diary" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <SleepDiary />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/booking" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <BookCounsellor />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <PaymentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forum" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <PeerSupport />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Counsellor Routes */}
                <Route 
                  path="/counsellor-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="counsellor">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/counsellor-bookings" 
                  element={
                    <ProtectedRoute requiredRole="counsellor">
                      <CounsellorBookings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/availability" 
                  element={
                    <ProtectedRoute requiredRole="counsellor">
                      <CounsellorAvailability />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
