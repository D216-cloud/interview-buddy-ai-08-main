export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  bio: string | null
  profile_picture_url: string | null
  preferred_difficulty: string
  preferred_domains: string[]
  total_interviews_taken: number
  total_practice_hours: number
  average_score: number
  dark_mode_preference: boolean
  created_at: string
  last_active_at: string
  updated_at: string
}

export interface InterviewSession {
  id: string
  user_id: string
  domain: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  mode: 'chat' | 'voice' | 'mock'
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  total_questions_asked: number
  total_answers_given: number
  performance_score: number | null
  feedback_summary: string | null
  status: 'in_progress' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}

export interface QuestionResponse {
  id: string
  session_id: string
  question_number: number
  question_text: string
  user_answer: string | null
  ai_evaluation: string | null
  score: number | null
  time_taken_seconds: number | null
  hints_used: number
  created_at: string
  updated_at: string
}

export interface UserStatistic {
  id: string
  user_id: string
  domain: string
  total_questions_attempted: number
  total_questions_correct: number
  average_score: number
  best_score: number
  worst_score: number
  improvement_percentage: number
  total_interviews: number
  created_at: string
  updated_at: string
}

export interface PracticeGoal {
  id: string
  user_id: string
  goal_name: string
  domain: string
  target_score: number
  target_date: string
  current_progress: number
  current_best_score: number
  status: 'active' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}

export interface FeedbackLog {
  id: string
  session_id: string
  question_id: string | null
  strengths: string | null
  areas_to_improve: string | null
  suggestions: string | null
  common_mistakes: string | null
  created_at: string
}

export interface InterviewHistory {
  id: string
  user_id: string
  session_id: string
  interview_date: string
  domain: string
  difficulty: string
  score: number | null
  duration_minutes: number | null
  questions_count: number | null
  status: string | null
  created_at: string
}

export interface AchievementBadge {
  id: string
  user_id: string
  badge_name: string
  badge_description: string | null
  icon_emoji: string | null
  earned_at: string
  created_at: string
}

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      user_profiles: { Row: UserProfile; Insert: Partial<UserProfile>; Update: Partial<UserProfile> }
      interview_sessions: { Row: InterviewSession; Insert: Partial<InterviewSession>; Update: Partial<InterviewSession> }
      question_responses: { Row: QuestionResponse; Insert: Partial<QuestionResponse>; Update: Partial<QuestionResponse> }
      user_statistics: { Row: UserStatistic; Insert: Partial<UserStatistic>; Update: Partial<UserStatistic> }
      practice_goals: { Row: PracticeGoal; Insert: Partial<PracticeGoal>; Update: Partial<PracticeGoal> }
      feedback_log: { Row: FeedbackLog; Insert: Partial<FeedbackLog>; Update: Partial<FeedbackLog> }
      interview_history: { Row: InterviewHistory; Insert: Partial<InterviewHistory>; Update: Partial<InterviewHistory> }
      achievement_badges: { Row: AchievementBadge; Insert: Partial<AchievementBadge>; Update: Partial<AchievementBadge> }
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
