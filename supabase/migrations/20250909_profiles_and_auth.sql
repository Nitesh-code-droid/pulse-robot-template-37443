-- Create user role enum
CREATE TYPE user_role AS ENUM ('student', 'counsellor');

-- Create profiles table (matching existing structure)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'student',
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can only access their own data
CREATE POLICY "Students can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id AND role = 'student'
    );

CREATE POLICY "Students can update own profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id AND role = 'student'
    );

-- RLS Policy: Counsellors can access counsellor resources only if exam passed
CREATE POLICY "Counsellors can view own profile if exam passed" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id AND role = 'counsellor' AND counsellor_exam_passed = true
    );

CREATE POLICY "Counsellors can update own profile if exam passed" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id AND role = 'counsellor' AND counsellor_exam_passed = true
    );

-- RLS Policy: Allow insert for new users (handled by trigger/edge function)
CREATE POLICY "Allow profile creation on signup" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_counsellor_exam_idx ON public.profiles(counsellor_exam_passed) WHERE role = 'counsellor';
