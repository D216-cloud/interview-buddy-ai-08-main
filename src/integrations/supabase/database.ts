import { supabase } from './client'
import type { InterviewSession, QuestionResponse, UserStatistic, PracticeGoal, AchievementBadge } from './types'

// ============ USER PROFILE OPERATIONS ============

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) console.error('Error fetching profile:', error)
  return data
}

export async function createUserProfile(userId: string, fullName: string, email: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      full_name: fullName,
      email: email,
      preferred_difficulty: 'Intermediate',
      preferred_domains: ['React', 'JavaScript'],
    })
    .select()
    .single()

  if (error) console.error('Error creating profile:', error)
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) console.error('Error updating profile:', error)
  return data
}

// ============ INTERVIEW SESSION OPERATIONS ============

export async function createInterviewSession(
  userId: string,
  domain: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  mode: 'chat' | 'voice' | 'mock'
) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: userId,
      domain,
      difficulty,
      mode,
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) console.error('Error creating session:', error)
  return data
}

export async function updateInterviewSession(sessionId: string, updates: Partial<InterviewSession>) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) console.error('Error updating session:', error)
  return data
}

export async function completeInterviewSession(
  sessionId: string,
  performanceScore: number,
  feedbackSummary: string
) {
  const endTime = new Date()
  const session = await supabase
    .from('interview_sessions')
    .select('start_time')
    .eq('id', sessionId)
    .single()

  let duration = 0
  if (session.data?.start_time) {
    const startTime = new Date(session.data.start_time)
    duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000)
  }

  const { data, error } = await supabase
    .from('interview_sessions')
    .update({
      end_time: endTime.toISOString(),
      duration_minutes: duration,
      performance_score: performanceScore,
      feedback_summary: feedbackSummary,
      status: 'completed',
      updated_at: endTime.toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) console.error('Error completing session:', error)
  return data
}

export async function getInterviewSession(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) console.error('Error fetching session:', error)
  return data
}

// ============ QUESTION RESPONSE OPERATIONS ============

export async function addQuestionResponse(
  sessionId: string,
  questionNumber: number,
  questionText: string,
  userAnswer: string,
  aiEvaluation: string,
  score: number,
  timeTaken: number
) {
  const { data, error } = await supabase
    .from('question_responses')
    .insert({
      session_id: sessionId,
      question_number: questionNumber,
      question_text: questionText,
      user_answer: userAnswer,
      ai_evaluation: aiEvaluation,
      score,
      time_taken_seconds: timeTaken,
    })
    .select()
    .single()

  if (error) console.error('Error adding question response:', error)
  return data
}

export async function getQuestionResponses(sessionId: string) {
  const { data, error } = await supabase
    .from('question_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('question_number', { ascending: true })

  if (error) console.error('Error fetching question responses:', error)
  return data || []
}

// ============ USER STATISTICS OPERATIONS ============

export async function getOrCreateUserStatistic(userId: string, domain: string) {
  const { data: existing, error } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .eq('domain', domain)
    .maybeSingle()

  if (error) console.error('Error fetching user statistics:', error)

  if (existing) return existing

  const { data, error: insertError } = await supabase
    .from('user_statistics')
    .insert({
      user_id: userId,
      domain,
      total_questions_attempted: 0,
      total_questions_correct: 0,
      average_score: 0,
      best_score: 0,
      worst_score: 100,
      total_interviews: 0,
    })
    .select()
    .single()

  if (insertError) console.error('Error creating user statistic:', insertError)
  return data
}

export async function updateUserStatistics(userId: string, domain: string, newScore: number) {
  const stat = await getOrCreateUserStatistic(userId, domain)
  if (!stat) return

  const newAverage = (stat.average_score * stat.total_interviews + newScore) / (stat.total_interviews + 1)
  const newBest = Math.max(stat.best_score, newScore)
  const newWorst = Math.min(stat.worst_score, newScore)

  const { data, error } = await supabase
    .from('user_statistics')
    .update({
      average_score: Math.round(newAverage * 10) / 10,
      best_score: newBest,
      worst_score: newWorst,
      total_interviews: stat.total_interviews + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('domain', domain)
    .select()
    .single()

  if (error) console.error('Error updating user statistics:', error)
  return data
}

export async function getAllUserStatistics(userId: string) {
  const { data, error } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .order('average_score', { ascending: false })

  if (error) console.error('Error fetching user statistics:', error)
  return data || []
}

export async function getUserOverallStats(userId: string) {
  const { data, error } = await supabase
    .from('user_statistics')
    .select('average_score, total_interviews')
    .eq('user_id', userId)

  if (error || !data) return { totalInterviews: 0, averageScore: 0 }

  const totalInterviews = data.reduce((acc, stat) => acc + stat.total_interviews, 0)
  const overallAverage =
    data.length > 0
      ? Math.round(
          (data.reduce((acc, stat) => acc + stat.average_score * stat.total_interviews, 0) /
            Math.max(totalInterviews, 1)) *
            10
        ) / 10
      : 0

  return { totalInterviews, averageScore: overallAverage }
}

// ============ INTERVIEW HISTORY OPERATIONS ============

export async function addToInterviewHistory(
  userId: string,
  sessionId: string,
  domain: string,
  difficulty: string,
  score: number | null,
  duration: number | null,
  questionsCount: number
) {
  const { data, error } = await supabase
    .from('interview_history')
    .insert({
      user_id: userId,
      session_id: sessionId,
      interview_date: new Date().toISOString().split('T')[0],
      domain,
      difficulty,
      score,
      duration_minutes: duration,
      questions_count: questionsCount,
      status: 'completed',
    })
    .select()
    .single()

  if (error) console.error('Error adding to history:', error)
  return data
}

export async function getInterviewHistory(userId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('interview_history')
    .select('*')
    .eq('user_id', userId)
    .order('interview_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) console.error('Error fetching interview history:', error)
  return data || []
}

export async function getInterviewHistoryFiltered(
  userId: string,
  domain?: string,
  difficulty?: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase.from('interview_history').select('*').eq('user_id', userId)

  if (domain) query = query.eq('domain', domain)
  if (difficulty) query = query.eq('difficulty', difficulty)
  if (startDate) query = query.gte('interview_date', startDate)
  if (endDate) query = query.lte('interview_date', endDate)

  const { data, error } = await query.order('interview_date', { ascending: false })

  if (error) console.error('Error fetching filtered history:', error)
  return data || []
}

// ============ PRACTICE GOALS OPERATIONS ============

export async function createPracticeGoal(
  userId: string,
  goalName: string,
  domain: string,
  targetScore: number,
  targetDate: string
) {
  const { data, error } = await supabase
    .from('practice_goals')
    .insert({
      user_id: userId,
      goal_name: goalName,
      domain,
      target_score: targetScore,
      target_date: targetDate,
      status: 'active',
    })
    .select()
    .single()

  if (error) console.error('Error creating goal:', error)
  return data
}

export async function updatePracticeGoal(goalId: string, updates: Partial<PracticeGoal>) {
  const { data, error } = await supabase
    .from('practice_goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select()
    .single()

  if (error) console.error('Error updating goal:', error)
  return data
}

export async function getActivePracticeGoals(userId: string) {
  const { data, error } = await supabase
    .from('practice_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('target_date', { ascending: true })

  if (error) {
    if (error.code === 'PGRST205') return []
    console.error('Error fetching goals:', error)
  }
  return data || []
}

export async function getAllPracticeGoals(userId: string) {
  const { data, error } = await supabase
    .from('practice_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === 'PGRST205') return []
    console.error('Error fetching all goals:', error)
  }
  return data || []
}

// ============ ACHIEVEMENT BADGES OPERATIONS ============

export async function awardBadge(userId: string, badgeName: string, description: string, emoji: string) {
  const { data, error } = await supabase
    .from('achievement_badges')
    .insert({
      user_id: userId,
      badge_name: badgeName,
      badge_description: description,
      icon_emoji: emoji,
    })
    .select()
    .single()

  if (error && error.code !== '23505') {
    console.error('Error awarding badge:', error)
  }
  return data
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('achievement_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) console.error('Error fetching badges:', error)
  return data || []
}

// ============ FEEDBACK LOG OPERATIONS ============

export async function addFeedback(
  sessionId: string,
  strengths: string,
  areasToImprove: string,
  suggestions: string,
  commonMistakes: string
) {
  const { data, error } = await supabase
    .from('feedback_log')
    .insert({
      session_id: sessionId,
      strengths,
      areas_to_improve: areasToImprove,
      suggestions,
      common_mistakes: commonMistakes,
    })
    .select()
    .single()

  if (error) console.error('Error adding feedback:', error)
  return data
}

export async function getSessionFeedback(sessionId: string) {
  const { data, error } = await supabase
    .from('feedback_log')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching feedback:', error)
  }
  return data || null
}

// ============ STREAK & ACTIVITY OPERATIONS ============

export async function calculateCurrentStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('interview_history')
    .select('interview_date')
    .eq('user_id', userId)
    .order('interview_date', { ascending: false })
    .limit(30)

  if (error || !data) return 0

  let streak = 0
  const dates = data.map(h => new Date(h.interview_date).getTime())
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  let currentTimestamp = currentDate.getTime()

  for (const dateTime of dates) {
    const diffDays = (currentTimestamp - dateTime) / (1000 * 60 * 60 * 24)
    if (diffDays < 1) {
      streak++
      currentTimestamp -= 24 * 60 * 60 * 1000
    } else {
      break
    }
  }

  return streak
}

export async function getWeeklyStats(userId: string) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('interview_history')
    .select('*')
    .eq('user_id', userId)
    .gte('interview_date', startDateStr)
    .order('interview_date', { ascending: false })

  if (error || !data) return { count: 0, totalMinutes: 0, avgScore: 0 }

  const totalMinutes = data.reduce((acc, h) => acc + (h.duration_minutes || 0), 0)
  const avgScore = data.length > 0 ? Math.round(data.reduce((acc, h) => acc + (h.score || 0), 0) / data.length) : 0

  return { count: data.length, totalMinutes, avgScore }
}
