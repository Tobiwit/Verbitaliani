import { Verb, Tense, ConjugationMap } from "@shared/schema";

export type Person = "io" | "tu" | "lui/lei" | "noi" | "voi" | "loro";

export interface GameConfig {
  tenses: Tense[];
  mode: "translation" | "conjugation";
  sourceLanguage: "it" | "en" | "de";
}

export interface Question {
  id: string;
  verb?: Verb;
  tense?: Tense;
  person?: Person;
  prompt: string;
  subPrompt?: string; // e.g. "Passato Prossimo"
  correctAnswer: string;
}

const PRONOUNS: Person[] = ["io", "tu", "lui/lei", "noi", "voi", "loro"];

// Helper to get conjugation map safely from JSONB column
function getConjugation(verb: Verb, tense: Tense): ConjugationMap | null {
  const mapKey = tense === "Passato Prossimo" ? "passatoProssimo" :
                 tense === "Presente Progressivo" ? "presenteProgressivo" :
                 tense.toLowerCase() as keyof Verb;
                 
  const data = verb[mapKey];
  
  if (!data || typeof data !== 'object') return null;
  return data as unknown as ConjugationMap; // Cast validated JSONB
}

export function generateQuestions(verbs: Verb[], config: GameConfig): Question[] {
  const questions: Question[] = [];

  verbs.forEach((verb) => {
    // For each selected tense
    config.tenses.forEach((tense) => {
      
      // If mode is Translation, we just ask for the infinitive
      if (config.mode === "translation") {
        let prompt = "";
        if (config.sourceLanguage === "en") prompt = verb.translationEn;
        else if (config.sourceLanguage === "de") prompt = verb.translationDe;
        else prompt = verb.infinitive; // Should not happen based on UI logic but fallback

        questions.push({
          id: `${verb.id}-trans-${config.sourceLanguage}`,
          verb,
          tense: "Presente", // Dummy
          person: "io", // Dummy
          prompt: prompt,
          subPrompt: "Infinitive",
          correctAnswer: verb.infinitive
        });
        return;
      }

      // If mode is Conjugation
      const conjugation = getConjugation(verb, tense);
      if (!conjugation) return;

      const person = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
      const answer = conjugation[person];

      const langKey = config.sourceLanguage === "en" ? "translationEn" : 
                    config.sourceLanguage === "de" ? "translationDe" : "infinitive";
      const translation = verb[langKey as keyof Verb] as string;

      questions.push({
        id: `${verb.id}-${tense}-${person}`,
        verb,
        tense,
        person,
        prompt: `${translation} (${verb.infinitive})`,
        subPrompt: `${person} • ${tense}`,
        correctAnswer: answer
      });
    });
  });

  // Shuffle questions (Fisher-Yates)
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}
