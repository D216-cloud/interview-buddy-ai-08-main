import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, BarChart3, Clock, ArrowRight, Flame, Sparkles, Target, Trophy } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import * as db from "@/integrations/supabase/database";

const brandName = "Intervu";

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || "there";
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0 });
  const [weeklyStats, setWeeklyStats] = useState({ count: 0, totalMinutes: 0, avgScore: 0 });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (!user) return;
      const [overallStats, weekly, currentStreak] = await Promise.all([
        db.getUserOverallStats(user.id),
        db.getWeeklyStats(user.id),
        db.calculateCurrentStreak(user.id),
      ]);

      setStats(overallStats);
      setWeeklyStats(weekly);
      setStreak(currentStreak);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-8 md:p-10 shadow-xl shadow-indigo-900/10">
          <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.14),transparent_32%)]" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-7 items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-white/75 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.16em] mb-4 text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-cyan-700" /> Premium Dashboard
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Welcome back, {name}
              </h1>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Continue building interview confidence with smarter practice rounds, real-time feedback, and focused improvement paths powered by {brandName}.
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 backdrop-blur p-4 shadow-lg shadow-indigo-900/10">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/interview/setup">
                  <Button className="gap-2 h-11 px-6 rounded-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700">
                    Start Interview <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold border-slate-300 text-slate-700 bg-white hover:bg-slate-100">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <div className="rounded-2xl p-6 border border-border/60 bg-gradient-to-br from-sky-500/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="h-11 w-11 rounded-xl bg-white/85 flex items-center justify-center shrink-0 border border-sky-300/40 mb-4">
              <MessageSquare className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{loading ? "—" : stats.totalInterviews}</p>
              <p className="text-sm text-muted-foreground font-medium">Interviews</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-border/60 bg-gradient-to-br from-violet-500/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="h-11 w-11 rounded-xl bg-white/85 flex items-center justify-center shrink-0 border border-violet-300/40 mb-4">
              <BarChart3 className="h-5 w-5 text-violet-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{loading ? "—" : `${Math.round(stats.averageScore)}%`}</p>
              <p className="text-sm text-muted-foreground font-medium">Avg Score</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-border/60 bg-gradient-to-br from-emerald-500/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="h-11 w-11 rounded-xl bg-white/85 flex items-center justify-center shrink-0 border border-emerald-300/40 mb-4">
              <Clock className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{loading ? "—" : formatHours(weeklyStats.totalMinutes)}</p>
              <p className="text-sm text-muted-foreground font-medium">This Week</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-border/60 bg-gradient-to-br from-rose-500/15 to-white shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="h-11 w-11 rounded-xl bg-white/85 flex items-center justify-center shrink-0 border border-rose-300/40 mb-4">
              <Flame className="h-5 w-5 text-rose-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{loading ? "—" : streak}</p>
              <p className="text-sm text-muted-foreground font-medium">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 mb-3">
              <Target className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Weekly Sessions</p>
            <p className="text-2xl font-bold text-foreground">{loading ? "—" : weeklyStats.count}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-3">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Weekly Avg Score</p>
            <p className="text-2xl font-bold text-foreground">{loading ? "—" : `${Math.round(weeklyStats.avgScore)}%`}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-3">
              <Trophy className="h-4 w-4 text-cyan-600" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Focus Today</p>
            <p className="text-sm text-muted-foreground">Run one voice and one chat interview to maximize feedback variety.</p>
          </div>
        </div>

        {/* Modes */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Interview Modes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/interview/setup?mode=chat">
              <div className="rounded-2xl p-7 hover:border-sky-500/40 border border-border/60 bg-gradient-to-br from-white to-sky-50/40 hover:shadow-xl hover:shadow-sky-900/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/5 flex items-center justify-center mb-4 group-hover:from-sky-500/30 transition-all duration-300 border border-sky-300/30">
                  <MessageSquare className="h-6 w-6 text-sky-700" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Chat Mode</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Type your answers and get instant AI feedback with detailed explanations in our conversational interface.</p>
              </div>
            </Link>
            <Link to="/interview/setup?mode=voice">
              <div className="rounded-2xl p-7 hover:border-violet-500/40 border border-border/60 bg-gradient-to-br from-white to-violet-50/40 hover:shadow-xl hover:shadow-violet-900/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/5 flex items-center justify-center mb-4 group-hover:from-violet-500/30 transition-all duration-300 border border-violet-300/30">
                  <Mic className="h-6 w-6 text-violet-700" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Voice Mode</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Speak your answers naturally with live transcription for a realistic interview experience.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
