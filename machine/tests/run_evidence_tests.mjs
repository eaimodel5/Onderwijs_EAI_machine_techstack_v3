import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const evidenceDir = path.join(repoRoot, 'packages', 'eai-evidence');

const sources = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'sources.json'), 'utf-8'));
const claims = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'claims.json'), 'utf-8'));
const patterns = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'patterns.json'), 'utf-8'));

function fail(msg) {
  console.error('EVIDENCE_TEST_FAIL:', msg);
  process.exit(1);
}

const sourceIds = new Set(sources.map(s => s.source_id));
if (sourceIds.size !== sources.length) fail('Duplicate source_id found');

const claimIds = new Set(claims.map(c => c.claim_id));
if (claimIds.size !== claims.length) fail('Duplicate claim_id found');

const patternIds = new Set(patterns.map(p => p.pattern_id));
if (patternIds.size !== patterns.length) fail('Duplicate pattern_id found');

for (const c of claims) {
  for (const sid of (c.sources ?? [])) {
    if (!sourceIds.has(sid)) fail(`Claim ${c.claim_id} references missing source ${sid}`);
  }
  for (const pid of (c.supports?.design_patterns ?? [])) {
    if (!patternIds.has(pid)) fail(`Claim ${c.claim_id} references missing design pattern ${pid}`);
  }
}

for (const p of patterns) {
  for (const cid of (p.claim_links ?? [])) {
    if (!claimIds.has(cid)) fail(`Pattern ${p.pattern_id} references missing claim ${cid}`);
  }
}

console.log('EVIDENCE_TEST_OK');
