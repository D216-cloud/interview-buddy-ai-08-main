import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, ChevronRight, Filter, RefreshCw, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";

const DOMAINS = ["React", "Node.js", "DSA", "System Design", "JavaScript", "Python", "SQL", "TypeScript", "Java", "AWS"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const QUESTION_BANK: Record<string, { question: string; difficulty: string; hint: string }[]> = {
  "React": [
    { question: "What is the difference between props and state in React?", difficulty: "Beginner", hint: "Think about mutability and ownership." },
    { question: "Explain the useEffect hook and when to use it.", difficulty: "Intermediate", hint: "Consider side effects and cleanup functions." },
    { question: "How does React's reconciliation algorithm work?", difficulty: "Advanced", hint: "Think about the virtual DOM and diffing." },
    { question: "What are React hooks and why were they introduced?", difficulty: "Beginner", hint: "Consider the problems with class components." },
    { question: "Explain React Context API and when to use it over Redux.", difficulty: "Intermediate", hint: "Think about prop drilling and global state." },
    { question: "How do you optimize performance in a React application?", difficulty: "Advanced", hint: "Consider memoization, lazy loading, code splitting." },
  ],
  "Node.js": [
    { question: "What is the event loop in Node.js?", difficulty: "Intermediate", hint: "Think about how Node handles async operations." },
    { question: "Explain the difference between require() and import in Node.js.", difficulty: "Beginner", hint: "CJS vs ESM modules." },
    { question: "How do you handle errors in async/await code?", difficulty: "Intermediate", hint: "try/catch and Promise.catch." },
    { question: "What is middleware in Express.js?", difficulty: "Beginner", hint: "Think about the request-response cycle." },
    { question: "Explain clustering in Node.js and when to use it.", difficulty: "Advanced", hint: "Multi-core utilization." },
  ],
  "DSA": [
    { question: "What is the time complexity of binary search?", difficulty: "Beginner", hint: "Think about how many times you halve the array." },
    { question: "Explain the difference between BFS and DFS.", difficulty: "Intermediate", hint: "Queue vs Stack, level-order vs depth-first." },
    { question: "What is dynamic programming? Give an example.", difficulty: "Advanced", hint: "Overlapping subproblems and optimal substructure." },
    { question: "How does a hash table work?", difficulty: "Beginner", hint: "Think about hash functions and collision handling." },
    { question: "Explain Dijkstra's shortest path algorithm.", difficulty: "Advanced", hint: "Priority queue and greedy approach." },
  ],
  "System Design": [
    { question: "How would you design a URL shortener like bit.ly?", difficulty: "Intermediate", hint: "Think about encoding, database design, and scaling." },
    { question: "Design a chat application like WhatsApp.", difficulty: "Advanced", hint: "WebSockets, message queues, storage." },
    { question: "Explain CAP theorem with examples.", difficulty: "Intermediate", hint: "Consistency, Availability, Partition tolerance." },
    { question: "How would you design a rate limiter?", difficulty: "Advanced", hint: "Token bucket, sliding window algorithms." },
    { question: "What is a CDN and how does it work?", difficulty: "Beginner", hint: "Think about edge servers and caching." },
  ],
  "JavaScript": [
    { question: "Explain closures in JavaScript with an example.", difficulty: "Intermediate", hint: "Lexical scope and function factories." },
    { question: "What is the difference between == and === in JavaScript?", difficulty: "Beginner", hint: "Type coercion." },
    { question: "Explain the event delegation pattern.", difficulty: "Intermediate", hint: "Bubbling and capturing in the DOM." },
    { question: "What is a Promise and how does Promise.all work?", difficulty: "Intermediate", hint: "Async operations and parallel execution." },
    { question: "Explain prototypal inheritance in JavaScript.", difficulty: "Advanced", hint: "Prototype chain and Object.create." },
  ],
};

const difficultyColor: Record<string, string> = {
  Beginner: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20",
  Intermediate: "text-blue-600 bg-blue-600/10 border-blue-600/20",
  Advanced: "text-purple-600 bg-purple-600/10 border-purple-600/20",
};

export default function QuestionBank() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState("React");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const questions = (QUESTION_BANK[selectedDomain] || []).filter(
    (q) => selectedDifficulty === "All" || q.difficulty === selectedDifficulty
  );

  const toggleHint = (i: number) => setRevealedHints((prev) => ({ ...prev, [i]: !prev[i] }));

  const copyQuestion = (q: string, i: number) => {
    navigator.clipboard.writeText(q);
    setCopiedIdx(i);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const practiceQuestion = (q: string) => {
    const params = new URLSearchParams({ domain: selectedDomain, mode: "chat", difficulty: selectedDifficulty === "All" ? "Intermediate" : selectedDifficulty });
    navigate(`/interview/session?${params}`);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Curated Library
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Question Bank</h1>
            <p className="text-sm text-white/85">Browse interview-ready questions by domain, difficulty, and instant practice flow.</p>
          </div>
        </section>

        {/* Domain Filter */}
        <div className="bg-card p-5 mb-5 border border-border/60 rounded-2xl shadow-sm">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Select Domain</label>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedDomain === d
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty + Actions Row */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedDifficulty === d
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={() => navigate(`/interview/session?domain=${selectedDomain}&mode=chat&difficulty=${selectedDifficulty === "All" ? "Intermediate" : selectedDifficulty}`)}
            className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> Practice All with AI
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No questions for this filter. Try a different domain or difficulty.
            </div>
          ) : questions.map((q, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:border-violet-500/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/30">
                      Q{i + 1}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyColor[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-relaxed" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{q.question}</p>

                  {revealedHints[i] && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">💡 Hint</p>
                      <p className="text-xs text-muted-foreground">{q.hint}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => copyQuestion(q.question, i)}
                    className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
                    title="Copy question"
                  >
                    {copiedIdx === i ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => toggleHint(i)}
                    className="h-8 w-8 rounded-lg border border-amber-500/30 flex items-center justify-center text-amber-600 hover:bg-amber-500/10 transition-all text-xs font-bold"
                    title="Show hint"
                  >
                    💡
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/20 flex justify-end">
                <Button
                  onClick={() => practiceQuestion(q.question)}
                  variant="outline"
                    className="h-8 px-4 rounded-lg text-xs font-bold gap-1.5 border-slate-900/20 text-slate-700 hover:bg-slate-900/5"
                >
                  Practice This <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground mb-3">Want more questions? Start a live AI-powered session.</p>
          <Button
            onClick={() => navigate("/interview/setup")}
            className="h-10 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md"
          >
            Start Full Interview Session →
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
