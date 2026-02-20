export type BandSelection = Record<string, { code: string; label: string }>;

function tdRank(code: string): number {
  const m = /^TD(\d+)$/.exec(code);
  return m ? Number(m[1]) : 0;
}

function clampTD(selected: string, maxCode: string): string {
  const s = tdRank(selected);
  const mx = tdRank(maxCode);
  if (mx === 0) return selected;
  return s > mx ? maxCode : selected;
}

export function enforceLogicGates(ssot: any, bands: BandSelection) {
  const report: Array<{ rule: string; before: string; after: string; reason: string }> = [];
  const gates = ssot?.interaction_protocol?.logic_gates ?? [];
  const kCode = bands?.K?.code;

  for (const gate of gates) {
    if (gate?.trigger_band !== kCode) continue;

    const enforcement: string = gate?.enforcement ?? "";
    const m = /(MAX_TD|ALLOW_TD)\s*=\s*(TD\d+)/.exec(enforcement);
    if (!m) continue;

    const limit = m[2];
    const before = bands.TD.code;
    const after = clampTD(before, limit);

    if (after !== before) {
      bands.TD = { ...bands.TD, code: after };
      report.push({
        rule: `SSOT logic gate for ${kCode}`,
        before,
        after,
        reason: enforcement,
      });
    }
  }

  return { bands, report };
}
