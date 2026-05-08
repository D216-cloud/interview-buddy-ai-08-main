import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Mic, Send, RefreshCw, ChevronRight, CheckCircle2, AlertCircle, Trophy, Timer, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

// ── Mock data for when the Gemini API is unavailable ────────────────────
const MOCK_APTITUDE = [
  { question: "If a train travels 60 km in 1 hour, how far will it travel in 2.5 hours?", options: ["120 km", "150 km", "180 km", "90 km"], correctAnswer: "150 km" },
  { question: "Which number comes next in the series: 2, 4, 8, 16, ?", options: ["24", "32", "28", "20"], correctAnswer: "32" },
  { question: "If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are:", options: ["Razzles only", "Lazzles", "Neither", "Both"], correctAnswer: "Lazzles" },
  { question: "A is twice as fast as B. If B can complete work in 12 days, how many days does A take?", options: ["6 days", "8 days", "4 days", "10 days"], correctAnswer: "6 days" },
  { question: "What is the next number: 1, 3, 6, 10, 15, ?", options: ["18", "20", "21", "22"], correctAnswer: "21" },
];
const MOCK_TECHNICAL = [
  "Explain the difference between synchronous and asynchronous programming.",
  "What is the difference between REST and GraphQL APIs?",
  "How does garbage collection work in modern languages?",
  "Explain the SOLID principles of object-oriented design.",
  "What is the difference between SQL and NoSQL databases and when would you choose each?",
];
const MOCK_HR = [
  "Tell me about yourself and your professional journey so far.",
  "Describe a situation where you had a conflict with a team member. How did you resolve it?",
  "Where do you see yourself in 5 years?",
  "What is your greatest professional achievement?",
  "Why are you interested in this role and company?",
];
const MOCK_EVAL = (q: string, a: string) => JSON.stringify({
  score: 72,
  strengths: "You addressed the core concept and demonstrated basic awareness of the topic.",
  improvements: "Provide more concrete examples and discuss trade-offs in your approach.",
  betterAnswer: "A complete answer covers the definition, a real-world example, performance implications, and testing considerations."
});

async function callGemini(prompt: string): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (key) {
    for (const model of MODELS) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!r.ok) { console.warn(`Model ${model} failed (${r.status})`); continue; }
        const d = await r.json();
        const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) return t;
      } catch { continue; }
    }
  }
  // ── Fallback: return mock data based on prompt content ──────────────────
  console.warn("⚠️ Gemini API unavailable — using mock response");
  if (prompt.includes("aptitude")) return JSON.stringify(MOCK_APTITUDE);
  if (prompt.includes("technical")) return JSON.stringify(MOCK_TECHNICAL);
  if (prompt.includes("HR") || prompt.includes("behavioral")) return JSON.stringify(MOCK_HR);
  // Evaluation prompt
  return MOCK_EVAL("", "");
}

type Phase = "loading" | "question" | "evaluating" | "evaluated" | "round_summary" | "done";
type RoundType = "aptitude" | "technical" | "hr";

const ROUNDS: { type: RoundType; name: string; emoji: string; weight: number }[] = [
  { type: "aptitude",  name: "Aptitude",  emoji: "🧠", weight: 0.3 },
  { type: "technical", name: "Technical", emoji: "💻", weight: 0.4 },
  { type: "hr",        name: "HR Round",  emoji: "🤝", weight: 0.3 },
];

interface Evaluation { score: number; strengths: string; improvements: string; betterAnswer: string; }
interface RoundResult { scores: number[]; avg: number; }

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function FullInterviewSession() {
  const navigate = useNavigate();
  const [phase, setPhase]             = useState<Phase>("loading");
  const [roundIdx, setRoundIdx]       = useState(0);
  const [qIdx, setQIdx]               = useState(0);
  const [questions, setQuestions]     = useState<any[]>([]);
  const [answer, setAnswer]           = useState("");
  const [evaluation, setEvaluation]   = useState<Evaluation | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [currentScores, setCurrentScores] = useState<number[]>([]);
  const [answers, setAnswers]           = useState<string[]>([]);
  const [detailedResults, setDetailedResults] = useState<any[]>([]); // { round, questions: { q, a, e }[] } []
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [tts, setTts]                 = useState(true);
  const [listening, setListening]     = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const sessionRaw = sessionStorage.getItem("fullInterviewData");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const { resumeData, role, companyType } = session || {};

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Load questions on round change
  useEffect(() => {
    if (!session) { navigate("/interview/full"); return; }
    generateQuestions(ROUNDS[roundIdx].type);
  }, [roundIdx]);

  const generateQuestions = async (type: RoundType) => {
    setPhase("loading");
    setQuestions([]);
    setQIdx(0);
    setCurrentScores([]);
    setAnswer("");
    setEvaluation(null);
    try {
      const skillsStr = resumeData?.skills?.slice(0, 10).join(", ") || "general skills";
      const prompts: Record<RoundType, string> = {
        aptitude: `Generate exactly 5 aptitude interview questions (logic, math, reasoning, verbal) for a ${role} candidate with ${resumeData?.experience || "some"} experience. Return as a JSON array of objects, each with "question" (string), "options" (array of 4 strings), and "correctAnswer" (string, must be one of the options). Only the JSON array, no markdown.`,
        technical: `Generate exactly 5 technical interview questions for a ${role} at a ${companyType}. The candidate knows: ${skillsStr}. Make them relevant to their skills. Return as a JSON array of 5 strings. Only the JSON array.`,
        hr: `Generate exactly 5 HR/behavioral interview questions for a ${role} at a ${companyType}. The candidate has ${resumeData?.experience || "some"} experience. Include questions about motivation, teamwork, conflicts, goals. Return as a JSON array of 5 strings. Only the JSON array.`,
      };
      const raw = await callGemini(prompts[type]);
      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const arr: any[] = JSON.parse(clean);
      setQuestions(arr.slice(0, 5));
      setPhase("question");
      const firstQ = typeof arr[0] === "string" ? arr[0] : arr[0].question;
      if (tts) speak(firstQ);
    } catch (e) {
      toast.error("Failed to generate questions. Retrying...");
      setTimeout(() => generateQuestions(type), 2000);
    }
  };

  const speak = useCallback((text: string) => {
    if (!tts || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.substring(0, 200));
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, [tts]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    const currentAnswer = answer;
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);

    if (roundIdx === 0) {
      // Aptitude: Instant local check
      const q = questions[qIdx];
      const isCorrect = currentAnswer === q.correctAnswer;
      const ev: Evaluation = {
        score: isCorrect ? 100 : 0,
        strengths: isCorrect ? "Correct answer selected." : "Incorrect answer selected.",
        improvements: isCorrect ? "Perfect." : `The correct answer was: ${q.correctAnswer}`,
        betterAnswer: `The correct answer is ${q.correctAnswer}.`
      };
      setEvaluation(ev);
      const updatedScores = [...currentScores, ev.score];
      setCurrentScores(updatedScores);
      nextQuestion(updatedAnswers, updatedScores); // Go to next question immediately
    } else {
      // Technical/HR: Just go to next question, evaluate later
      const updatedScores = [...currentScores, 0];
      setCurrentScores(updatedScores);
      nextQuestion(updatedAnswers, updatedScores);
    }
  };

  const evaluateRound = async (roundAnswers: string[]) => {
    setIsBatchEvaluating(true);
    setPhase("loading"); // Reuse loading phase for batch evaluation
    try {
      const evalPromises = questions.map((q, i) => {
        const qText = typeof q === "string" ? q : q.question;
        const prompt = `You are a ${ROUNDS[roundIdx].name} interviewer.
Question: "${qText}"
Candidate's answer: "${roundAnswers[i]}"

Evaluate and return ONLY a JSON object:
{"score": <0-100>, "strengths": "<one sentence>", "improvements": "<one sentence>", "betterAnswer": "<2-3 sentence ideal answer>"}
Only JSON, no markdown.`;
        return callGemini(prompt).then(raw => {
          const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          return JSON.parse(clean) as Evaluation;
        });
      });

      const evals = await Promise.all(evalPromises);
      const scores = evals.map(e => e.score);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      
      setCurrentScores(scores);
      setRoundResults(p => [...p, { scores, avg }]);
      
      const roundDetails = questions.map((q, i) => ({
        question: typeof q === "string" ? q : q.question,
        answer: roundAnswers[i],
        evaluation: evals[i]
      }));
      setDetailedResults(p => [...p, { round: ROUNDS[roundIdx].name, questions: roundDetails }]);
      
      setPhase("round_summary");
    } catch (e) {
      toast.error("Failed to evaluate round. Retrying...");
      setTimeout(() => evaluateRound(roundAnswers), 2000);
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const nextQuestion = (updatedAnswers?: string[], updatedScores?: number[]) => {
    const next = qIdx + 1;
    const finalAnswers = updatedAnswers || answers;
    const finalScores = updatedScores || currentScores;

    if (next >= 5) {
      // Round complete
      if (roundIdx === 0) {
        // Aptitude: We already have scores
        const avgVal = Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length);
        
        setRoundResults(p => [...p, { scores: finalScores, avg: avgVal }]);
        
        const roundDetails = questions.map((q, i) => ({
          question: q.question,
          answer: finalAnswers[i],
          evaluation: {
            score: finalAnswers[i] === q.correctAnswer ? 100 : 0,
            strengths: finalAnswers[i] === q.correctAnswer ? "Correct" : "Incorrect",
            improvements: finalAnswers[i] === q.correctAnswer ? "Perfect." : `The correct answer was: ${q.correctAnswer}`,
            betterAnswer: `The correct answer is ${q.correctAnswer}`
          }
        }));
        setDetailedResults(p => [...p, { round: ROUNDS[roundIdx].name, questions: roundDetails }]);
        
        setPhase("round_summary");
      } else {
        // Technical/HR: Batch evaluate
        evaluateRound(finalAnswers);
      }
    } else {
      setQIdx(next);
      setAnswer("");
      setEvaluation(null);
      setPhase("question");
      const nextQ = typeof questions[next] === "string" ? questions[next] : questions[next].question;
      if (tts && nextQ) speak(nextQ);
    }
  };

  const nextRound = () => {
    if (roundIdx + 1 >= ROUNDS.length) {
      setPhase("done");
      setTimeout(() => {
        const finalScore = Math.round(
          roundResults.reduce((acc, r, i) => acc + r.avg * ROUNDS[i].weight, 0) +
          (currentScores.reduce((a,b)=>a+b,0)/currentScores.length) * ROUNDS[roundIdx].weight
        );
        sessionStorage.setItem("fullInterviewResults", JSON.stringify({ 
          roundResults: [...roundResults, { scores: currentScores, avg: Math.round(currentScores.reduce((a,b)=>a+b,0)/currentScores.length) }], 
          detailedResults,
          finalScore, role, companyType, resumeData, elapsed 
        }));
        navigate("/interview/full/results");
      }, 1500);
    } else {
      setRoundIdx(p => p + 1);
    }
  };

  const toggleListen = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported"); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setAnswer(p => p + " " + t);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start(); setListening(true);
  };

  const round = ROUNDS[roundIdx];
  const roundAvg = currentScores.length ? Math.round(currentScores.reduce((a,b)=>a+b,0)/currentScores.length) : 0;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-blue-400" />
          <div className="flex items-center gap-2">
            {ROUNDS.map((r, i) => (
              <div key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${i === roundIdx ? "bg-blue-600 text-white border-blue-600" : i < roundIdx ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" : "bg-white/5 text-slate-500 border-white/10"}`}>
                {r.emoji} {r.name}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {phase === "question" || phase === "evaluated" || phase === "evaluating" ? (
            <span className="text-xs font-bold text-slate-400">Q {qIdx + 1}/5</span>
          ) : null}
          <div className="flex items-center gap-1.5 text-white font-mono text-xs">
            <Timer className="h-3.5 w-3.5 text-blue-400" />
            {formatTime(elapsed)}
          </div>
          <button onClick={() => setTts(p => !p)} className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
            {tts ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {phase === "loading" && (
              <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground font-medium">
                  {isBatchEvaluating ? "Analyzing your answers..." : `Preparing ${round.name} questions from your resume...`}
                </p>
              </motion.div>
            )}

            {/* Question */}
            {(phase === "question" || phase === "evaluating") && (
              <motion.div key="question" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-5">
                <div className="text-center space-y-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${roundIdx===0?"bg-blue-600/10 border-blue-600/20 text-blue-600":roundIdx===1?"bg-purple-600/10 border-purple-600/20 text-purple-600":"bg-emerald-600/10 border-emerald-600/20 text-emerald-600"}`}>
                    {round.emoji} {round.name} — Q{qIdx+1}/5
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug px-2">
                    {typeof questions[qIdx] === "string" ? questions[qIdx] : (questions[qIdx]?.question || "Loading question...")}
                  </h2>
                </div>

                {questions[qIdx]?.options ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questions[qIdx].options.map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setAnswer(opt)}
                        disabled={phase === "evaluating"}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-3 ${
                          answer === opt
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                            : "bg-card border-border/50 text-foreground hover:border-blue-400 hover:bg-blue-50/50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${answer === opt ? "bg-white text-blue-600 border-white" : "bg-secondary text-muted-foreground border-border"}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
                    <textarea
                      value={answer} onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your answer here..." disabled={phase==="evaluating"}
                      className="w-full h-36 bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex gap-2">
                    {!questions[qIdx]?.options && (
                      <button onClick={toggleListen} className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all ${listening?"bg-red-50 border-red-200 text-red-600 animate-pulse":"border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                        <Mic className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button onClick={handleSubmit} disabled={!answer.trim() || phase==="evaluating"} className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2">
                    {phase==="evaluating" ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating...</> : <><Send className="h-3.5 w-3.5" /> Submit</>}
                  </Button>
                </div>
              </motion.div>
            )}



            {/* Round Summary */}
            {phase === "round_summary" && (
              <motion.div key="summary" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} className="text-center space-y-6">
                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-md">
                  <div className="text-4xl mb-3">{round.emoji}</div>
                  <h2 className="text-3xl font-bold mb-1">{round.name} Complete!</h2>
                  <p className="text-base text-muted-foreground mb-6">Here's how you did</p>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" className="text-secondary" />
                      <motion.circle initial={{strokeDasharray:"0 264"}} animate={{strokeDasharray:`${roundAvg/100*264} 264`}} transition={{duration:1.5,ease:"easeOut"}} strokeWidth="8" strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" className="text-blue-600" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">{roundAvg}%</span>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase">Round Score</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap mb-6">
                    {currentScores.map((s, i) => (
                      <div key={i} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${s>=80?"bg-emerald-600/10 border-emerald-600/20 text-emerald-600":s>=60?"bg-blue-600/10 border-blue-600/20 text-blue-600":"bg-orange-500/10 border-orange-500/20 text-orange-500"}`}>
                        Q{i+1}: {s}%
                      </div>
                    ))}
                  </div>
                  <Button onClick={nextRound} className="h-11 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2">
                    {roundIdx < 2 ? <>{ROUNDS[roundIdx+1].emoji} Start {ROUNDS[roundIdx+1].name} Round <ChevronRight className="h-4 w-4" /></> : <><Trophy className="h-4 w-4" /> Finish Interview</>}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Done */}
            {phase === "done" && (
              <motion.div key="done" initial={{opacity:0}} animate={{opacity:1}} className="text-center py-16">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
                <p className="text-sm text-muted-foreground mb-2">Generating your final report...</p>
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 bg-card/80 border-t border-border/30 flex items-center justify-center gap-8 px-6 text-xs">
        {ROUNDS.map((r, i) => {
          const result = roundResults[i];
          const isCurrentRound = i === roundIdx;
          const score = isCurrentRound && currentScores.length > 0 ? roundAvg : result?.avg;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">{r.emoji} {r.name}:</span>
              <span className={`font-black ${score !== undefined ? "text-blue-600" : "text-muted-foreground"}`}>
                {score !== undefined ? `${score}%` : i < roundIdx ? "—" : "•••"}
              </span>
            </div>
          );
        })}
        <div className="h-3 w-px bg-border/50" />
        <span className="text-muted-foreground">Time: <span className="font-bold text-foreground">{formatTime(elapsed)}</span></span>
      </footer>
    </div>
  );
}
