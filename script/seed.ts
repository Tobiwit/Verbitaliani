import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../server/db";
import { verbs, functionWords } from "../shared/schema";
import { eq } from "drizzle-orm";

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
    
    // Read both JSON files
    const jsonPath1 = path.join(__dirname, "../attached_assets/words_1769096042129.json");
    const jsonPath2 = path.join(__dirname, "../attached_assets/italian_verbs_2.json");
    const rawData1 = fs.readFileSync(jsonPath1, "utf-8");
    const rawData2 = fs.readFileSync(jsonPath2, "utf-8");
    const data1 = JSON.parse(rawData1);
    const data2 = JSON.parse(rawData2);

    // Combine verbs from both files
    const allVerbs = [...(data1.verbs || []), ...(data2.verbs || [])];

    // Transform JSON data to match schema
    const seedData = allVerbs.map((verb: any) => ({
      infinitive: verb.italian,
      translationEn: verb.english,
      translationDe: verb.german,
      auxiliary: verb.italian === "essere" || verb.italian === "andare" || verb.italian === "venire" ? "essere" : "avere",
      presente: parseConjugation(verb.presente),
      passatoProssimo: parseConjugation(verb.passato_prossimo),
      imperfetto: parseConjugation(verb.imperfetto),
      presenteProgressivo: parseConjugation(verb.presente_progressivo),
    }));

    console.log(`Loaded ${seedData.length} verbs from both JSON files`);

    // Insert new verbs, skipping duplicates
    for (const verb of seedData) {
      // Check if verb already exists
      const exists = await db.select().from(verbs).where(eq(verbs.infinitive, verb.infinitive)).limit(1);
      if (exists.length === 0) {
        await db.insert(verbs).values(verb);
        console.log(`Inserted verb: ${verb.infinitive}`);
      } else {
        console.log(`Skipped duplicate verb: ${verb.infinitive}`);
      }
    }
    console.log("Verb upload completed!");

    // Upload function words
    const functionWordsPath = path.join(__dirname, "../attached_assets/italian_function_words.json");
    const functionWordsRaw = fs.readFileSync(functionWordsPath, "utf-8");
    const functionWordsData = JSON.parse(functionWordsRaw);
    const words = functionWordsData.words || [];

    let insertedCount = 0;
    for (const word of words) {
      // Map JSON keys to DB schema
      const entry = {
        italian: word.italian,
        translationEn: word.english,
        translationDe: word.german,
        category: word.category,
      };
      // Check if function word already exists
      const exists = await db.select().from(functionWords).where(eq(functionWords.italian, entry.italian)).limit(1);
      if (exists.length === 0) {
        await db.insert(functionWords).values(entry);
        insertedCount++;
        console.log(`Inserted function word: ${entry.italian}`);
      } else {
        console.log(`Skipped duplicate function word: ${entry.italian}`);
      }
    }
    console.log(`Function words upload completed! Inserted: ${insertedCount}`);

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
