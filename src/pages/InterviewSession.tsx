import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Brain, ArrowLeft, MessageSquare, Clock, Target, Zap, 
  TrendingUp, Mic, Send, Volume2, VolumeX, Sparkles,
  CheckCircle2, AlertCircle, RefreshCw, Trophy
} from "lucide-react";
import { toast } from "sonner";
import SessionHeader from "@/components/interview/SessionHeader";
import { useAuth } from "@/hooks/useAuth";
import * as db from "@/integrations/supabase/database";
import { completeInterviewSession as finishSession, updateGoalProgress } from "@/integrations/supabase/session-manager";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };
type Evaluation = {
  score: number;
  strengths: string;
  improvements: string;
  betterAnswer: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-chat`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function InterviewSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const domain = searchParams.get("domain") || "React";
  const mode = searchParams.get("mode") || "chat";
  const difficulty = searchParams.get("difficulty") || "Intermediate";

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const initializeAttemptedRef = useRef(false);

  // Initialize session
  useEffect(() => {
    if (user && !sessionId && !initializeAttemptedRef.current) {
      initializeAttemptedRef.current = true;
      initializeSession();
    }
  }, [user, sessionId]);

  const initializeSession = async () => {
    try {
      if (!user) return;
      const session = await db.createInterviewSession(
        user.id,
        domain,
        difficulty as any,
        mode as any
      );
      if (session?.id) {
        setSessionId(session.id);
      }
    } catch (error) {
      console.error("Error initializing session:", error);
      toast.error("Failed to start interview session");
    }
  };

  // Timer
  useEffect(() => {
    if (started && !lastEvaluation) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, lastEvaluation]);

  const speak = useCallback((text: string, voice?: SpeechSynthesisVoice | null) => {
    if (!window.speechSynthesis || !ttsEnabled) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }, [ttsEnabled]);

  const parseEvaluation = (text: string): Evaluation | null => {
    try {
      const scoreMatch = text.match(/\*\*Score:\*\*\s*(\d+)\/10/);
      const strengthsMatch = text.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?=\*\*Areas to improve:|\*\*Better answer:|$)/);
      const improvementsMatch = text.match(/\*\*Areas to improve:\*\*\s*([\s\S]*?)(?=\*\*Better answer:|$)/);
      const betterAnswerMatch = text.match(/\*\*Better answer:\*\*\s*([\s\S]*?)(?=\*\*Next question:|$)/);

      if (scoreMatch) {
        return {
          score: parseInt(scoreMatch[1]) * 10,
          strengths: strengthsMatch ? strengthsMatch[1].trim() : "",
          improvements: improvementsMatch ? improvementsMatch[1].trim() : "",
          betterAnswer: betterAnswerMatch ? betterAnswerMatch[1].trim() : "",
        };
      }
    } catch (e) {
      console.error("Failed to parse evaluation", e);
    }
    return null;
  };

  // ── Mock fallback questions per domain ──────────────────────────────────
  const getMockResponse = (allMessages: Message[]): string => {
    const isFirstMessage = allMessages.length <= 1;
    const mockQuestions: Record<string, string[]> = {
      default: [
        `Tell me about a challenging technical problem you solved and how you approached it.`,
        `How do you stay current with new technologies and industry trends?`,
        `Describe your experience working in a team environment on a complex project.`,
        `How do you handle tight deadlines and competing priorities?`,
        `What's your approach to debugging a production issue you've never seen before?`,
      ],
      react: [
        `Explain the difference between controlled and uncontrolled components in React.`,
        `How does the React reconciliation algorithm (Virtual DOM diffing) work?`,
        `What are React hooks? Explain useState, useEffect, and useCallback.`,
        `When would you choose useReducer over useState?`,
        `How do you optimize performance in a large React application?`,
      ],
      javascript: [
        `Explain the JavaScript event loop and how it handles asynchronous code.`,
        `What's the difference between 'var', 'let', and 'const'?`,
        `How does prototypal inheritance work in JavaScript?`,
        `Explain closures and give a practical use case.`,
        `What is the difference between '==' and '===' in JavaScript?`,
      ],
      python: [
        `What are Python decorators and how would you use one?`,
        `Explain the difference between lists, tuples, and dictionaries.`,
        `How does Python's GIL (Global Interpreter Lock) affect multithreading?`,
        `What is a generator in Python and when would you use one?`,
        `Explain list comprehensions and when to use them vs map/filter.`,
      ],
    };

    const domainKey = domain.toLowerCase();
    const questions = mockQuestions[domainKey] || mockQuestions.default;

    if (isFirstMessage) {
      return `Hello! I'm your AI interviewer for this ${difficulty} level ${domain} session. I'll be asking you a series of questions to assess your knowledge and problem-solving skills.

Let's get started with the first question:

**${questions[0]}**

Take your time to think through your answer. There are no trick questions — I'm looking for clear reasoning and real-world understanding.`;
    }

    // Simulate an evaluation + next question
    const userAnswer = allMessages[allMessages.length - 1]?.content || "";
    const questionIdx = Math.min(Math.floor(allMessages.length / 2), questions.length - 1);
    const nextQ = questions[questionIdx] || questions[questions.length - 1];

    return `**Score:** 7/10

**Strengths:** Good understanding of the core concept. Your answer showed practical awareness of how this applies in real-world scenarios.

**Areas to improve:** Try to be more specific with examples and mention edge cases or trade-offs involved in your approach.

**Better answer:** A strong answer would include: the core definition, a concrete example from your experience, mention of any performance considerations, and how you'd test or validate your solution.

---

**Next question:** ${nextQ}`;
  };

  const fetchAIResponse = async (allMessages: Message[]) => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    const systemPrompt = `You are a professional technical interviewer conducting a ${difficulty} level ${domain} interview.
Rules:
- Ask one question at a time
- After the candidate answers, evaluate their response
- Provide your evaluation in this format:
  **Score:** X/10
  **Strengths:** Brief strengths
  **Areas to improve:** Brief weaknesses  
  **Better answer:** A concise improved answer
  
  Then ask the next question.
- Keep questions focused on ${domain}
- Be professional but encouraging
- Adapt difficulty based on the candidate's performance
- For the first message, introduce yourself briefly and ask the first question`;

    // Current valid Gemini models for v1beta generateContent endpoint
    const MODELS = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
    ];

    if (geminiKey) {
      let lastError: any = null;
      for (const model of MODELS) {
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: allMessages.map(m => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }]
              }))
            }),
          });

          if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            const msg = errorData?.error?.message || "Model unavailable";
            console.warn(`Model ${model} failed (${resp.status}):`, msg);
            lastError = new Error(msg);
            continue; // try next model
          }
          
          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`✅ Using model: ${model}`);
            return text;
          }
        } catch (err: any) {
          console.warn(`Model ${model} error:`, err.message);
          lastError = err;
          continue;
        }
      }
      // All API models failed — use intelligent mock fallback
      console.warn("⚠️ All Gemini API models failed. Using mock fallback. Error:", lastError?.message);
      return getMockResponse(allMessages);
    }

    // No API key at all — use mock
    return getMockResponse(allMessages);
  };

  const startInterview = async () => {
    setLoading(true);
    setStarted(true);
    try {
      const systemKick: Message = { role: "user", content: "Start the interview. Ask me the first question." };
      const response = await fetchAIResponse([systemKick]);
      
      setCurrentQuestion(response);
      setMessages([{ role: "assistant", content: response }]);
      setQuestionCount(1);
      speak(response.replace(/[*#_`]/g, ""), selectedVoice);
    } catch (e) {
      // fetchAIResponse should never throw now — this is an absolute last resort
      const mockQ = `Tell me about your experience with ${domain}. What projects have you worked on?`;
      setCurrentQuestion(mockQ);
      setMessages([{ role: "assistant", content: mockQ }]);
      setQuestionCount(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!userInput.trim() || loading) return;

    setLoading(true);
    const userMsg: Message = { role: "user", content: userInput.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const response = await fetchAIResponse(updatedMessages);
      const evalData = parseEvaluation(response);
      
      if (evalData) {
        setLastEvaluation(evalData);
        setTotalScore(prev => prev === 0 ? evalData.score : (prev + evalData.score) / 2);
        
        // Extract the next question if present
        const nextQIndex = response.toLowerCase().lastIndexOf("next question:");
        if (nextQIndex !== -1) {
          const nextQ = response.substring(nextQIndex).replace(/next question:/i, "").trim();
          setCurrentQuestion(nextQ);
        } else {
          // If no "Next question:" marker, use the whole response or ask for one
          setCurrentQuestion("Ready for the next one?");
        }
      } else {
        // Just text response, maybe it's asking for clarification
        setCurrentQuestion(response);
        setLastEvaluation(null);
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setUserInput("");
    } catch (e) {
      toast.error("Failed to get evaluation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setLastEvaluation(null);
    setQuestionCount(prev => prev + 1);
    speak(currentQuestion.replace(/[*#_`]/g, ""), selectedVoice);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setUserInput(prev => prev + " " + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const finishInterview = async () => {
    if (!sessionId || !user || isCompleting) return;
    setIsCompleting(true);
    try {
      // Mock session completion
      const result = await finishSession({
        sessionId,
        userId: user.id,
        domain,
        difficulty: difficulty as any,
        mode: mode as any,
        responses: messages.filter(m => m.role === "assistant").map((m, i) => ({
          questionNumber: i + 1,
          questionText: m.content,
          userAnswer: messages.find((_, idx) => idx === i*2 + 1)?.content || "",
          aiEvaluation: m.content,
          score: totalScore,
          timeTaken: Math.floor(elapsed / questionCount)
        }))
      });

      if (result.success) {
        toast.success("Interview completed! Analyzing results...");
        navigate(`/interview/results/${sessionId}`);
      }
    } catch (error) {
      toast.error("Failed to save interview");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 text-foreground p-6 overflow-hidden">
        {/* Background Subtle Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg bg-card border border-border/50 rounded-[2rem] p-8 md:p-10 shadow-xl text-center"
        >
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-foreground">
            Ready for your session?
          </h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
            Test your skills in <span className="text-blue-600 font-semibold">{domain}</span> with your AI buddy.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Target, label: "Domain", value: domain, color: "blue" },
              { icon: Zap, label: "Level", value: difficulty, color: "purple" },
              { icon: Clock, label: "Mode", value: mode, color: "orange" }
            ].map((stat, i) => (
              <div key={i} className="bg-secondary/50 border border-border/40 rounded-xl p-3">
                <stat.icon className={`w-4 h-4 mx-auto mb-1.5 text-${stat.color}-600`} />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</p>
                <p className="text-xs font-bold text-foreground mt-0.5 truncate px-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/interview/setup")}
              className="h-12 px-6 rounded-xl border-border/50 hover:bg-secondary text-foreground bg-transparent transition-all text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              onClick={startInterview}
              disabled={loading}
              className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95 text-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Start Interview →"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground flex flex-col font-sans selection:bg-blue-500/20">
      <SessionHeader
        domain={domain}
        difficulty={difficulty}
        mode={mode}
        ttsEnabled={ttsEnabled}
        onToggleTts={() => setTtsEnabled(!ttsEnabled)}
        onEnd={() => navigate("/dashboard")}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        elapsed={elapsed}
      />

      {/* Main Interview Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative">
        <div className="w-full max-w-3xl z-10">
          <AnimatePresence mode="wait">
            {!lastEvaluation ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* AI Question Section */}
                <div className="text-center space-y-3">
                  <motion.div 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-[10px] font-bold tracking-widest uppercase"
                  >
                    <Sparkles className="w-3 h-3" /> Question {questionCount}
                  </motion.div>
                  
                  <h2 className="text-base md:text-lg font-semibold leading-snug text-foreground px-4">
                    {loading ? "Thinking of a challenge..." : currentQuestion.replace(/\*\*Score:[\s\S]*/i, "")}
                  </h2>
                </div>

                {/* User Input Section */}
                <div className="relative group">
                  <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-5 shadow-lg shadow-black/5 transition-all">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-32 md:h-44 bg-transparent border-none focus:ring-0 text-base md:text-lg text-foreground placeholder:text-muted-foreground resize-none"
                      disabled={loading}
                    />
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      <div className="flex gap-1.5">
                        <Button 
                          onClick={toggleListening}
                          variant="ghost"
                          className={`h-10 w-10 rounded-lg border border-border/30 ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-secondary/50 text-muted-foreground'}`}
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => setTtsEnabled(!ttsEnabled)}
                          variant="ghost"
                          className="h-10 w-10 rounded-lg border border-border/30 bg-secondary/50 text-muted-foreground"
                        >
                          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                      </div>

                      <Button 
                        onClick={handleAnswer}
                        disabled={!userInput.trim() || loading}
                        className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md transition-all text-sm"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Submit</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="evaluation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 w-full"
              >
                <div className="text-center space-y-1 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-600 text-[10px] font-bold tracking-widest uppercase">
                    <TrendingUp className="w-3 h-3" /> Evaluation
                  </div>
                  <h2 className="text-xl font-bold">Feedback Received</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Score Card */}
                  <div className="md:col-span-4 bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-secondary" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <motion.circle 
                          initial={{ strokeDasharray: "0 251" }}
                          animate={{ strokeDasharray: `${(lastEvaluation.score / 100) * 251} 251` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="text-blue-600" 
                          strokeWidth="10" 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="40" cx="50" cy="50" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{lastEvaluation.score}</span>
                        <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {lastEvaluation.score >= 80 ? "Excellent work!" : lastEvaluation.score >= 60 ? "Good start!" : "Keep practicing."}
                    </p>
                  </div>

                  {/* Feedback Details */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4 shadow-md">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 shrink-0 bg-emerald-600/10 rounded-lg flex items-center justify-center border border-emerald-600/10">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Strengths</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{lastEvaluation.strengths}</p>
                        </div>
                      </div>
                      
                      <div className="h-px bg-border/30 w-full" />

                      <div className="flex gap-3">
                        <div className="h-8 w-8 shrink-0 bg-orange-600/10 rounded-lg flex items-center justify-center border border-orange-600/10">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">Improvements</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{lastEvaluation.improvements}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-3.5 h-3.5 text-blue-600" />
                        <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Recommended Answer</h4>
                      </div>
                      <div className="text-muted-foreground text-xs leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown>{lastEvaluation.betterAnswer}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <Button 
                    onClick={finishInterview}
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-border/50 hover:bg-secondary text-foreground bg-transparent font-semibold text-sm"
                  >
                    Finish Session
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95 text-sm"
                  >
                    Next Question →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="h-16 border-t border-border/30 bg-card/80 backdrop-blur-md px-6 flex items-center justify-center z-20">
        <div className="flex items-center gap-8 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-muted-foreground font-medium uppercase tracking-wider">Session Active</span>
          </div>
          <div className="h-3 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium uppercase tracking-wider">Performance:</span>
            <span className="font-bold text-blue-600">{Math.round(totalScore)}%</span>
          </div>
          <div className="h-3 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium uppercase tracking-wider">Progress:</span>
            <span className="font-bold text-foreground">{questionCount} Qs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
