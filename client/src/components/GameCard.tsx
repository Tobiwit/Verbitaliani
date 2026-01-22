import { motion } from "framer-motion";
import { Verb, Tense } from "@shared/schema";
import { Check, ArrowRight } from "lucide-react";
import { Person } from "@/lib/game-logic";

interface GameCardProps {
  verb: Verb;
  tense: Tense;
  person: Person;
  correctAnswer: string;
  onContinue: () => void;
}

export function GameCard({ verb, tense, person, correctAnswer, onContinue }: GameCardProps) {
  // Use keyboard enter to continue as well
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg bg-white dark:bg-card border rounded-3xl shadow-xl overflow-hidden"
    >
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-foreground capitalize">
              {verb.infinitive}
            </h3>
            <p className="text-muted-foreground italic font-serif">
              {verb.translationEn}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <span className="text-xl font-bold">!</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground font-mono uppercase tracking-wider">
            <span>{tense}</span>
            <span>{person}</span>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-red-500 font-mono uppercase tracking-widest">Correct Answer</div>
            <div className="text-3xl font-serif text-foreground font-medium">
              {correctAnswer}
            </div>
          </div>
        </div>

        <button
          autoFocus
          onClick={onContinue}
          onKeyDown={handleKeyDown}
          className="w-full py-4 bg-foreground text-background rounded-xl font-medium text-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
