import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Brain, User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import CounsellorTest from '@/components/CounsellorTest';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const [userType, setUserType] = useState<'student' | 'counsellor'>('student');
  const [counsellorPassed, setCounsellorPassed] = useState(false);
  const [showCounsellorTest, setShowCounsellorTest] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { signIn, signUp, signInWithGoogle, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && profile) {
      console.log('User already authenticated, redirecting to dashboard');
      const redirectPath = profile.role === 'counsellor' ? '/counsellor-dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        console.log('OAuth callback successful, user:', data.session.user.id);
        
        // Wait for profile to be created/fetched
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkProfile = async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (profileData) {
            const redirectPath = profileData.role === 'counsellor' ? '/counsellor-dashboard' : '/dashboard';
            navigate(redirectPath, { replace: true });
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkProfile, 500);
          } else {
            // Profile creation failed, redirect to dashboard anyway
            navigate('/dashboard', { replace: true });
          }
        };
        
        checkProfile();
      }
    };

    // Check if this is an OAuth callback
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      handleAuthCallback();
    }
  }, [navigate]);

  // Initialize role from URL (?role=student|counsellor)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'counsellor' || roleParam === 'student') {
      setUserType(roleParam);
    }
  }, [location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('Starting Google OAuth...');
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google OAuth error:', error);
        toast.error(error.message || 'Google sign-in failed');
      } else {
        console.log('Google OAuth initiated successfully');
      }
    } catch (error) {
      console.error('Unexpected Google OAuth error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (userType === 'counsellor' && !counsellorPassed) {
          setLoading(false);
          toast.error('You must pass the counsellor qualifying test first.');
          setShowCounsellorTest(true);
          return;
        }
        // Validation
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName, userType);
        
        if (error) {
          toast.error(error.message || 'Sign up failed');
        } else {
          toast.success('Account created successfully! Please check your email for verification.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password, userType);
        
        if (error) {
          toast.error(error.message || 'Sign in failed');
        } else {
          toast.success(`Welcome back!`);
          const redirectPath = userType === 'counsellor' ? '/counsellor-dashboard' : '/dashboard';
          navigate(redirectPath);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mindbridge-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-primary fill-current" />
            </div>
            <CardTitle className="text-2xl font-display font-bold">
              {isSignUp ? 'Join Nexion' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? `Create your ${userType} account to get started` 
                : `Sign in to your ${userType} account`
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={userType} onValueChange={(value) => {
              setUserType(value as 'student' | 'counsellor');
              setShowCounsellorTest(false);
            }} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="counsellor" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Counsellor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {userType === 'counsellor' && isSignUp && !counsellorPassed && (
                <div className="p-3 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm">
                  You need to pass the qualifying test (&gt;= 80%) before signing up as a counsellor.
                </div>
              )}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {userType === 'counsellor' && isSignUp && !counsellorPassed ? (
                <Button 
                  type="button"
                  onClick={() => setShowCounsellorTest(true)}
                  className="w-full gradient-button"
                  disabled={loading}
                >
                  Start Qualifying Test
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full gradient-button"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              )}
            </form>

            {/* Google Sign-in (Students only) */}
            {userType === 'student' && !isSignUp && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              {userType === 'student' ? (
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline text-sm"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              ) : (
                <Link to="/counsellor-enroll" className="text-primary hover:underline text-sm">
                  Enroll for the qualifying test
                </Link>
              )}
            </div>

            {/* In-modal test removed; it is now a dedicated page */}

            {/* Emergency Contact for Students */}
            {userType === 'student' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-sm text-red-700 mb-2">Need immediate help?</p>
                <a 
                  href="tel:1800-891-4416" 
                  className="text-red-600 font-semibold hover:underline"
                >
                  📞 Call Tele-MANAS: 1800-891-4416
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;