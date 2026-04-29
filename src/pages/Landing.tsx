import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, MessageSquare, Mic, BarChart3, Target, Zap, ArrowRight, Users, BookOpen, Award, Sparkles, ShieldCheck, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const brandName = "Intervu";

const features = [
  { icon: Brain, title: "AI-Powered Questions", desc: "Dynamic questions tailored to your domain and skill level." },
  { icon: MessageSquare, title: "Chat Mode", desc: "Text-based interviews with real-time AI evaluation." },
  { icon: Mic, title: "Voice Mode", desc: "Speak your answers naturally with live transcription." },
  { icon: BarChart3, title: "Instant Scoring", desc: "Get detailed feedback with strengths and improvements." },
  { icon: Target, title: "Adaptive Difficulty", desc: "Questions adjust based on your performance level." },
  { icon: Zap, title: "Detailed Reports", desc: "Track your progress with comprehensive analytics." },
];

const stats = [
  { value: "1,600+", label: "Questions" },
  { value: "100k+", label: "Interviews" },
  { value: "120k+", label: "Users" },
];

const steps = [
  { num: "1", title: "Choose Your Domain", desc: "Select from React, Node.js, DSA, System Design, and more." },
  { num: "2", title: "Pick Your Mode", desc: "Chat or Voice — whichever suits your preparation style." },
  { num: "3", title: "Start the Interview", desc: "AI asks questions, you answer, and get instant feedback." },
];

const roles = [
  { icon: Users, title: "Job Seekers", desc: "Build confidence and prepare for real technical interviews." },
  { icon: BookOpen, title: "Students", desc: "Practice coding concepts and system design fundamentals." },
  { icon: Award, title: "Professionals", desc: "Stay sharp and improve your interviewing skills." },
];

const faqs = [
  { q: "What is Intervu?", a: "An AI-powered platform that simulates real technical interviews with instant feedback." },
  { q: "Is it free to use?", a: "Yes! Create a free account and start practicing interviews immediately." },
  { q: "Which domains are supported?", a: "React, Node.js, DSA, System Design, JavaScript, Python, SQL, and more." },
  { q: "How does voice mode work?", a: "Use your microphone to speak answers. The AI transcribes and evaluates them in real time." },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <Brain className="h-6 w-6 text-foreground" />
            <span className="font-bold tracking-tight text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative section-padding pt-16 md:pt-20 lg:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/25 blur-3xl" />
          <div className="absolute top-20 -left-20 h-[260px] w-[260px] rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute top-28 -right-16 h-[300px] w-[300px] rounded-full bg-teal-300/20 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 backdrop-blur px-4 py-1.5 text-sm text-muted-foreground mb-7">
              <Sparkles className="h-3.5 w-3.5" /> Premium AI Interview Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.02] mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Crack Interviews
              <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">with {brandName}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              A sharper way to practice technical interviews with adaptive prompts, realistic pressure, and instant evaluator-grade feedback.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-8">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-8 h-12 text-base rounded-xl shadow-lg shadow-foreground/10">
                  Start Free Session <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-12 text-base rounded-xl border-border/70 bg-background/70 backdrop-blur">View Dashboard</Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 bg-background/70 backdrop-blur text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Trusted by candidates
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 bg-background/70 backdrop-blur text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 text-amber-600" /> Setup in 60 seconds
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-white to-slate-50 p-5 shadow-2xl shadow-slate-900/10">
              <div className="rounded-2xl border border-border/60 bg-background p-5">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {brandName} Performance Snapshot
                  </p>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    Live Analysis
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-secondary/70 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">92%</p>
                    <p className="text-xs text-muted-foreground">Clarity</p>
                  </div>
                  <div className="rounded-xl bg-secondary/70 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">88%</p>
                    <p className="text-xs text-muted-foreground">Depth</p>
                  </div>
                  <div className="rounded-xl bg-secondary/70 p-3 text-center">
                    <p className="text-xl font-bold text-foreground">95%</p>
                    <p className="text-xs text-muted-foreground">Impact</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="rounded-lg border border-border/70 px-3 py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Communication</span>
                    <span className="font-semibold text-foreground">Advanced</span>
                  </div>
                  <div className="rounded-lg border border-border/70 px-3 py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">System Design</span>
                    <span className="font-semibold text-foreground">Strong</span>
                  </div>
                  <div className="rounded-lg border border-border/70 px-3 py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Problem Solving</span>
                    <span className="font-semibold text-foreground">Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <motion.div key={s.label} {...fadeUp} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative section-padding bg-secondary/35">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.12),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.12),transparent_35%)]" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-amber-700 uppercase tracking-[0.22em] mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Everything You Need to Ace Your Interviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border/70 bg-white/70 backdrop-blur p-6 hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/10 flex items-center justify-center mb-4 border border-amber-400/20">
                  <f.icon className="h-5 w-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-sky-700 uppercase tracking-[0.22em] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>From Setup to Results in Three Steps</h2>
          </div>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative rounded-2xl border border-border/70 bg-gradient-to-r from-white to-slate-50 p-6 flex gap-5 items-start shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect for every role */}
      <section id="use-cases" className="section-padding bg-secondary/35">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-[0.22em] mb-3">Use Cases</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Built for Every Career Stage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <motion.div key={r.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-white/80 backdrop-blur border border-border/60 p-7 text-center hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center mx-auto mb-5 border border-border/30 group-hover:from-emerald-500/30 transition-all duration-300">
                  <r.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-rose-700 uppercase tracking-[0.22em] mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.div key={f.q} {...fadeUp} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-border/60 bg-gradient-to-br from-white to-rose-50/30 p-6 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-900/10 transition-all duration-300">
                <h3 className="font-bold text-foreground mb-3 text-base" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">🚀 Ready to Master Interviews?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg leading-relaxed">Join thousands of developers preparing for their next big opportunity with confidence.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="gap-2 px-8 h-12 text-base rounded-lg">
                Start Practicing
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base rounded-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-14 bg-gradient-to-b from-background via-secondary/20 to-amber-50/40">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-3 md:justify-start justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <p className="text-sm text-muted-foreground md:text-right text-center">© 2026 {brandName} AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
