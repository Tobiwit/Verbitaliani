import { pgTable, text, serial, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const verbs = pgTable("verbs", {
  id: serial("id").primaryKey(),
  infinitive: text("infinitive").notNull().unique(),
  translationEn: text("translation_en").notNull(),
  translationDe: text("translation_de").notNull(),
  auxiliary: text("auxiliary").notNull(), // 'avere' or 'essere'
  
  // Tense data stored as JSON objects mapping pronouns (io, tu, etc) to conjugated forms
  // Example: { "io": "mangio", "tu": "mangi", ... }
  presente: jsonb("presente").notNull(),
  passatoProssimo: jsonb("passato_prossimo").notNull(),
  imperfetto: jsonb("imperfetto").notNull(),
  presenteProgressivo: jsonb("presente_progressivo").notNull(),
});

export const insertVerbSchema = createInsertSchema(verbs).omit({ id: true });

export type Verb = typeof verbs.$inferSelect;
export type InsertVerb = z.infer<typeof insertVerbSchema>;

// Helper type for the conjugation maps
export const ConjugationMapSchema = z.object({
  io: z.string(),
  tu: z.string(),
  "lui/lei": z.string(),
  noi: z.string(),
  voi: z.string(),
  loro: z.string(),
});

export type ConjugationMap = z.infer<typeof ConjugationMapSchema>;

export const TENSES = [
  "Presente",
  "Passato Prossimo",
  "Imperfetto",
  "Presente Progressivo"
] as const;

export type Tense = typeof TENSES[number];

// For the game logic options
export interface GameOptions {
  tenses: Tense[]; // Which tenses to include
  sourceLanguage: "it" | "en" | "de"; // Prompt language (or 'it' for conjugation drill)
  targetLanguage: "it" | "en" | "de"; // Answer language
  mode: "translation" | "conjugation"; // "Translation" = infinitive only, "Conjugation" = specific tense/person
}
