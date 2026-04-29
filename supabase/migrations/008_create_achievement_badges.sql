-- Create achievement_badges table
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  icon_emoji TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_name)
);

-- Add RLS policies
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON achievement_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON achievement_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_achievement_badges_user_id ON achievement_badges(user_id);
CREATE INDEX idx_achievement_badges_earned_at ON achievement_badges(earned_at DESC);
