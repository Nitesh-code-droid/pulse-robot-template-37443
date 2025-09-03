-- Create user profiles table with role-based access
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'counsellor')),
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counsellors table for additional counsellor information
CREATE TABLE public.counsellors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  fees INTEGER NOT NULL DEFAULT 0,
  experience_years INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability table for counsellor time slots
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counsellor_id UUID NOT NULL REFERENCES public.counsellors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  counsellor_id UUID NOT NULL REFERENCES public.counsellors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  issue_type TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat sessions table for AI first-aid
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  session_type TEXT DEFAULT 'ai_firstaid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsellors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can view counsellor profiles" ON public.profiles FOR SELECT USING (
  role = 'counsellor' OR auth.uid() = user_id
);

-- Create policies for counsellors
CREATE POLICY "Anyone can view counsellor details" ON public.counsellors FOR SELECT USING (true);
CREATE POLICY "Counsellors can update their own details" ON public.counsellors FOR UPDATE USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Counsellors can insert their own details" ON public.counsellors FOR INSERT WITH CHECK (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create policies for availability
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Counsellors can manage their availability" ON public.availability FOR ALL USING (
  counsellor_id IN (
    SELECT c.id FROM public.counsellors c 
    JOIN public.profiles p ON c.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- Create policies for bookings
CREATE POLICY "Students can view their own bookings" ON public.bookings FOR SELECT USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Counsellors can view their bookings" ON public.bookings FOR SELECT USING (
  counsellor_id IN (
    SELECT c.id FROM public.counsellors c 
    JOIN public.profiles p ON c.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);
CREATE POLICY "Students can create bookings" ON public.bookings FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'student')
);
CREATE POLICY "Counsellors can update booking status" ON public.bookings FOR UPDATE USING (
  counsellor_id IN (
    SELECT c.id FROM public.counsellors c 
    JOIN public.profiles p ON c.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- Create policies for forum posts
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Students can create forum posts" ON public.forum_posts FOR INSERT WITH CHECK (
  author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'student')
);
CREATE POLICY "Authors can update their posts" ON public.forum_posts FOR UPDATE USING (
  author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create policies for forum comments
CREATE POLICY "Anyone can view forum comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Students can create comments" ON public.forum_comments FOR INSERT WITH CHECK (
  author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'student')
);

-- Create policies for chat sessions
CREATE POLICY "Students can view their own chat sessions" ON public.chat_sessions FOR SELECT USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students can create chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'student')
);
CREATE POLICY "Students can update their chat sessions" ON public.chat_sessions FOR UPDATE USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_counsellors_updated_at BEFORE UPDATE ON public.counsellors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample counsellors data
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'dr.sarah@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'dr.michael@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'dr.priya@example.com');

INSERT INTO public.profiles (user_id, email, full_name, role, phone, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', 'dr.sarah@example.com', 'Dr. Sarah Johnson', 'counsellor', '+91-9876543210', 'Specialized in anxiety and stress management with 8 years of experience.'),
  ('22222222-2222-2222-2222-222222222222', 'dr.michael@example.com', 'Dr. Michael Chen', 'counsellor', '+91-9876543211', 'Expert in depression and academic counseling with 6 years of experience.'),
  ('33333333-3333-3333-3333-333333333333', 'dr.priya@example.com', 'Dr. Priya Sharma', 'counsellor', '+91-9876543212', 'Specializes in relationship counseling and peer support with 10 years of experience.');

INSERT INTO public.counsellors (profile_id, specialization, affiliation, fees, experience_years) VALUES
  ((SELECT id FROM public.profiles WHERE email = 'dr.sarah@example.com'), 'Anxiety & Stress Management', 'On-Campus', 300, 8),
  ((SELECT id FROM public.profiles WHERE email = 'dr.michael@example.com'), 'Depression & Academic Counseling', 'Off-Campus', 450, 6),
  ((SELECT id FROM public.profiles WHERE email = 'dr.priya@example.com'), 'Relationship & Peer Support', 'On-Campus', 250, 10);

-- Insert sample availability
INSERT INTO public.availability (counsellor_id, day_of_week, start_time, end_time) VALUES
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.sarah@example.com')), 1, '09:00', '17:00'),
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.sarah@example.com')), 2, '09:00', '17:00'),
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.sarah@example.com')), 3, '09:00', '17:00'),
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.michael@example.com')), 1, '10:00', '18:00'),
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.michael@example.com')), 4, '10:00', '18:00'),
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.priya@example.com')), 2, '11:00', '19:00'),
  ((SELECT id FROM public.counsellors WHERE profile_id = (SELECT id FROM public.profiles WHERE email = 'dr.priya@example.com')), 5, '11:00', '19:00');