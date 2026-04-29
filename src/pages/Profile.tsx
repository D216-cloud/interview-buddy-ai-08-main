import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { User, Mic, Award, Calendar, Lightbulb, TrendingUp, Flame } from "lucide-react";
import * as db from "@/integrations/supabase/database";

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0 });
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      if (!user) return;
      const [overallStats, currentStreak, userBadges] = await Promise.all([
        db.getUserOverallStats(user.id),
        db.calculateCurrentStreak(user.id),
        db.getUserBadges(user.id),
      ]);

      setStats(overallStats);
      setStreak(currentStreak);
      setBadges(userBadges);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl mx-auto">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Profile</h1>
            <p className="text-sm md:text-base text-white/85">Manage your account and view your profile information.</p>
          </div>
        </section>
        <div className="glass-card p-8 border border-border/60 mb-7 shadow-sm">
          <div className="flex items-center gap-5 pb-7 border-b border-border/30">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 flex items-center justify-center border border-border/30 shrink-0">
              <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">{user?.user_metadata?.full_name || "User"}</p>
              <p className="text-base text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-7">
            <div className="text-center p-5 bg-gradient-to-br from-secondary/50 to-background rounded-xl border border-border/30 hover:border-border transition-colors">
              <div className="flex justify-center mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{loading ? "—" : stats.totalInterviews}</p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Interviews</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-secondary/50 to-background rounded-xl border border-border/30 hover:border-border transition-colors">
              <div className="flex justify-center mb-3">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{loading ? "—" : `${Math.round(stats.averageScore)}%`}</p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Avg Score</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-secondary/50 to-background rounded-xl border border-border/30 hover:border-border transition-colors">
              <div className="flex justify-center mb-3">
                <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{joinDate}</p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Member Since</p>
            </div>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="glass-card p-6 border border-orange-500/30 bg-orange-500/5 mb-7 shadow-sm">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-bold text-foreground">{streak} Day Streak! 🔥</p>
                <p className="text-sm text-muted-foreground">Keep practicing to maintain your streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {badges.length > 0 && (
          <div className="glass-card p-8 border border-border/60 mb-7 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-6 w-6 text-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="p-4 bg-gradient-to-br from-secondary/50 to-background rounded-lg border border-border/30 text-center hover:border-border transition-colors">
                  <p className="text-3xl mb-2">{badge.icon_emoji || "🏆"}</p>
                  <p className="font-semibold text-foreground text-sm">{badge.badge_name}</p>
                  {badge.badge_description && (
                    <p className="text-xs text-muted-foreground mt-1">{badge.badge_description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3 shadow-sm">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Tip:</span> Keep practicing to earn achievement badges and unlock new milestones!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

