import express from "express";
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { loadSSOTFromFile } from "../../packages/eai-kernel/src/ssotLoader.js";
import { printCard } from "../../packages/eai-kernel/src/cardPrinter.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

const repoRoot = process.cwd();
const defaultSSOT = path.join(repoRoot, "..", "..", "..", "ssot", "ssot_nl_15.0.0_master_full.json");
const ssot = loadSSOTFromFile(process.env.SSOT_PATH ?? defaultSSOT);

const evidenceDir = path.join(repoRoot, "..", "..", "packages", "eai-evidence");
const evidence_pack = {
  sources: JSON.parse(fs.readFileSync(path.join(evidenceDir, "sources.json"), "utf-8")),
  claims: JSON.parse(fs.readFileSync(path.join(evidenceDir, "claims.json"), "utf-8")),
  patterns: JSON.parse(fs.readFileSync(path.join(evidenceDir, "patterns.json"), "utf-8"))
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const cardSchemaPath = path.join(repoRoot, "..", "..", "packages", "eai-schemas", "eai_card_v2.schema.json");
const cardSchema = JSON.parse(fs.readFileSync(cardSchemaPath, "utf-8"));
const validateCard = ajv.compile(cardSchema);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ssot_version: ssot.version, generator: "2.1.0" });
});

app.post("/print-card", (req, res) => {
  try {
    const input = req.body;
    const card = printCard(ssot, { ...input, evidence_pack });
    const ok = validateCard(card);
    if (!ok) {
      return res.status(400).json({ error: "Card validation failed", details: validateCard.errors, card });
    }
    res.json({ card });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message ?? e) });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`EAI card printer API listening on http://localhost:${port}`);
});
