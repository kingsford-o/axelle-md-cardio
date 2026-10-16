-- ==========================================================
-- Supabase Schema for Axelle Cardio / Know Your Heart (KYH)
-- Verified & Enhanced for KNUST Telemetry & Admissions Auth
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 1. PROFILES TABLE
-- Extended user profile containing demographic, gamification,
-- and contact information (including phone number from KNUST registration)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  age INTEGER,
  gender TEXT,
  activity_level TEXT,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Function to handle new user signup from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    points,
    streak
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    100,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically populate profile upon user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================
-- 2. JOURNAL ENTRIES TABLE
-- Daily mood, symptoms, physical activity, and notes tracking
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  symptoms TEXT,
  activity TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_created_at_idx ON public.journal_entries(created_at DESC);

-- ==========================================================
-- 3. CHALLENGES PROGRESS TABLE
-- Gamification tracking for daily & weekly cardiovascular wellness tasks
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.challenges_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS challenges_progress_user_id_idx ON public.challenges_progress(user_id);

-- ==========================================================
-- 4. LESSONS PROGRESS TABLE
-- Educational module completion status
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.lessons_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS lessons_progress_user_id_idx ON public.lessons_progress(user_id);

-- ==========================================================
-- 5. QUIZ RESULTS TABLE
-- Scores and outcomes from cardiovascular quizzes
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON public.quiz_results(user_id);

-- ==========================================================
-- 6. HEART RATE LOGS TABLE
-- Telemetry readings and historical BPM tracking
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.heart_rate_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bpm INTEGER NOT NULL,
  category TEXT DEFAULT 'resting', -- 'resting', 'active', 'peak'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS heart_rate_logs_user_id_idx ON public.heart_rate_logs(user_id);
CREATE INDEX IF NOT EXISTS heart_rate_logs_recorded_at_idx ON public.heart_rate_logs(recorded_at DESC);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- High-performance direct auth.uid() checks without redundant subqueries
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Journal Entries Policies
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges Progress Policies
DROP POLICY IF EXISTS "Users can view own challenge progress" ON public.challenges_progress;
CREATE POLICY "Users can view own challenge progress"
  ON public.challenges_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenge progress" ON public.challenges_progress;
CREATE POLICY "Users can insert own challenge progress"
  ON public.challenges_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge progress" ON public.challenges_progress;
CREATE POLICY "Users can update own challenge progress"
  ON public.challenges_progress FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own challenge progress" ON public.challenges_progress;
CREATE POLICY "Users can delete own challenge progress"
  ON public.challenges_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Lessons Progress Policies
DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lessons_progress;
CREATE POLICY "Users can view own lesson progress"
  ON public.lessons_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson progress" ON public.lessons_progress;
CREATE POLICY "Users can insert own lesson progress"
  ON public.lessons_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.lessons_progress;
CREATE POLICY "Users can update own lesson progress"
  ON public.lessons_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Quiz Results Policies
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;
CREATE POLICY "Users can view own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz results" ON public.quiz_results;
CREATE POLICY "Users can insert own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz results" ON public.quiz_results;
CREATE POLICY "Users can update own quiz results"
  ON public.quiz_results FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own quiz results" ON public.quiz_results;
CREATE POLICY "Users can delete own quiz results"
  ON public.quiz_results FOR DELETE
  USING (auth.uid() = user_id);

-- Heart Rate Logs Policies
DROP POLICY IF EXISTS "Users can view own heart rate logs" ON public.heart_rate_logs;
CREATE POLICY "Users can view own heart rate logs"
  ON public.heart_rate_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own heart rate logs" ON public.heart_rate_logs;
CREATE POLICY "Users can insert own heart rate logs"
  ON public.heart_rate_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
