import ReactMarkdown from "react-markdown";
import { CheckCircle2, Lightbulb, Star, TrendingUp } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

interface MessageBubbleProps {
  message: Message;
}

function parseScoreBlock(content: string) {
  // Match patterns like "Score: 8/10" or "**Score:** 7/10" or "Rating: 9/10"
  const scoreRegex = /(?:\*{0,2}(?:Score|Rating|Grade)\*{0,2}\s*:?\s*)(\d+)\s*\/\s*(\d+)/gi;
  const matches = [...content.matchAll(scoreRegex)];
  if (matches.length === 0) return null;
  
  const last = matches[matches.length - 1];
  return { score: parseInt(last[1]), total: parseInt(last[2]) };
}

function ScoreCard({ score, total }: { score: number; total: number }) {
  const pct = (score / total) * 100;
  const isExcellent = pct >= 85;
  const isGood = pct >= 70;
  const isPass = pct >= 50;
  
  let colorClass = "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30";
  let barColor = "bg-red-500";
  let badge = "Below Average";

  if (isExcellent) {
    colorClass = "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30";
    barColor = "bg-green-500";
    badge = "Excellent";
  } else if (isGood) {
    colorClass = "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30";
    barColor = "bg-blue-500";
    badge = "Good";
  } else if (isPass) {
    colorClass = "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    barColor = "bg-yellow-500";
    badge = "Fair";
  }

  return (
    <div className={`flex flex-col gap-3 px-4 py-3.5 rounded-xl border ${colorClass} mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold">{score}</div>
          <span className="text-lg font-semibold opacity-60">/ {total}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10">
          {isExcellent && <Star className="h-4 w-4" />}
          {isGood && <TrendingUp className="h-4 w-4" />}
          <span className="text-xs font-semibold">{badge}</span>
        </div>
      </div>
      <div className="flex-1 h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
      <div className="text-xs opacity-70 text-center font-medium">
        Performance: {Math.round(pct)}%
      </div>
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const scoreData = !isUser ? parseScoreBlock(message.content) : null;

  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-br-none px-5 py-3.5 text-sm leading-relaxed bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-500/30 hover:border-blue-400/50">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-bl-none p-5 text-sm leading-relaxed bg-gradient-to-br from-secondary/60 to-secondary/30 border border-primary/15 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
        </div>
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-secondary-foreground prose-strong:text-foreground prose-em:text-secondary-foreground prose-li:text-secondary-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/20 prose-pre:border prose-pre:border-primary/20">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {scoreData && <ScoreCard score={scoreData.score} total={scoreData.total} />}
      </div>
    </div>
  );
}
