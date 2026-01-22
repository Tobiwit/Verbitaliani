import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { TENSES, Tense } from "@shared/schema";
import { GameConfig } from "@/lib/game-logic";
import { Settings2, ArrowRight, BookOpen, Layers } from "lucide-react";

export default function Home() {
  const [_, setLocation] = useLocation();
  
  const [tenses, setTenses] = useState<Tense[]>(["Presente"]);
  const [mode, setMode] = useState<GameConfig["mode"]>("conjugation");
  const [sourceLang, setSourceLang] = useState<GameConfig["sourceLanguage"]>("en");

  const toggleTense = (t: Tense) => {
    setTenses(prev => 
      prev.includes(t) 
        ? prev.filter(x => x !== t)
        : [...prev, t]
    );
  };

  const handleStart = () => {
    if (tenses.length === 0) return;
    
    // Pass config via state or URL params. 
    // Since wouter useLocation doesn't support state object easily without history API wrapper,
    // we'll encode it in search params for simplicity and shareability.
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("source", sourceLang);
    params.set("tenses", tenses.join(","));
    
    setLocation(`/train?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight">
            Italian<br/>Drill
          </h1>
          <p className="text-lg text-muted-foreground font-sans max-w-md mx-auto">
            Master conjugation through focused repetition. Select your parameters and begin.
          </p>
        </div>

        <div className="space-y-10">
          
          {/* Mode Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-foreground">
              <Settings2 className="w-4 h-4" />
              <span>Training Mode</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode("conjugation")}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  mode === "conjugation" 
                    ? "border-foreground bg-foreground text-background" 
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <Layers className="w-6 h-6 mb-3" />
                <div className="font-serif font-bold text-lg">Conjugation</div>
                <div className="text-sm opacity-80 mt-1">Drill specific tenses and persons</div>
              </button>
              
              <button
                onClick={() => setMode("translation")}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  mode === "translation" 
                    ? "border-foreground bg-foreground text-background" 
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <BookOpen className="w-6 h-6 mb-3" />
                <div className="font-serif font-bold text-lg">Translation</div>
                <div className="text-sm opacity-80 mt-1">Practice infinitive meanings only</div>
              </button>
            </div>
          </div>

          {/* Tense Selection - Only if Conjugation mode */}
          {mode === "conjugation" && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  <span>Tenses</span>
                </div>
                <button 
                  onClick={() => setTenses([...TENSES])}
                  className="text-xs font-medium underline underline-offset-4 hover:text-foreground"
                >
                  Select All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {TENSES.map((tense) => (
                  <button
                    key={tense}
                    onClick={() => toggleTense(tense)}
                    className={`px-4 py-2 rounded-full border transition-all font-medium text-sm ${
                      tenses.includes(tense)
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/50"
                    }`}
                  >
                    {tense}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={tenses.length === 0}
            className="group w-full py-6 bg-foreground text-background rounded-2xl font-serif text-2xl font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            <span>Start Session</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </motion.div>
    </div>
  );
}
