import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Mic, Settings2 } from "lucide-react";

interface VoiceSelectorProps {
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
}

export default function VoiceSelector({ selectedVoice, onVoiceChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() || [];
      const english = available.filter((v) => v.lang.startsWith("en"));
      setVoices(english.length > 0 ? english : available);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const previewVoice = (voice: SpeechSynthesisVoice) => {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance("I will be your interviewer.");
    u.voice = voice;
    u.rate = 1;
    window.speechSynthesis?.speak(u);
  };

  if (voices.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedVoice?.name || ""}
        onValueChange={(name) => {
          const v = voices.find((voice) => voice.name === name);
          if (v) onVoiceChange(v);
        }}
      >
        <SelectTrigger className="h-10 w-44 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-all">
          <div className="flex items-center gap-2 truncate">
            <Mic className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <SelectValue placeholder="AI Voice" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#0f172a] border-white/10 text-white rounded-xl shadow-2xl">
          {voices.map((v) => (
            <SelectItem key={v.name} value={v.name} className="text-xs hover:bg-white/5 focus:bg-white/5 cursor-pointer">
              {v.name.replace(/Microsoft |Google |Apple /, "")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedVoice && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
          onClick={() => previewVoice(selectedVoice)}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
