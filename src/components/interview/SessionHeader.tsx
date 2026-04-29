import { Button } from "@/components/ui/button";
import { Brain, Square, Volume2, VolumeX, Timer, TrendingUp, ChevronLeft } from "lucide-react";
import VoiceSelector from "./VoiceSelector";

interface SessionHeaderProps {
  domain: string;
  difficulty: string;
  mode: string;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  onEnd: () => void;
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (v: SpeechSynthesisVoice) => void;
  elapsed: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function SessionHeader({
  domain, difficulty, mode, ttsEnabled, onToggleTts, onEnd,
  selectedVoice, onVoiceChange, elapsed,
}: SessionHeaderProps) {
  return (
    <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 md:px-8 shrink-0 bg-slate-900 shadow-md z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onEnd}
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/15 transition-all">
            <ChevronLeft className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-white hidden md:block">End Session</span>
        </button>

        <div className="h-6 w-px bg-white/10 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Domain</span>
            <span className="text-sm font-bold text-white">{domain}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
            <TrendingUp className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] font-bold text-blue-300">{difficulty}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-2 hidden sm:flex">
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Elapsed</span>
          <div className="flex items-center gap-1.5 text-white font-mono font-bold text-sm">
            <Timer className="h-3 w-3 text-blue-400" />
            {formatTime(elapsed)}
          </div>
        </div>

        <div className="h-6 w-px bg-white/10"></div>

        <div className="flex items-center gap-1.5">
          {mode === "voice" && (
            <>
              <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={onVoiceChange} />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleTts} 
                className="rounded-lg h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                {ttsEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 opacity-50" />
                )}
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEnd} 
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg h-8 w-8 border border-red-500/20 transition-all"
            title="End interview"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </div>
    </header>
  );
}
