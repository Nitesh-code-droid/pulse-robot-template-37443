import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'student' | 'counsellor';
  phone?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, role: 'student' | 'counsellor') => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'counsellor') => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // For Google OAuth users, create profile if it doesn't exist
          if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
            await ensureProfileExists(session.user);
          }
          
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 100);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfileExists = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile for Google OAuth user
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Google User',
            role: 'student'
          });

        if (error) {
          console.error('Error creating profile for Google user:', error);
        } else {
          console.log('Profile created for Google user:', user.id);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string, role: 'student' | 'counsellor') => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (!authData.user) {
        await supabase.auth.signOut();
        return { error: { message: 'Authentication failed' } };
      }

      // Check if user has the correct role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating one...');
        
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: email,
            full_name: role === 'counsellor' ? 'Test Counsellor' : 'Test Student',
            role: role,
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          await supabase.auth.signOut();
          return { error: { message: 'Failed to create user profile' } };
        }

        // If counsellor, create counsellor record
        if (role === 'counsellor') {
          const { data: newProfileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', authData.user.id)
            .single();

          if (newProfileData) {
            await supabase
              .from('counsellors')
              .insert({
                profile_id: newProfileData.id,
                specialization: 'General Counseling',
                affiliation: 'On-Campus',
                fees: 300,
                experience_years: 1,
              });
          }
        }

        return { error: null };
      }

      // If profile exists but role doesn't match
      if (profileData?.role !== role) {
        await supabase.auth.signOut();
        return { error: { message: `Invalid credentials for ${role} login` } };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google OAuth with Supabase...');
      console.log('Supabase URL:', supabase.supabaseUrl);
      console.log('Redirect URL:', `${window.location.origin}/auth`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      console.log('OAuth response:', { data, error });
      
      if (error) {
        console.error('OAuth error details:', error);
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error('OAuth catch error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'counsellor') => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      // If counsellor, ensure pass BEFORE creating auth user to avoid orphaned accounts
      if (role === 'counsellor') {
        const { data: attempt, error: attemptError } = await (supabase as any)
          .from('counsellor_test_attempts')
          .select('score, created_at')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attemptError || !attempt || (attempt.score ?? 0) < 80) {
          return { error: { message: 'You must pass the qualifying test (>= 80%) before counsellor signup.' } };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) return { error };

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email,
            full_name: fullName,
            role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }

        // If counsellor, create counsellor record
        if (role === 'counsellor') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single();

          if (profileData) {
            await supabase
              .from('counsellors')
              .insert({
                profile_id: profileData.id,
                specialization: 'General Counseling',
                affiliation: 'On-Campus',
                fees: 300,
                experience_years: 1,
              });
          }
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) return { error };

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};