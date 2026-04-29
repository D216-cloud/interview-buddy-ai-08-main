import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ShieldCheck, Sparkles, Clock3 } from "lucide-react";
import { toast } from "sonner";

const brandName = "Intervu";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 rounded-3xl border border-border/70 overflow-hidden shadow-2xl shadow-slate-900/10 bg-white">
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.25),transparent_35%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
              <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>
            </Link>
            <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Welcome back.
              <span className="block text-amber-100">Your next interview starts here.</span>
            </h2>
            <p className="text-white/90 text-base leading-relaxed max-w-md">
              Continue your interview prep with adaptive AI rounds, voice or chat practice, and instant confidence-building feedback.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-3 py-2.5 backdrop-blur">
              <ShieldCheck className="h-4 w-4" /> Secure authentication
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-3 py-2.5 backdrop-blur">
              <Clock3 className="h-4 w-4" /> Setup in 60 seconds
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-6 md:p-10">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.15),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(14,165,233,0.12),transparent_35%)]" />
          <div className="relative w-full max-w-sm">
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Premium Access
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Sign In</h1>
              <p className="text-base text-muted-foreground">Access your {brandName} dashboard and continue practicing</p>
            </div>

            <div className="rounded-2xl p-7 border border-border/60 bg-white/80 backdrop-blur shadow-xl shadow-slate-900/10">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-2 h-12 rounded-xl border-border/60 focus:border-amber-500/60 bg-secondary/30 focus:bg-white transition-colors" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-2 h-12 rounded-xl border-border/60 focus:border-amber-500/60 bg-secondary/30 focus:bg-white transition-colors" />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-foreground font-semibold hover:text-amber-700 transition-colors">Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
