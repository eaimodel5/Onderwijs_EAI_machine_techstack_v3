import path from "node:path";
import fs from "node:fs";
import { loadSSOTFromFile } from "../packages/eai-kernel/src/ssotLoader.js";
import { printCard } from "../packages/eai-kernel/src/cardPrinter.js";

function usage() {
  console.log("Usage: node --loader ts-node/esm tools/print-card.ts <input.json> [ssot.json]");
  process.exit(1);
}

const inputPath = process.argv[2];
const ssotPath = process.argv[3] ?? path.join(process.cwd(), "..", "ssot", "ssot_nl_15.0.0_master_full.json");

if (!inputPath) usage();

const input = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const ssot = loadSSOTFromFile(ssotPath);

const evidenceDir = path.join(process.cwd(), "packages", "eai-evidence");
const evidence_pack = {
  sources: JSON.parse(fs.readFileSync(path.join(evidenceDir, "sources.json"), "utf-8")),
  claims: JSON.parse(fs.readFileSync(path.join(evidenceDir, "claims.json"), "utf-8")),
  patterns: JSON.parse(fs.readFileSync(path.join(evidenceDir, "patterns.json"), "utf-8"))
};

const card = printCard(ssot, { ...input, evidence_pack });

const outDir = path.join(process.cwd(), "out");
fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, `${card.meta.card_id}.eai_card.json`);
fs.writeFileSync(outPath, JSON.stringify(card, null, 2), "utf-8");

const promptPath = path.join(outDir, `${card.meta.card_id}.paste_prompt.txt`);
fs.writeFileSync(promptPath, card.prompt_pack.paste_prompt_text, "utf-8");

console.log("Card printed:");
console.log(outPath);
console.log(promptPath);
