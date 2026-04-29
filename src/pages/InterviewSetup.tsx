import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import { MessageSquare, Mic, ArrowRight, Plus, Settings, Sparkles } from "lucide-react";

const brandName = "Intervu";

const domains = [
  "React", "Node.js", "DSA", "System Design", "JavaScript", "Python", "SQL",
  "Java", "C++", "TypeScript", "MongoDB", "AWS", "Docker", "Kubernetes",
  "English Practice", "Communication Skills"
];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

export default function InterviewSetup() {
  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const navigate = useNavigate();

  const activeDomain = showCustom && customDomain.trim() ? customDomain.trim() : domain;
  const canStart = activeDomain.length > 0;

  const handleStart = () => {
    const params = new URLSearchParams({ domain: activeDomain, mode, difficulty });
    navigate(`/interview/session?${params}`);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Smart Session Builder
            </span>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Interview Setup</h1>
            <p className="text-sm text-white/85">Configure your next {brandName} practice session in under a minute.</p>
          </div>
        </section>

        {/* Domain */}
        <div className="bg-card p-6 mb-5 border border-border/60 rounded-2xl shadow-sm">
          <label className="text-sm font-bold text-foreground mb-4 block uppercase tracking-wider">Select Domain</label>
          <div className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => { setDomain(d); setShowCustom(false); }}
                className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  domain === d && !showCustom
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary/50 hover:border-border hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => { setShowCustom(true); setDomain(""); }}
              className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                showCustom
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary/50 hover:border-border hover:text-foreground"
              }`}
            >
              <Plus className="h-3 w-3" /> Custom
            </button>
          </div>
          {showCustom && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Enter custom topic (e.g. Machine Learning, DevOps)"
                className="rounded-xl h-10 bg-secondary/30 border-border/50 text-sm focus:ring-1 focus:ring-amber-500/30"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Mode & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-card p-6 border border-border/60 rounded-2xl shadow-sm">
            <label className="text-sm font-bold text-foreground mb-4 block uppercase tracking-wider">Interview Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("chat")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  mode === "chat" ? "border-sky-500/40 bg-sky-500/5 ring-1 ring-sky-500/20" : "border-border/50 bg-secondary/10 hover:bg-secondary/30"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 border ${
                  mode === "chat" ? "bg-sky-600 text-white border-sky-600" : "bg-card text-muted-foreground border-border/50"
                }`}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <p className="font-bold text-foreground text-xs">Chat Mode</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Type answers</p>
              </button>
              <button
                onClick={() => setMode("voice")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  mode === "voice" ? "border-violet-500/40 bg-violet-500/5 ring-1 ring-violet-500/20" : "border-border/50 bg-secondary/10 hover:bg-secondary/30"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 border ${
                  mode === "voice" ? "bg-violet-600 text-white border-violet-600" : "bg-card text-muted-foreground border-border/50"
                }`}>
                  <Mic className="h-4 w-4" />
                </div>
                <p className="font-bold text-foreground text-xs">Voice Mode</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Speak naturally</p>
              </button>
            </div>
          </div>

          <div className="bg-card p-6 border border-border/60 rounded-2xl shadow-sm">
            <label className="text-sm font-bold text-foreground mb-4 block uppercase tracking-wider">Difficulty Level</label>
            <div className="flex flex-col gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                    difficulty === d
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-secondary/10 text-muted-foreground border-border/50 hover:bg-secondary/30"
                  }`}
                >
                  {d}
                  {difficulty === d && <ArrowRight className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleStart} 
          disabled={!canStart} 
          className="w-full sm:w-auto gap-2 h-11 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 text-sm"
        >
          Start Practice Session <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </DashboardLayout>
  );
}
