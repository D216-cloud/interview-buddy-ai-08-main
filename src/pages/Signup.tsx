import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import * as db from "@/integrations/supabase/database";

const brandName = "Intervu";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
      });
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Create user profile immediately after signup
      if (data.user?.id) {
        await db.createUserProfile(data.user.id, name, email);
        toast.success("Account created! You can now sign in.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 rounded-3xl border border-border/70 overflow-hidden shadow-2xl shadow-slate-900/10 bg-white">
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-white">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.25),transparent_35%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
              <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>
            </Link>
            <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Start strong.
              <span className="block text-cyan-100">Train smarter for every interview.</span>
            </h2>
            <p className="text-white/90 text-base leading-relaxed max-w-md">
              Create your account to unlock realistic interview simulations, structured scoring, and progress tracking built for technical roles.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-3 py-2.5 backdrop-blur">
              <ShieldCheck className="h-4 w-4" /> Free signup, no friction
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-3 py-2.5 backdrop-blur">
              <Trophy className="h-4 w-4" /> Built for interview wins
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-6 md:p-10">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.15),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(16,185,129,0.12),transparent_35%)]" />
          <div className="relative w-full max-w-sm">
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Create Premium Account
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Sign Up</h1>
              <p className="text-base text-muted-foreground">Create your {brandName} account and start interview practice</p>
            </div>

            <div className="rounded-2xl p-7 border border-border/60 bg-white/80 backdrop-blur shadow-xl shadow-slate-900/10">
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="mt-2 h-12 rounded-xl border-border/60 focus:border-sky-500/60 bg-secondary/30 focus:bg-white transition-colors" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-2 h-12 rounded-xl border-border/60 focus:border-sky-500/60 bg-secondary/30 focus:bg-white transition-colors" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-2 h-12 rounded-xl border-border/60 focus:border-sky-500/60 bg-secondary/30 focus:bg-white transition-colors" />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground font-semibold hover:text-sky-700 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
