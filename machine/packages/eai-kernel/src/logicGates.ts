export type Band = { code: string; label: string };

// The printer treats SSOT bands as a typed record.
// Example:
// {
//   K: { code: "K2", label: "Procedurele kennis" },
//   TD: { code: "TD5", label: "Hoge taakdichtheid" },
//   ...
// }
export type BandSelection = Record<string, Band>;

function tdRank(code: string): number {
  // TD1..TD8
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
