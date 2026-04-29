import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Trophy, Star, ArrowLeft, CheckCircle2, BarChart3, Clock, RefreshCw } from "lucide-react";

const ROUNDS = [
  { name: "Aptitude", emoji: "🧠", weight: 0.3 },
  { name: "Technical", emoji: "💻", weight: 0.4 },
  { name: "HR Round", emoji: "🤝", weight: 0.3 },
];

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size / 2) * 0.75;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#2563eb" : "#f97316";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={size*0.08} className="text-secondary" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.08} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${score/100*circ} ${circ}` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function FullInterviewResults() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("fullInterviewResults");
    if (!raw) { navigate("/interview/full"); return; }
    setData(JSON.parse(raw));
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  const { roundResults, detailedResults, finalScore, role, companyType, elapsed } = data;
  const grade = finalScore >= 85 ? "A" : finalScore >= 70 ? "B" : finalScore >= 55 ? "C" : "D";
  const gradeLabel = { A: "Excellent", B: "Good", C: "Average", D: "Needs Work" }[grade];
  const stars = Math.round(finalScore / 20);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground overflow-x-hidden">
      {/* Subtle bg decor */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Nav */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 group">
          <div className="h-8 w-8 rounded-lg bg-card border border-border/50 flex items-center justify-center group-hover:border-border shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">Dashboard</span>
        </button>

        {/* Hero Score Card */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-8 mb-8 shadow-xl shadow-blue-600/15 flex flex-col sm:flex-row items-center gap-8">
          <div className="relative">
            <ScoreGauge score={finalScore} size={140} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{finalScore}%</span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Final Score</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex gap-0.5 justify-center sm:justify-start mb-2">
              {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 fill-current ${s<=stars?"text-yellow-300":"text-white/20"}`} />)}
            </div>
            <h1 className="text-4xl font-black text-white mb-2">{gradeLabel} Performance</h1>
            <p className="text-blue-100 text-base mb-3">Grade: <span className="font-black text-white text-2xl">{grade}</span></p>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(elapsed)}</span>
              <span>•</span><span>{role}</span>
              <span>•</span><span>{companyType}</span>
            </div>
          </div>
        </motion.div>

        {/* Round Breakdown */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold text-foreground text-xl">Round Breakdown</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {ROUNDS.map((r, i) => {
              const result = roundResults[i];
              const score = result?.avg ?? 0;
              const color = score >= 80 ? "emerald" : score >= 60 ? "blue" : "orange";
              const colorMap: Record<string, string> = {
                emerald: "border-emerald-600/20 bg-emerald-600/5",
                blue: "border-blue-600/20 bg-blue-600/5",
                orange: "border-orange-500/20 bg-orange-500/5",
              };
              const textMap: Record<string, string> = {
                emerald: "text-emerald-600", blue: "text-blue-600", orange: "text-orange-500"
              };
              return (
                <div key={i} className={`bg-card border rounded-2xl p-5 shadow-sm text-center ${colorMap[color]}`}>
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">{r.name}</p>
                  <p className={`text-2xl font-black ${textMap[color]}`}>{score}%</p>
                  <p className="text-[9px] text-muted-foreground mt-1">Weight: {Math.round(r.weight * 100)}%</p>
                  {result?.scores && (
                    <div className="flex justify-center gap-1 mt-3 flex-wrap">
                      {result.scores.map((s: number, j: number) => (
                        <span key={j} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${s>=80?"border-emerald-600/20 text-emerald-600 bg-emerald-600/10":s>=60?"border-blue-600/20 text-blue-600 bg-blue-600/10":"border-orange-500/20 text-orange-500 bg-orange-500/10"}`}>
                          Q{j+1}:{s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Score Progress Bars */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="bg-card border border-border/50 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-foreground text-xl mb-4">Performance by Round</h3>
          {ROUNDS.map((r, i) => {
            const score = roundResults[i]?.avg ?? 0;
            const barColor = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-blue-500" : "bg-orange-500";
            return (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold">{r.emoji} {r.name}</span>
                  <span className="text-xs font-black">{score}%</span>
                </div>
                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${barColor}`} initial={{width:"0%"}} animate={{width:`${score}%`}} transition={{duration:1.2,delay:0.3+i*0.15,ease:"easeOut"}} />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="bg-card border border-border/50 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-foreground text-xl mb-4">Achievements Unlocked</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { cond: true, emoji: "🎯", label: "Interview Complete" },
              { cond: finalScore >= 80, emoji: "⭐", label: "High Achiever" },
              { cond: (roundResults[1]?.avg ?? 0) >= 75, emoji: "💻", label: "Tech Expert" },
              { cond: (roundResults[0]?.avg ?? 0) >= 70, emoji: "🧠", label: "Sharp Mind" },
              { cond: (roundResults[2]?.avg ?? 0) >= 70, emoji: "🗣️", label: "Great Communicator" },
              { cond: finalScore >= 90, emoji: "👑", label: "Top Performer" },
            ].filter(a => a.cond).map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-blue-600/5 border border-blue-600/20 rounded-xl">
                <span className="text-lg">{a.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{a.label}</p>
                  <CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Review */}
        {detailedResults && detailedResults.length > 0 && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="space-y-6 mb-10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-bold text-foreground text-xl">Detailed Feedback</h2>
            </div>
            
            {detailedResults.map((round: any, ri: number) => (
              <div key={ri} className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2 px-1">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center text-xs">{ri + 1}</span>
                  {round.round} Round
                </h3>
                {round.questions.map((q: any, qi: number) => (
                  <div key={qi} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border/30 bg-secondary/10">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <p className="text-lg font-bold text-foreground leading-tight">Q{qi + 1}: {q.question}</p>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${q.evaluation.score >= 80 ? "bg-emerald-600/10 text-emerald-600" : q.evaluation.score >= 60 ? "bg-blue-600/10 text-blue-600" : "bg-orange-500/10 text-orange-500"}`}>
                          {q.evaluation.score}%
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Your Answer</p>
                        <p className="text-base text-foreground italic">"{q.answer}"</p>
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Strengths</p>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{q.evaluation.strengths}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Star className="h-3.5 w-3.5 text-orange-500" />
                            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">To Improve</p>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{q.evaluation.improvements}</p>
                        </div>
                      </div>
                      <div className="bg-blue-600/5 rounded-xl p-4 border border-blue-600/10">
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-2">Expert Tip / Better Answer</p>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">{q.evaluation.betterAnswer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/interview/full")} className="h-11 px-6 rounded-xl border-border/50 text-sm font-bold">
            Try Again
          </Button>
          <Button onClick={() => navigate("/dashboard")} className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md">
            Back to Dashboard →
          </Button>
        </div>
      </div>
    </div>
  );
}
