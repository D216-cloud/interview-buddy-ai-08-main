-- Create question_responses table
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  user_answer TEXT,
  ai_evaluation TEXT,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  time_taken_seconds INTEGER,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses from their sessions" ON question_responses
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert responses to their sessions" ON question_responses
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update responses in their sessions" ON question_responses
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_question_responses_session_id ON question_responses(session_id);
CREATE INDEX idx_question_responses_created_at ON question_responses(created_at);
