-- Create feedback_log table
CREATE TABLE IF NOT EXISTS feedback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_responses(id) ON DELETE SET NULL,
  strengths TEXT,
  areas_to_improve TEXT,
  suggestions TEXT,
  common_mistakes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE feedback_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback from their sessions" ON feedback_log
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feedback to their sessions" ON feedback_log
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_feedback_log_session_id ON feedback_log(session_id);
CREATE INDEX idx_feedback_log_created_at ON feedback_log(created_at);
