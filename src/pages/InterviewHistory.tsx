import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BarChart3, Filter, ArrowUp, Clock, ArrowLeft, Sparkles } from "lucide-react";
import * as db from "@/integrations/supabase/database";
import type { InterviewHistory } from "@/integrations/supabase/types";

export default function InterviewHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<InterviewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "duration">("date");

  const domains = ["React", "JavaScript", "Python", "Java", "TypeScript", "Node.js", "SQL"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [history, selectedDomain, selectedDifficulty, sortBy]);

  const loadHistory = async () => {
    try {
      if (!user) return;
      const data = await db.getInterviewHistory(user.id, 100);
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...history];

    if (selectedDomain) {
      filtered = filtered.filter((h) => h.domain === selectedDomain);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((h) => h.difficulty === selectedDifficulty);
    }

    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.interview_date).getTime() - new Date(a.interview_date).getTime());
    } else if (sortBy === "score") {
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === "duration") {
      filtered.sort((a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0));
    }

    setFilteredHistory(filtered);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number | null) => {
    if (!score) return "bg-secondary/30";
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Session Archive
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Interview History</h1>
              <p className="text-sm md:text-base text-white/85">View all your past interviews and track your progress.</p>
            </div>
          </section>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 border border-border/60 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold text-foreground">Filters & Sort</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">Domain</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/70 rounded-lg text-foreground text-sm"
              >
                <option value="">All Domains</option>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/70 rounded-lg text-foreground text-sm"
              >
                <option value="">All Levels</option>
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border/70 rounded-lg text-foreground text-sm"
              >
                <option value="date">Latest First</option>
                <option value="score">Highest Score</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium mb-2 block">Results</label>
              <div className="px-3 py-2 bg-secondary/30 rounded-lg text-foreground text-sm font-semibold">
                {filteredHistory.length} Interview{filteredHistory.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-primary/20 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading interviews...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No interviews found</p>
              <Button onClick={() => navigate("/interview/setup")}>Start Your First Interview</Button>
            </div>
          ) : (
            filteredHistory.map((interview) => (
              <div
                key={interview.id}
                onClick={() => navigate(`/interview/results/${interview.session_id}`)}
                className="glass-card p-6 border border-border/60 hover:border-cyan-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {interview.domain}
                      </h3>
                      <span className="px-2 py-1 bg-secondary/50 rounded text-xs font-medium text-muted-foreground">
                        {interview.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(interview.interview_date).toLocaleDateString()}</span>
                      {interview.duration_minutes && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {interview.duration_minutes}m
                          </div>
                        </>
                      )}
                      {interview.questions_count && (
                        <>
                          <span>•</span>
                          <span>{interview.questions_count} questions</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {interview.score && (
                      <div
                        className={`px-4 py-3 rounded-lg border ${getScoreBgColor(interview.score)} ${getScoreColor(
                          interview.score
                        )}`}
                      >
                        <p className="font-bold text-lg">{Math.round(interview.score)}%</p>
                        <p className="text-xs font-medium">
                          {interview.score >= 80
                            ? "Excellent"
                            : interview.score >= 60
                              ? "Good"
                              : "Needs Work"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform">
                    <ArrowUp className="h-5 w-5 rotate-45" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
