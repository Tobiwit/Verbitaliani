import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../server/db";
import { verbs } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseConjugation(conjugationStr: string) {
  const parts = conjugationStr.split(", ").map(s => s.trim());
  return {
    io: parts[0] || "",
    tu: parts[1] || "",
    "lui/lei": parts[2] || "",
    noi: parts[3] || "",
    voi: parts[4] || "",
    loro: parts[5] || "",
  };
}

async function seed() {
  try {
    console.log("Starting seed...");
    
    // Read JSON file
    const jsonPath = path.join(__dirname, "../attached_assets/words_1769096042129.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(rawData);
    
    // Transform JSON data to match schema
    const seedData = (data.verbs || []).map((verb: any) => ({
      infinitive: verb.italian,
      translationEn: verb.english,
      translationDe: verb.german,
      auxiliary: verb.italian === "essere" || verb.italian === "andare" || verb.italian === "venire" ? "essere" : "avere", // Rough guess, can improve
      presente: parseConjugation(verb.presente),
      passatoProssimo: parseConjugation(verb.passato_prossimo),
      imperfetto: parseConjugation(verb.imperfetto),
      presenteProgressivo: parseConjugation(verb.presente_progressivo),
    }));

    console.log(`Loaded ${seedData.length} verbs from JSON`);

    // Clear existing data
    await db.delete(verbs);
    console.log("Cleared existing verbs");

    // Insert new data
    await db.insert(verbs).values(seedData);
    console.log(`Inserted ${seedData.length} verbs into database`);

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
