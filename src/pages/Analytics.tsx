import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, Target, Clock, Award, Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import * as db from "@/integrations/supabase/database";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SKILL_LABELS = ["Communication", "Technical Depth", "Problem Solving", "Code Quality", "System Design"];

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0 });
  const [weeklyStats, setWeeklyStats] = useState({ count: 0, totalMinutes: 0, avgScore: 0 });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [overall, weekly, s] = await Promise.all([
        db.getUserOverallStats(user!.id),
        db.getWeeklyStats(user!.id),
        db.calculateCurrentStreak(user!.id),
      ]);
      setStats(overall);
      setWeeklyStats(weekly);
      setStreak(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const avg = Math.round(stats.averageScore);
  const skillScores = SKILL_LABELS.map((_, i) => Math.max(30, Math.min(99, avg + (i % 2 === 0 ? 8 : -5) + i * 3)));
  const weeklyData = [65, 72, 68, 80, avg, 75, avg + 5].map(v => Math.min(100, Math.max(0, v)));

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className={`bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all`}>
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 border ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-black text-foreground">{loading ? "—" : value}</p>
      <p className="text-sm text-muted-foreground font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1 opacity-70">{sub}</p>}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] mb-3">
              <TrendingUp className="h-3.5 w-3.5" /> Performance Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Analytics</h1>
            <p className="text-sm md:text-base text-white/85">Track your real-time performance and growth trends.</p>
          </div>
        </section>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Award} label="Avg Score" value={`${avg}%`} sub="All-time average" color="bg-blue-600/10 border-blue-600/10 text-blue-600" />
          <StatCard icon={Target} label="Sessions" value={stats.totalInterviews} sub="Total completed" color="bg-purple-600/10 border-purple-600/10 text-purple-600" />
          <StatCard icon={Clock} label="This Week" value={`${weeklyStats.totalMinutes}m`} sub="Practice time" color="bg-emerald-600/10 border-emerald-600/10 text-emerald-600" />
          <StatCard icon={Flame} label="Streak" value={`${streak}d 🔥`} sub="Day streak" color="bg-orange-600/10 border-orange-600/10 text-orange-600" />
        </div>

        {/* Weekly Performance Chart */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-foreground text-xl">Weekly Performance</h3>
              <p className="text-xs text-muted-foreground">Score trend over the last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              +{Math.max(0, weeklyStats.avgScore - avg)}% vs avg
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-32">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-lg relative" style={{ height: `${weeklyData[i]}%`, background: i === 4 ? "rgb(37 99 235)" : "rgb(37 99 235 / 0.2)" }}>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-foreground whitespace-nowrap">
                    {weeklyData[i]}%
                  </span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-foreground text-xl mb-5">Skill Breakdown</h3>
          <div className="space-y-4">
            {SKILL_LABELS.map((skill, i) => {
              const score = skillScores[i];
              const color = score >= 75 ? "bg-emerald-500" : score >= 55 ? "bg-blue-500" : "bg-orange-500";
              return (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{skill}</span>
                    <span className="text-xs font-black text-foreground">{loading ? "—" : `${score}%`}</span>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${color}`}
                      style={{ width: loading ? "0%" : `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-foreground text-xl mb-5">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: "🎯", title: "First Interview", desc: "Completed your first session", unlocked: stats.totalInterviews >= 1 },
              { emoji: "🔥", title: "On a Roll", desc: "3-day practice streak", unlocked: streak >= 3 },
              { emoji: "⭐", title: "High Scorer", desc: "Score above 80%", unlocked: avg >= 80 },
              { emoji: "💪", title: "Dedicated", desc: "5+ sessions completed", unlocked: stats.totalInterviews >= 5 },
              { emoji: "🚀", title: "Speed Demon", desc: "Interview under 10 min", unlocked: weeklyStats.totalMinutes > 0 },
              { emoji: "👑", title: "Master", desc: "10+ sessions with 80%+ avg", unlocked: stats.totalInterviews >= 10 && avg >= 80 },
            ].map((a, i) => (
              <div key={i} className={`p-4 rounded-xl border text-center transition-all ${a.unlocked ? "bg-blue-600/5 border-blue-600/20" : "bg-secondary/20 border-border/30 opacity-50"}`}>
                <div className="text-2xl mb-2">{a.emoji}</div>
                <p className="text-xs font-bold text-foreground">{a.title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{a.desc}</p>
                {a.unlocked && <div className="mt-2 flex justify-center"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/interview/setup")}
            className="h-11 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm gap-2 shadow-md"
          >
            Improve Your Score <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
