-- =============================================
-- INTELIA DATABASE SCHEMA
-- =============================================
-- Run this SQL in your Supabase SQL Editor:
-- https://app.supabase.com/project/YOUR_PROJECT/sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  specialty TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, handle, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    CONCAT('@', LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', 'user'), ' ', '_'))),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  cover_url TEXT,
  level TEXT CHECK (level IN ('Básico', 'Intermedio', 'Avanzado')) DEFAULT 'Intermedio',
  tags TEXT[] DEFAULT '{}',
  total_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EPISODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  audio_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster episode queries
CREATE INDEX IF NOT EXISTS idx_episodes_course_id ON episodes(course_id);

-- =============================================
-- AUDIOBOOKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audiobooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  total_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAPTERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audiobook_id UUID REFERENCES audiobooks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  audio_url TEXT,
  order_index INTEGER DEFAULT 0
);

-- Index for faster chapter queries
CREATE INDEX IF NOT EXISTS idx_chapters_audiobook_id ON chapters(audiobook_id);

-- =============================================
-- RESOURCES TABLE (PDFs, Videos)
-- =============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  type TEXT CHECK (type IN ('pdf', 'video')) NOT NULL,
  cover_url TEXT,
  file_url TEXT,
  pages INTEGER,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT CHECK (content_type IN ('episode', 'chapter', 'resource')) NOT NULL,
  content_id UUID NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Index for user progress queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT CHECK (content_type IN ('course', 'audiobook', 'resource')) NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Index for favorites queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- PUBLIC CONTENT POLICIES (read-only for all)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view episodes" ON episodes;
CREATE POLICY "Anyone can view episodes" ON episodes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view audiobooks" ON audiobooks;
CREATE POLICY "Anyone can view audiobooks" ON audiobooks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view chapters" ON chapters;
CREATE POLICY "Anyone can view chapters" ON chapters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

-- =============================================
-- USER DATA POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- ADMIN POLICIES (CRUD for content management)
-- =============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can manage courses
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
CREATE POLICY "Admins can insert courses" ON courses
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update courses" ON courses;
CREATE POLICY "Admins can update courses" ON courses
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
CREATE POLICY "Admins can delete courses" ON courses
  FOR DELETE USING (is_admin());

-- Admins can manage episodes
DROP POLICY IF EXISTS "Admins can insert episodes" ON episodes;
CREATE POLICY "Admins can insert episodes" ON episodes
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update episodes" ON episodes;
CREATE POLICY "Admins can update episodes" ON episodes
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete episodes" ON episodes;
CREATE POLICY "Admins can delete episodes" ON episodes
  FOR DELETE USING (is_admin());

-- Admins can manage audiobooks
DROP POLICY IF EXISTS "Admins can insert audiobooks" ON audiobooks;
CREATE POLICY "Admins can insert audiobooks" ON audiobooks
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update audiobooks" ON audiobooks;
CREATE POLICY "Admins can update audiobooks" ON audiobooks
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete audiobooks" ON audiobooks;
CREATE POLICY "Admins can delete audiobooks" ON audiobooks
  FOR DELETE USING (is_admin());

-- Admins can manage chapters
DROP POLICY IF EXISTS "Admins can insert chapters" ON chapters;
CREATE POLICY "Admins can insert chapters" ON chapters
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update chapters" ON chapters;
CREATE POLICY "Admins can update chapters" ON chapters
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete chapters" ON chapters;
CREATE POLICY "Admins can delete chapters" ON chapters
  FOR DELETE USING (is_admin());

-- Admins can manage resources
DROP POLICY IF EXISTS "Admins can insert resources" ON resources;
CREATE POLICY "Admins can insert resources" ON resources
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update resources" ON resources;
CREATE POLICY "Admins can update resources" ON resources
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete resources" ON resources;
CREATE POLICY "Admins can delete resources" ON resources
  FOR DELETE USING (is_admin());

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Schema created successfully!' AS status;
