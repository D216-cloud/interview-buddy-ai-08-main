import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Zap, ChevronUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  onChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
  mode: string;
  isListening: boolean;
  onToggleListen: () => void;
}

export default function ChatInput({ input, onChange, onSend, loading, mode, isListening, onToggleListen }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = !loading && input.trim();

  return (
    <div className="border-t border-primary/10 bg-gradient-to-t from-background via-background/98 to-background/95 shrink-0 backdrop-blur-sm">
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          {mode === "voice" && (
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={onToggleListen}
              className={`shrink-0 rounded-xl h-12 w-12 font-semibold border-2 transition-all transform hover:scale-110 ${
                isListening
                  ? "bg-red-600 hover:bg-red-700 border-red-500/50 text-white shadow-lg hover:shadow-xl"
                  : "border-border/40 hover:border-primary/60 bg-secondary/40 hover:bg-secondary/60 hover:text-primary"
              }`}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? (
                <div className="flex items-center justify-center">
                  <MicOff className="h-5 w-5" />
                </div>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "voice"
                  ? isListening
                    ? "Listening… Press Enter or Send when done"
                    : "Tap mic to speak, or type your answer"
                  : "Type your answer… (Shift+Enter for new line)"
              }
              disabled={loading}
              className="rounded-2xl min-h-[48px] max-h-40 resize-none border-2 border-border/40 focus:border-primary/60 bg-secondary/30 focus:bg-secondary/50 text-foreground transition-all shadow-sm focus:shadow-md focus:ring-0 placeholder:text-muted-foreground/70"
              rows={1}
            />
          </div>
          <Button
            size="icon"
            onClick={onSend}
            disabled={!canSend}
            className={`shrink-0 rounded-xl h-12 w-12 font-bold shadow-lg transition-all transform hover:scale-110 flex items-center justify-center ${
              canSend
                ? "bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white hover:shadow-xl"
                : "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed shadow-none"
            }`}
            title={canSend ? "Send answer (Enter)" : "Type something to send"}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </Button>
        </div>

        {mode === "voice" && (
          <div className="mt-2 text-center">
            <p className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              isListening
                ? "text-white bg-red-600/30 border border-red-600/50"
                : "text-muted-foreground bg-secondary/30 border border-border/20"
            }`}>
              {isListening ? (
                <>
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  Recording your answer…
                </>
              ) : (
                <>
                  <Mic className="h-3 w-3" />
                  Press mic or type to answer
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
