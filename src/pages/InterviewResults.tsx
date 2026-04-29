import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, TrendingUp, BarChart3, Target, Award, 
  Share2, Calendar, Clock, ChevronRight, CheckCircle2,
  AlertCircle, Trophy, Star
} from "lucide-react";
import { toast } from "sonner";
import * as db from "@/integrations/supabase/database";
import type { InterviewSession, QuestionResponse, FeedbackLog } from "@/integrations/supabase/types";
import ReactMarkdown from "react-markdown";

export default function InterviewResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [feedback, setFeedback] = useState<FeedbackLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      if (!sessionId) return;
      const [sessionData, responsesData, feedbackData] = await Promise.all([
        db.getInterviewSession(sessionId),
        db.getQuestionResponses(sessionId),
        db.getSessionFeedback(sessionId),
      ]);
      setSession(sessionData);
      setResponses(responsesData);
      setFeedback(feedbackData);
    } catch (error) {
      toast.error("Failed to load interview results");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (session) {
      const text = `I just completed an interview on ${session.domain} with a score of ${Math.round(session.performance_score || 0)}%! Check out Interview Buddy AI.`;
      if (navigator.share) {
        navigator.share({ title: "Interview Results", text });
      } else {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 text-foreground flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
        />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Analyzing performance...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-secondary/30 text-foreground flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-6 text-sm">Session not found</p>
        <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg">Go to Dashboard</Button>
      </div>
    );
  }

  const score = Math.round(session.performance_score || 0);
  
  return (
    <div className="min-h-screen bg-secondary/30 text-foreground selection:bg-blue-500/20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Top Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10"
        >
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center border border-border/50 group-hover:border-border shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-semibold text-xs">Dashboard</span>
          </button>

          <Button 
            onClick={handleShare}
            variant="outline"
            className="rounded-lg border-border/50 bg-card hover:bg-secondary text-foreground gap-2 h-9 text-xs"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </motion.div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-4">
              <Trophy className="w-3.5 h-3.5" /> Summary
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">
              Great Session!
            </h1>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed">
              You've shown good skills in <span className="text-foreground font-bold">{session.domain}</span>. 
              Review your feedback below to grow further.
            </p>

            <div className="flex flex-wrap gap-5 mt-6">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center border border-border/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Date</p>
                  <p className="text-xs font-semibold">{new Date(session.created_at || "").toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center border border-border/50">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Duration</p>
                  <p className="text-xs font-semibold">{session.duration_minutes}m</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center border border-border/50">
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Level</p>
                  <p className="text-xs font-semibold">{session.difficulty}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-600/10"
          >
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-white/20" strokeWidth="10" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                <motion.circle 
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{ strokeDasharray: `${(score / 100) * 264} 264` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-white" 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="42" cx="50" cy="50" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{score}%</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/70">Score</span>
              </div>
            </div>
            <div className="flex gap-0.5 text-yellow-300 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 fill-current ${s > (score / 20) ? 'opacity-30' : ''}`} />
              ))}
            </div>
            <h3 className="text-sm font-bold text-white">Overall Match</h3>
          </motion.div>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:border-border transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-600/10 flex items-center justify-center border border-emerald-600/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {(feedback?.strengths?.split(";") || ["Solid understanding", "Clear communication"]).map((s, i) => (
                <li key={i} className="flex gap-2.5 text-muted-foreground text-xs leading-relaxed">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {s.trim()}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:border-border transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-orange-600/10 flex items-center justify-center border border-orange-600/10">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold">Improvements</h3>
            </div>
            <ul className="space-y-3">
              {(feedback?.areas_to_improve?.split(";") || ["Deeper knowledge needed", "Focus on use cases"]).map((s, i) => (
                <li key={i} className="flex gap-2.5 text-muted-foreground text-xs leading-relaxed">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  {s.trim()}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Question Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-2xl font-bold">Breakdown</h3>
            <span className="text-muted-foreground text-[10px] font-bold uppercase">{responses.length} Rounds</span>
          </div>

          <div className="space-y-4">
            {responses.map((resp, i) => (
              <div 
                key={i}
                className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-5 justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-blue-600 px-1.5 py-0.5 rounded text-white">Q{resp.question_number}</span>
                      <h4 className="text-lg font-bold text-foreground leading-tight">{resp.question_text}</h4>
                    </div>
                    
                    <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1.5">Your Response</p>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">"{resp.user_answer}"</p>
                    </div>

                    {resp.ai_evaluation && (
                      <div className="bg-blue-600/5 rounded-xl p-3 border border-blue-600/10">
                        <p className="text-[8px] uppercase font-bold text-blue-600 mb-1.5">AI Analysis</p>
                        <div className="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown>{resp.ai_evaluation}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1 min-w-[60px]">
                    <div className="text-2xl font-black text-blue-600">{Math.round(resp.score || 0)}%</div>
                    <span className="text-[8px] font-bold uppercase text-muted-foreground">Match</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 text-center space-y-8"
        >
          <div className="max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h2 className="text-3xl font-bold">Want to improve further?</h2>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold"
            >
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/interview/setup")}
              className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
            >
              Start New Practice →
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
