import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);

export function loadEvidencePack() {
  const sources = JSON.parse(fs.readFileSync(path.join(here, 'sources.json'), 'utf-8'));
  const claims = JSON.parse(fs.readFileSync(path.join(here, 'claims.json'), 'utf-8'));
  const patterns = JSON.parse(fs.readFileSync(path.join(here, 'patterns.json'), 'utf-8'));
  return { sources, claims, patterns };
}
