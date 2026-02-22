import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useVerbs } from "@/hooks/use-verbs";
import { useFunctionWords } from "@/hooks/use-function-words";
import { generateQuestions, GameConfig, Question } from "@/lib/game-logic";
import { Tense } from "@shared/schema";
import { RippleInput } from "@/components/RippleInput";
import { GameCard } from "@/components/GameCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, RotateCcw } from "lucide-react";

export default function Game() {
  const [location, setLocation] = useLocation();
  // Parse URL params for config - only once on mount
  const searchParams = new URLSearchParams(window.location.search);
  const translationType = searchParams.get("translationType") || "verbs";

  const { data: verbs, isLoading: isLoadingVerbs, error: errorVerbs } = useVerbs();
  const { data: functionWords, isLoading: isLoadingFW, error: errorFW } = useFunctionWords();
  
  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong1" | "wrong2">("idle");
  const [inputValue, setInputValue] = useState("");
  const [lastWrongAnswer, setLastWrongAnswer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

  // Load questions based on mode and translationType
  useEffect(() => {
    const mode = (searchParams.get("mode") as GameConfig["mode"]) || "conjugation";
    const sourceLanguage = (searchParams.get("source") as GameConfig["sourceLanguage"]) || "en";
    const tenses = (searchParams.get("tenses")?.split(",") as Tense[]) || ["Presente"];

    let qs: Question[] = [];
    if (mode === "translation" && translationType === "functionWords") {
      if (functionWords && functionWords.length > 0) {
        qs = functionWords.map((fw) => {
          let prompt = sourceLanguage === "en" ? fw.translationEn : sourceLanguage === "de" ? fw.translationDe : fw.italian;
          return {
            id: `fw-${fw.id}`,
            verb: undefined,
            tense: undefined,
            person: undefined,
            prompt,
            subPrompt: "Function Word",
            correctAnswer: fw.italian,
          };
        });
      }
    } else if (mode === "translation" && translationType === "verbs") {
      if (verbs && verbs.length > 0) {
        const config: GameConfig = { mode: "translation", sourceLanguage, tenses: ["Presente"] };
        qs = generateQuestions(verbs, config);
      }
    } else if (mode === "conjugation") {
      if (verbs && verbs.length > 0) {
        const config: GameConfig = { mode: "conjugation", sourceLanguage, tenses };
        qs = generateQuestions(verbs, config);
      }
    }
    // Shuffle
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    // Limit to 25
    setQuestions(qs.slice(0, 25));
  }, [verbs, functionWords]);

  // Log status changes
  useEffect(() => {
    console.log("Status changed to:", status);
  }, [status]);

  const currentQuestion = questions[currentIndex];

  const handleEnter = () => {
    // Block if already processing or when showing card/correct answer
    if (isProcessing || status === "correct" || status === "wrong2") {
      console.log("Blocked handleEnter:", { isProcessing, status });
      return;
    }
    
    // Prevent empty submissions
    if (!inputValue.trim()) return;

    setIsProcessing(true);
    console.log("handleEnter called, status:", status);

    const normalizedInput = inputValue.trim().toLowerCase();
    const normalizedAnswer = currentQuestion.correctAnswer.trim().toLowerCase();

    if (normalizedInput === normalizedAnswer) {
      // CORRECT
      console.log("Correct answer!");
      setStatus("correct");
      setInputValue(""); // Clear input immediately
      setCorrectCount((prev) => prev + 1);
      // Short delay before next question
      setTimeout(() => {
        handleNext();
        setIsProcessing(false);
      }, 1000);
    } else {
      // WRONG
      console.log("Wrong answer. Current status:", status);
      if (status === "idle") {
        // First error
        console.log("First wrong answer");
        setStatus("wrong1");
        setLastWrongAnswer(inputValue);
        
        // Shake animation plays, then we clear input
        setTimeout(() => {
          setInputValue("");
          setIsProcessing(false);
        }, 400); // Wait for shake
      } else if (status === "wrong1") {
        // Second error - show card
        console.log("Second wrong answer, setting status to wrong2");
        setStatus("wrong2");
        setIsProcessing(false);
        // Don't clear input, show it on the card
      }
    }
  };

  const handleNext = () => {
    console.log("handleNext called, currentIndex:", currentIndex);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStatus("idle");
      setInputValue("");
      setLastWrongAnswer(null);
      setIsProcessing(false);
    } else {
      // End of game
      // Could show a summary screen here. For now, just loop or go home.
      setLocation("/");
    }
  };

  // Loading / Error States
  if (
    (translationType === "functionWords" && isLoadingFW) ||
    (translationType === "verbs" && isLoadingVerbs) ||
    (translationType === "functionWords" && !functionWords) ||
    (translationType === "verbs" && !verbs)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (
    (translationType === "functionWords" && errorFW) ||
    (translationType === "verbs" && errorVerbs)
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Errore di connessione</h2>
        <p className="text-muted-foreground mb-8">Unable to load data.</p>
        <button onClick={() => setLocation("/")} className="underline">Go back home</button>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card border rounded-3xl shadow-xl p-12 max-w-md w-full text-center"
        >
          <h2 className="text-3xl font-serif font-bold mb-6">Session Complete!</h2>
          <p className="text-lg mb-4">You got <span className="font-bold text-green-600">{correctCount}</span> out of <span className="font-bold">{questions.length}</span> correct.</p>
          <button
            className="mt-8 px-6 py-3 bg-foreground text-background rounded-xl font-medium text-lg hover:opacity-90 transition-all"
            onClick={() => setLocation("/")}
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

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
          {status === "wrong2" && currentQuestion && (
            <motion.div 
              className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameCard 
                verb={currentQuestion.verb ?? undefined}
                tense={currentQuestion.tense ?? undefined}
                person={currentQuestion.person ?? undefined}
                correctAnswer={currentQuestion.correctAnswer}
                onContinue={handleNext}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Game Interface */}
        <div className={`transition-opacity duration-300 ${status === "wrong2" ? "opacity-20 blur-sm" : "opacity-100"}`}>
          
          <div className="text-center space-y-2 mb-12">
            {currentQuestion ? (
              <motion.h2 
                key={currentQuestion.id + "main"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-serif font-medium"
              >
                {currentQuestion.prompt}
              </motion.h2>
            ) : null}
            
            <motion.div
              key={currentQuestion && currentQuestion.id ? currentQuestion.id + "sub" : "sub"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground font-mono uppercase tracking-widest text-sm md:text-base"
            >
              {currentQuestion ? currentQuestion.subPrompt : null}
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
