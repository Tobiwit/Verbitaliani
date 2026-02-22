import { verbs, type Verb, type InsertVerb } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getVerbs(): Promise<Verb[]>;
  getVerb(id: number): Promise<Verb | undefined>;
  createVerb(verb: InsertVerb): Promise<Verb>;
  createVerbs(verbsList: InsertVerb[]): Promise<Verb[]>;
  clearVerbs(): Promise<void>;
  getFunctionWords(): Promise<FunctionWord[]>;
}

export class DatabaseStorage implements IStorage {
    async getFunctionWords(): Promise<FunctionWord[]> {
      // Import functionWords table from schema
      const { functionWords } = await import("@shared/schema");
      return await db.select().from(functionWords);
    }
  async getVerbs(): Promise<Verb[]> {
    return await db.select().from(verbs);
  }

  async getVerb(id: number): Promise<Verb | undefined> {
    const [verb] = await db.select().from(verbs).where(eq(verbs.id, id));
    return verb;
  }

  async createVerb(verb: InsertVerb): Promise<Verb> {
    const [newVerb] = await db.insert(verbs).values(verb).returning();
    return newVerb;
  }
  
  async createVerbs(verbsList: InsertVerb[]): Promise<Verb[]> {
    return await db.insert(verbs).values(verbsList).returning();
  }

  async clearVerbs(): Promise<void> {
    await db.delete(verbs);
    // Reset serial ID if needed (drizzle-orm doesn't have a direct helper for truncate yet)
    await db.execute(sql`ALTER SEQUENCE verbs_id_seq RESTART WITH 1`);
  }
}

export const storage = new DatabaseStorage();
