-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  preferred_difficulty TEXT DEFAULT 'Intermediate',
  preferred_domains TEXT[] DEFAULT ARRAY['React', 'JavaScript'],
  total_interviews_taken INTEGER DEFAULT 0,
  total_practice_hours NUMERIC DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  dark_mode_preference BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
