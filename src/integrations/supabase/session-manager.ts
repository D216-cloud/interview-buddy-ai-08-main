import * as db from './database'

export interface SessionData {
  sessionId: string
  userId: string
  domain: string
  difficulty: string
  mode: string
  responses: Array<{
    questionNumber: number
    questionText: string
    userAnswer: string
    aiEvaluation: string
    score: number
    timeTaken: number
  }>
}

/**
 * Calculate overall performance score from all responses
 */
export function calculatePerformanceScore(responses: any[]): number {
  if (responses.length === 0) return 0
  const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0)
  return Math.round(totalScore / responses.length)
}

/**
 * Generate feedback summary based on responses and scores
 */
export function generateFeedbackSummary(responses: any[]): {
  strengths: string[]
  areasToImprove: string[]
  suggestions: string[]
  commonMistakes: string[]
} {
  const average = calculatePerformanceScore(responses)
  const excellentResponses = responses.filter(r => r.score >= 80)
  const poorResponses = responses.filter(r => r.score < 60)

  const strengths = []
  const areasToImprove = []
  const suggestions = []
  const commonMistakes = []

  if (excellentResponses.length > 0) {
    strengths.push(`Strong performance on ${excellentResponses.length} out of ${responses.length} questions`)
  }

  if (poorResponses.length > 0) {
    areasToImprove.push(`Need improvement on ${poorResponses.length} questions`)
    commonMistakes.push('Focus on understanding core concepts better')
  }

  if (average >= 80) {
    suggestions.push('Great job! Keep practicing to maintain consistency')
    suggestions.push('Consider moving to a higher difficulty level')
  } else if (average >= 60) {
    suggestions.push('Good progress! Review the topics where you scored lower')
    suggestions.push('Practice more regularly to improve')
  } else {
    suggestions.push('Focus on fundamentals and core concepts')
    suggestions.push('Practice consistently and review mistakes')
  }

  return { strengths, areasToImprove, suggestions, commonMistakes }
}

/**
 * Complete an interview session and save all data
 */
export async function completeInterviewSession(sessionData: SessionData) {
  try {
    const performanceScore = calculatePerformanceScore(sessionData.responses)
    const { strengths, areasToImprove, suggestions, commonMistakes } = generateFeedbackSummary(
      sessionData.responses
    )

    // Update session with final score
    const completedSession = await db.completeInterviewSession(
      sessionData.sessionId,
      performanceScore,
      `Domain: ${sessionData.domain} | Difficulty: ${sessionData.difficulty}`
    )

    if (!completedSession) throw new Error('Failed to complete session')

    // Save all question responses
    for (const response of sessionData.responses) {
      await db.addQuestionResponse(
        sessionData.sessionId,
        response.questionNumber,
        response.questionText,
        response.userAnswer,
        response.aiEvaluation,
        response.score,
        response.timeTaken
      )
    }

    // Update user statistics
    await db.updateUserStatistics(sessionData.userId, sessionData.domain, performanceScore)

    // Add to history
    const session = await db.getInterviewSession(sessionData.sessionId)
    if (session) {
      await db.addToInterviewHistory(
        sessionData.userId,
        sessionData.sessionId,
        sessionData.domain,
        sessionData.difficulty,
        performanceScore,
        session.duration_minutes,
        sessionData.responses.length
      )
    }

    // Add feedback
    await db.addFeedback(
      sessionData.sessionId,
      strengths.join('; '),
      areasToImprove.join('; '),
      suggestions.join('; '),
      commonMistakes.join('; ')
    )

    // Check and award badges
    await checkAndAwardBadges(sessionData.userId, sessionData.domain, performanceScore, sessionData.responses.length)

    return { success: true, score: performanceScore }
  } catch (error) {
    console.error('Error completing interview session:', error)
    return { success: false, error }
  }
}

/**
 * Check and award badges based on performance
 */
async function checkAndAwardBadges(
  userId: string,
  domain: string,
  score: number,
  questionsCount: number
) {
  try {
    // First Interview badge
    const allStats = await db.getAllUserStatistics(userId)
    if (allStats.length === 1 && allStats[0].domain === domain && allStats[0].total_interviews === 1) {
      await db.awardBadge(userId, 'First Interview', 'Completed your first interview', '🎯')
    }

    // Perfect Score badge
    if (score === 100) {
      await db.awardBadge(userId, 'Perfect Score', 'Achieved 100% in an interview', '⭐')
    }

    // Excellent badge (90+)
    if (score >= 90) {
      const domainStats = allStats.find(s => s.domain === domain)
      if (domainStats && domainStats.total_interviews >= 3) {
        const excellentCount = await getExcellentScoresCount(userId, domain)
        if (excellentCount >= 3) {
          await db.awardBadge(userId, `${domain} Master`, `Consistently scoring high in ${domain}`, '🏆')
        }
      }
    }

    // Speed badge (3+ questions in 15 minutes)
    const totalMinutes = questionsCount * 2 // rough estimate
    if (questionsCount >= 3 && totalMinutes <= 15) {
      await db.awardBadge(userId, 'Speed Demon', 'Answered 3+ questions quickly', '⚡')
    }

    // Milestone badges
    const totalInterviews = allStats.reduce((sum, s) => sum + s.total_interviews, 0)
    if (totalInterviews === 10) {
      await db.awardBadge(userId, 'Interview Milestone 10', 'Completed 10 interviews', '🚀')
    } else if (totalInterviews === 25) {
      await db.awardBadge(userId, 'Interview Milestone 25', 'Completed 25 interviews', '🌟')
    } else if (totalInterviews === 50) {
      await db.awardBadge(userId, 'Interview Milestone 50', 'Completed 50 interviews', '👑')
    }
  } catch (error) {
    console.error('Error checking badges:', error)
  }
}

/**
 * Count excellent scores for a domain
 */
async function getExcellentScoresCount(userId: string, domain: string): Promise<number> {
  const history = await db.getInterviewHistoryFiltered(userId, domain)
  return history.filter(h => (h.score || 0) >= 90).length
}

/**
 * Update goal progress after interview
 */
export async function updateGoalProgress(userId: string, domain: string, score: number) {
  try {
    const goals = await db.getActivePracticeGoals(userId)
    const domainGoals = goals.filter(g => g.domain === domain)

    for (const goal of domainGoals) {
      const currentProgress = Math.min((score / goal.target_score) * 100, 100)
      await db.updatePracticeGoal(goal.id, {
        current_progress: currentProgress,
        current_best_score: Math.max(score, goal.current_best_score || 0),
      })

      if (score >= goal.target_score) {
        await db.updatePracticeGoal(goal.id, { status: 'completed' })
        await db.awardBadge(userId, `Goal Achieved: ${goal.goal_name}`, 'Completed a practice goal', '🎉')
      }
    }
  } catch (error) {
    console.error('Error updating goal progress:', error)
  }
}

/**
 * Get comprehensive dashboard data
 */
export async function getDashboardData(userId: string) {
  try {
    const stats = await db.getUserOverallStats(userId)
    const recentInterviews = await db.getInterviewHistory(userId, 5)
    const allStats = await db.getAllUserStatistics(userId)
    const streak = await db.calculateCurrentStreak(userId)
    const weeklyStats = await db.getWeeklyStats(userId)
    const badges = await db.getUserBadges(userId)
    const goals = await db.getActivePracticeGoals(userId)

    return {
      totalInterviews: stats.totalInterviews,
      averageScore: stats.averageScore,
      recentInterviews,
      allStats,
      currentStreak: streak,
      weeklyStats,
      badges,
      activeGoals: goals,
    }
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    return null
  }
}
