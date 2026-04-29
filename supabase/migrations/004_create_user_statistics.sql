-- Create user_statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  total_questions_attempted INTEGER DEFAULT 0,
  total_questions_correct INTEGER DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  best_score NUMERIC DEFAULT 0,
  worst_score NUMERIC DEFAULT 100,
  improvement_percentage NUMERIC DEFAULT 0,
  total_interviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, domain)
);

-- Add RLS policies
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_domain ON user_statistics(domain);
CREATE INDEX idx_user_statistics_user_domain ON user_statistics(user_id, domain);
