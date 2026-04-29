-- Create practice_goals table
CREATE TABLE IF NOT EXISTS practice_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  target_score NUMERIC NOT NULL CHECK (target_score >= 0 AND target_score <= 100),
  target_date DATE NOT NULL,
  current_progress NUMERIC DEFAULT 0,
  current_best_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE practice_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON practice_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON practice_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON practice_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON practice_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_practice_goals_user_id ON practice_goals(user_id);
CREATE INDEX idx_practice_goals_status ON practice_goals(status);
CREATE INDEX idx_practice_goals_domain ON practice_goals(domain);
CREATE INDEX idx_practice_goals_target_date ON practice_goals(target_date);
