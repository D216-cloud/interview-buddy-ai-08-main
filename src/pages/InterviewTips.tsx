import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, ChevronRight, CheckCircle2, BookMarked, Zap } from "lucide-react";

const TIPS = [
  {
    category: "Before the Interview",
    color: "blue",
    items: [
      "Research the company's tech stack and recent engineering blog posts.",
      "Practice your answers to behavioral questions (STAR method).",
      "Set up your development environment and test your microphone/camera.",
      "Get a good night's sleep — cognitive performance drops 20% when tired.",
    ]
  },
  {
    category: "During the Interview",
    color: "purple",
    items: [
      "Think out loud — interviewers want to hear your reasoning, not just the answer.",
      "Ask clarifying questions before diving into a solution.",
      "Manage your time — don't spend more than 5 minutes on a single approach.",
      "It's OK to pause and think. Silence is better than panicking.",
    ]
  },
  {
    category: "Technical Answers",
    color: "emerald",
    items: [
      "Always explain the Big-O complexity of your solution.",
      "Start with a brute-force approach, then optimize.",
      "Draw diagrams when explaining system design questions.",
      "Mention trade-offs — there's rarely one perfect answer.",
    ]
  },
  {
    category: "After the Interview",
    color: "orange",
    items: [
      "Send a thank-you email within 24 hours.",
      "Review questions you struggled with and study those topics.",
      "Track your interview performance to identify patterns.",
      "Don't be discouraged by rejections — every interview is practice.",
    ]
  }
];

const ROADMAPS = [
  {
    title: "Frontend Developer",
    steps: ["HTML/CSS/JS Fundamentals", "React or Vue", "State Management", "Testing", "Performance & Optimization", "System Design Basics"],
    color: "blue",
    emoji: "🌐",
  },
  {
    title: "Backend Developer",
    steps: ["Node.js / Python / Java", "REST APIs & GraphQL", "Databases (SQL & NoSQL)", "Authentication & Security", "Caching & Queues", "System Design"],
    color: "purple",
    emoji: "⚙️",
  },
  {
    title: "Full Stack",
    steps: ["Frontend + Backend Basics", "API Design", "Database Design", "DevOps & CI/CD", "Cloud Deployment", "System Architecture"],
    color: "emerald",
    emoji: "🚀",
  },
];

const colorMap: Record<string, { card: string; badge: string; dot: string }> = {
  blue:    { card: "bg-blue-600/5 border-blue-600/10",    badge: "bg-blue-600/10 text-blue-600 border-blue-600/20",    dot: "bg-blue-500" },
  purple:  { card: "bg-purple-600/5 border-purple-600/10", badge: "bg-purple-600/10 text-purple-600 border-purple-600/20", dot: "bg-purple-500" },
  emerald: { card: "bg-emerald-600/5 border-emerald-600/10", badge: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20", dot: "bg-emerald-500" },
  orange:  { card: "bg-orange-600/5 border-orange-600/10", badge: "bg-orange-600/10 text-orange-600 border-orange-600/20",  dot: "bg-orange-500" },
};

export default function InterviewTips() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] mb-3">
              <Zap className="h-3.5 w-3.5" /> Expert Playbook
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Interview Tips</h1>
            <p className="text-sm text-white/85">Expert guidance to help you ace your next technical interview.</p>
          </div>
        </section>

        {/* Quick Win Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-6 mb-7 shadow-lg shadow-sky-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-white" />
            <h3 className="font-bold text-white text-base">Today's Quick Tip</h3>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            When answering a system design question, always start with clarifying requirements. 
            Ask about scale, users, and constraints before jumping into the architecture. 
            This shows structured thinking and maturity.
          </p>
        </div>

        {/* Tips Sections */}
        <div className="space-y-5 mb-10">
          {TIPS.map((section) => {
            const c = colorMap[section.color];
            return (
              <div key={section.category} className={`bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.badge}`}>
                    {section.category}
                  </span>
                </div>
                <ul className="space-y-3">
                  {section.items.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 shrink-0`} />
                      <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Learning Roadmaps */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <BookMarked className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-bold text-foreground">Learning Roadmaps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROADMAPS.map((r) => {
              const c = colorMap[r.color];
              return (
                <div key={r.title} className={`rounded-2xl border p-5 ${c.card}`}>
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <h3 className="font-bold text-foreground text-sm mb-4">{r.title}</h3>
                  <ol className="space-y-2">
                    {r.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <span className={`w-4 h-4 rounded-full ${c.dot} flex items-center justify-center text-white font-black shrink-0`} style={{ fontSize: 8 }}>
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-foreground text-base mb-1">Ready to put this into practice?</h3>
            <p className="text-xs text-muted-foreground">Start a live AI interview and apply these tips in real-time.</p>
          </div>
          <Button
            onClick={() => navigate("/interview/setup")}
            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm gap-2 shadow-md whitespace-nowrap"
          >
            Start Interview <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
