import fs from "node:fs";
import path from "node:path";

export type SSOT = any;

export function loadSSOTFromFile(ssotPath: string): SSOT {
  const raw = fs.readFileSync(ssotPath, "utf-8");
  return JSON.parse(raw);
}

export function resolveRepoSSOT(repoRoot: string, version: string): string {
  // Expected path: <repoRoot>/ssot/ssot_nl_<version>_master_full.json
  const file = `ssot_nl_${version}_master_full.json`;
  const p = path.join(repoRoot, "..", "ssot", file);
  if (!fs.existsSync(p)) {
    throw new Error(`SSOT file not found: ${p}`);
  }
  return p;
}
