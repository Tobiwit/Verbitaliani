import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RippleInputProps {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
  status: "idle" | "correct" | "wrong1" | "wrong2";
  disabled?: boolean;
}

export function RippleInput({ value, onChange, onEnter, status, disabled }: RippleInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus logic
    if (!disabled && status !== 'correct') {
      inputRef.current?.focus();
    }
  }, [status, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) {
      onEnter();
    }
  };

  // Variants for animation
  const containerVariants = {
    idle: { x: 0 },
    wrong1: { 
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 } 
    },
    wrong2: { 
      scale: [1, 0.95, 1],
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
      
      {/* The Ripple Effect Ring */}
      <AnimatePresence>
        {status === "correct" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.8, borderColor: "rgba(34, 197, 94, 0.5)" }}
            animate={{ 
              scale: 1.5, 
              opacity: 0,
              borderColor: "rgba(34, 197, 94, 0)" 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 border-4 rounded-2xl pointer-events-none"
            style={{ borderColor: "var(--color-success)" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        animate={status}
        className="w-full relative z-10"
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Type answer..."
          className={cn(
            "w-full bg-transparent text-center font-serif text-4xl md:text-6xl lg:text-7xl",
            "outline-none border-b-2 py-4 transition-colors duration-300 placeholder:text-muted/30",
            status === "idle" && "border-input text-foreground focus:border-foreground",
            status === "correct" && "border-transparent text-green-600",
            status === "wrong1" && "border-orange-500 text-orange-600",
            status === "wrong2" && "border-red-500 text-red-600"
          )}
        />
      </motion.div>
      
      {/* Status Indicator / Hint Text */}
      <div className="h-8 mt-4 text-sm font-mono tracking-wider font-medium text-muted-foreground uppercase">
        {status === "correct" && <span className="text-green-600">Correct!</span>}
        {status === "wrong1" && <span className="text-orange-500">Try again</span>}
        {status === "wrong2" && <span className="text-red-500">Incorrect</span>}
        {status === "idle" && <span>Press Enter</span>}
      </div>
    </div>
  );
}
