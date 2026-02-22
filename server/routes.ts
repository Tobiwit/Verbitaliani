import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { InsertVerb } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.verbs.list.path, async (req, res) => {
    const verbs = await storage.getVerbs();
    res.json(verbs);
  });

  // Function Words Endpoint
  app.get("/api/function-words", async (req, res) => {
    try {
      const functionWords = await storage.getFunctionWords();
      res.json({ words: functionWords });
    } catch (e) {
      res.status(500).json({ message: "Failed to load function words", error: String(e) });
    }
  });

  app.get(api.verbs.get.path, async (req, res) => {
    const verb = await storage.getVerb(Number(req.params.id));
    if (!verb) {
      return res.status(404).json({ message: 'Verb not found' });
    }
    res.json(verb);
  });

  // Seed Data Endpoint (for development/demo)
  app.post('/api/seed', async (req, res) => {
    try {
      await storage.clearVerbs();
      const seedData = getSeedData();
      await storage.createVerbs(seedData);
      res.json({ message: 'Seeded successfully', count: seedData.length });
    } catch (e) {
      res.status(500).json({ message: 'Seed failed', error: String(e) });
    }
  });

  // Seed on startup if empty
  (async () => {
    try {
      const existing = await storage.getVerbs();
      if (existing.length === 0) {
        console.log("Auto-seeding database with new verb list...");
        const seedData = getSeedData();
        await storage.createVerbs(seedData);
        console.log("Database auto-seeded.");
      }
    } catch (e) {
      console.error("Error auto-seeding:", e);
    }
  })();

  function getSeedData(): InsertVerb[] {
    return [
      {"italian":"essere","german":"sein","english":"to be","presente":"sono, sei, è, siamo, siete, sono","passato_prossimo":"sono stato/a, sei stato/a, è stato/a, siamo stati/e, siete stati/e, sono stati/e","imperfetto":"ero, eri, era, eravamo, eravate, erano","presente_progressivo":"sto essendo, stai essendo, sta essendo, stiamo essendo, state essendo, stanno essendo"},
      {"italian":"avere","german":"haben","english":"to have","presente":"ho, hai, ha, abbiamo, avete, hanno","passato_prossimo":"ho avuto, hai avuto, ha avuto, abbiamo avuto, avete avuto, hanno avuto","imperfetto":"avevo, avevi, aveva, avevamo, avevate, avevano","presente_progressivo":"sto avendo, stai avendo, sta avendo, stiamo avendo, state avendo, stanno avendo"},
      {"italian":"fare","german":"machen/tun","english":"to do/make","presente":"faccio, fai, fa, facciamo, fate, fanno","passato_prossimo":"ho fatto, hai fatto, ha fatto, abbiamo fatto, avete fatto, hanno fatto","imperfetto":"facevo, facevi, faceva, facevamo, facevate, facevano","presente_progressivo":"sto facendo, stai facendo, sta facendo, stiamo facendo, state facendo, stanno facendo"},
      {"italian":"andare","german":"gehen","english":"to go","presente":"vado, vai, va, andiamo, andate, vanno","passato_prossimo":"sono andato/a, sei andato/a, è andato/a, siamo andati/e, siete andati/e, sono andati/e","imperfetto":"andavo, andavi, andava, andavamo, andavate, andavano","presente_progressivo":"sto andando, stai andando, sta andando, stiamo andando, state andando, stanno andando"},
      {"italian":"dire","german":"sagen","english":"to say/tell","presente":"dico, dici, dice, diciamo, dite, dicono","passato_prossimo":"ho detto, hai detto, ha detto, abbiamo detto, avete detto, hanno detto","imperfetto":"dicevo, dicevi, diceva, dicevamo, dicevate, dicevano","presente_progressivo":"sto dicendo, stai dicendo, sta dicendo, stiamo dicendo, state dicendo, stanno dicendo"},
      {"italian":"potere","german":"können","english":"can/to be able to","presente":"posso, puoi, può, possiamo, potete, possono","passato_prossimo":"ho potuto, hai potuto, ha potuto, abbiamo potuto, avete potuto, hanno potuto","imperfetto":"potevo, potevi, poteva, potevamo, potevate, potevano","presente_progressivo":"sto potendo, stai potendo, sta potendo, stiamo potendo, state potendo, stanno potendo"},
      {"italian":"dovere","german":"müssen/sollen","english":"must/to have to","presente":"devo, devi, deve, dobbiamo, dovete, devono","passato_prossimo":"ho dovuto, hai dovuto, ha dovuto, abbiamo dovuto, avete dovuto, hanno dovuto","imperfetto":"dovevo, dovevi, doveva, dovevamo, dovevate, dovevano","presente_progressivo":"sto dovendo, stai dovendo, sta dovendo, stiamo dovendo, state dovendo, stanno dovendo"},
      {"italian":"volere","german":"wollen","english":"to want","presente":"voglio, vuoi, vuole, vogliamo, volete, vogliono","passato_prossimo":"ho voluto, hai voluto, ha voluto, abbiamo voluto, avete voluto, hanno voluto","imperfetto":"volevo, volevi, voleva, volevamo, volevate, volevano","presente_progressivo":"sto volendo, stai volendo, sta volendo, stiamo volendo, state volendo, stanno volendo"},
      {"italian":"sapere","german":"wissen/können","english":"to know","presente":"so, sai, sa, sappiamo, sapete, sanno","passato_prossimo":"ho saputo, hai saputo, ha saputo, abbiamo saputo, avete saputo, hanno saputo","imperfetto":"sapevo, sapevi, sapeva, sapevamo, sapevate, sapevano","presente_progressivo":"sto sapendo, stai sapendo, sta sapendo, stiamo sapendo, state sapendo, stanno sapendo"},
      {"italian":"vedere","german":"sehen","english":"to see","presente":"vedo, vedi, vede, vediamo, vedete, vedono","passato_prossimo":"ho visto, hai visto, ha visto, abbiamo visto, avete visto, hanno visto","imperfetto":"vedevo, vedevi, vedeva, vedevamo, vedevate, vedevano","presente_progressivo":"sto vedendo, stai vedendo, sta vedendo, stiamo vedendo, state vedendo, stanno vedendo"}
    ];
  }

  return httpServer;
}
