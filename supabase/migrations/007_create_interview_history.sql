-- Create interview_history table (simplified view of sessions for easy querying)
CREATE TABLE IF NOT EXISTS interview_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  interview_date DATE NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score NUMERIC,
  duration_minutes INTEGER,
  questions_count INTEGER,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id)
);

-- Add RLS policies
ALTER TABLE interview_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" ON interview_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" ON interview_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_interview_history_user_id ON interview_history(user_id);
CREATE INDEX idx_interview_history_interview_date ON interview_history(interview_date DESC);
CREATE INDEX idx_interview_history_domain ON interview_history(domain);
CREATE INDEX idx_interview_history_difficulty ON interview_history(difficulty);
