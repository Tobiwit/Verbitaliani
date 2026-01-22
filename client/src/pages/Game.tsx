import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useVerbs } from "@/hooks/use-verbs";
import { generateQuestions, GameConfig, Question } from "@/lib/game-logic";
import { Tense } from "@shared/schema";
import { RippleInput } from "@/components/RippleInput";
import { GameCard } from "@/components/GameCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, RotateCcw } from "lucide-react";

export default function Game() {
  const [location, setLocation] = useLocation();
  const { data: verbs, isLoading, error } = useVerbs();
  
  // Parse URL params for config
  const searchParams = new URLSearchParams(window.location.search);
  const config = useMemo<GameConfig>(() => ({
    mode: (searchParams.get("mode") as GameConfig["mode"]) || "conjugation",
    sourceLanguage: (searchParams.get("source") as GameConfig["sourceLanguage"]) || "en",
    tenses: (searchParams.get("tenses")?.split(",") as Tense[]) || ["Presente"]
  }), [searchParams]);

  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong1" | "wrong2">("idle");
  const [inputValue, setInputValue] = useState("");
  const [lastWrongAnswer, setLastWrongAnswer] = useState<string | null>(null);

  // Initialize Questions
  useEffect(() => {
    if (verbs && verbs.length > 0) {
      const qs = generateQuestions(verbs, config);
      setQuestions(qs);
    }
  }, [verbs, config]);

  const currentQuestion = questions[currentIndex];

  const handleEnter = () => {
    if (status === "correct" || status === "wrong2") return; // Block input during animations/card state

    const normalizedInput = inputValue.trim().toLowerCase();
    const normalizedAnswer = currentQuestion.correctAnswer.trim().toLowerCase();

    if (normalizedInput === normalizedAnswer) {
      // CORRECT
      setStatus("correct");
      // Short delay before next question
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      // WRONG
      if (status === "idle") {
        // First error
        setStatus("wrong1");
        setLastWrongAnswer(inputValue);
        
        // Shake animation plays, then we clear input
        setTimeout(() => {
          setInputValue("");
        }, 400); // Wait for shake
      } else if (status === "wrong1") {
        // Second error
        setStatus("wrong2");
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStatus("idle");
      setInputValue("");
      setLastWrongAnswer(null);
    } else {
      // End of game
      // Could show a summary screen here. For now, just loop or go home.
      setLocation("/");
    }
  };

  // Loading / Error States
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (error || !verbs) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <h2 className="text-2xl font-serif font-bold mb-4">Errore di connessione</h2>
      <p className="text-muted-foreground mb-8">Unable to load verbs data.</p>
      <button onClick={() => setLocation("/")} className="underline">Go back home</button>
    </div>
  );

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <button 
          onClick={() => setLocation("/")}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                idx === currentIndex ? "bg-foreground" : 
                idx < currentIndex ? "bg-muted-foreground/30" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto relative">
        
        {/* The Card Overlay (Appears on 2nd fail) */}
        <AnimatePresence>
          {status === "wrong2" && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
              <GameCard 
                verb={currentQuestion.verb}
                tense={currentQuestion.tense}
                person={currentQuestion.person}
                correctAnswer={currentQuestion.correctAnswer}
                onContinue={handleNext}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Main Game Interface */}
        <div className={`transition-opacity duration-300 ${status === "wrong2" ? "opacity-20 blur-sm" : "opacity-100"}`}>
          
          <div className="text-center space-y-2 mb-12">
            <motion.h2 
              key={currentQuestion.id + "main"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif font-medium"
            >
              {currentQuestion.prompt}
            </motion.h2>
            
            <motion.div
              key={currentQuestion.id + "sub"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground font-mono uppercase tracking-widest text-sm md:text-base"
            >
              {currentQuestion.subPrompt}
            </motion.div>
          </div>

          <div className="w-full mb-8 relative">
            <RippleInput
              value={inputValue}
              onChange={setInputValue}
              onEnter={handleEnter}
              status={status}
              disabled={status === "correct" || status === "wrong2"}
            />

            {/* Hint of previous wrong answer */}
            <AnimatePresence>
              {status === "wrong1" && lastWrongAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-full mt-4 text-center"
                >
                  <span className="text-muted-foreground/50 line-through text-lg font-serif">
                    {lastWrongAnswer}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>

      {/* Footer Info (Optional) */}
      <footer className="p-6 text-center text-xs text-muted-foreground/30 font-mono uppercase tracking-widest">
        Press Enter to submit
      </footer>
    </div>
  );
}
