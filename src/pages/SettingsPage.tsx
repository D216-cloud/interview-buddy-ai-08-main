import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Lock, Key, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) { toast.error(error.message); } else { toast.success("Password updated successfully"); setNewPassword(""); }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl mx-auto">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 p-6 md:p-7 text-white shadow-xl shadow-slate-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Security Center
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Settings</h1>
            <p className="text-sm md:text-base text-white/85">Manage your account settings and preferences.</p>
          </div>
        </section>

        <div className="glass-card p-8 mb-7 border border-border/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center border border-border/30">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Account Information</h2>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 flex items-center justify-center border border-border/30">
              <Key className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-bold text-foreground text-lg">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <Label htmlFor="newpw" className="text-sm font-semibold">New Password</Label>
              <Input 
                id="newpw" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                className="mt-2 h-12 rounded-lg bg-secondary/30 focus:bg-secondary/50 border-border/50 focus:border-sky-500/60 transition-colors" 
              />
              <p className="text-xs text-muted-foreground mt-2">Must be at least 6 characters</p>
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="h-12 rounded-lg px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
