export type EvidencePack = {
  sources: Array<{ source_id: string }>;
  claims: Array<{ claim_id: string; sources?: string[]; supports?: { design_patterns?: string[] } }>;
  patterns: Array<{ pattern_id: string; claim_links: string[] }>;
};

function norm(s: string) {
  return String(s || "").toLowerCase();
}

export function suggestEvidenceLinks(context: any, bands: any, pack: EvidencePack) {
  const phase = norm(context?.process_phase ?? "");
  const k = String(bands?.K?.code ?? "");

  const want: string[] = [];

  // Phase based defaults
  if (phase.includes("oefen") || phase.includes("practice") || phase.includes("consolid")) {
    want.push("retrieval_practice", "feed_up_back_forward", "guided_practice");
  }
  if (phase.includes("feedback") || phase.includes("format") || phase.includes("reflect")) {
    want.push("feed_up_back_forward");
  }

  // Knowledge type overrides
  if (k === "K1") {
    want.push("worked_examples", "guided_practice");
  }
  if (k === "K3") {
    want.push("explain_your_reasoning", "compare_and_justify");
  }

  // Remove duplicates
  const patternIds = Array.from(new Set(want)).filter((id) => pack.patterns.some((p) => p.pattern_id === id));

  const claimIds = new Set<string>();
  const sourceIds = new Set<string>();

  for (const pid of patternIds) {
    const p = pack.patterns.find((x) => x.pattern_id === pid);
    if (!p) continue;
    for (const clm of p.claim_links ?? []) claimIds.add(clm);
  }

  for (const cid of claimIds) {
    const c = pack.claims.find((x) => x.claim_id === cid);
    for (const sid of c?.sources ?? []) sourceIds.add(sid);
  }

  const links: string[] = [];
  for (const pid of patternIds) links.push(`PAT_${pid}`);
  for (const cid of Array.from(claimIds)) links.push(cid);
  for (const sid of Array.from(sourceIds)) links.push(sid);

  return links;
}
