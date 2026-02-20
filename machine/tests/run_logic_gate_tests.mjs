import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

function tdRank(code) {
  const m = /^TD(\d+)$/.exec(code);
  return m ? Number(m[1]) : 0;
}

function clampTD(selected, maxCode) {
  const s = tdRank(selected);
  const mx = tdRank(maxCode);
  if (mx === 0) return selected;
  return s > mx ? maxCode : selected;
}

function enforceLogicGates(ssot, bands) {
  const report = [];
  const gates = ssot?.interaction_protocol?.logic_gates ?? [];
  const kCode = bands?.K?.code;

  for (const gate of gates) {
    if (gate?.trigger_band !== kCode) continue;

    const enforcement = gate?.enforcement ?? "";
    const m = /(MAX_TD|ALLOW_TD)\s*=\s*(TD\d+)/.exec(enforcement);
    if (!m) continue;

    const limit = m[2];
    const before = bands.TD.code;
    const after = clampTD(before, limit);

    if (after !== before) {
      bands.TD = { ...bands.TD, code: after };
      report.push({ rule: `SSOT logic gate for ${kCode}`, before, after, reason: enforcement });
    }
  }

  return { bands, report };
}

const ssotPath = path.join(process.cwd(), "..", "ssot", "ssot_nl_15.0.0_master_full.json");
const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf-8"));

const vectors = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tests", "logic_gate_test_vectors.json"), "utf-8"));

for (const v of vectors) {
  const bands = {
    K: { code: v.input_bands.K, label: v.input_bands.K },
    P: { code: "P1", label: "dummy" },
    TD: { code: v.input_bands.TD, label: v.input_bands.TD },
    C: { code: "C1", label: "dummy" },
    V: { code: "V1", label: "dummy" },
    T: { code: "T1", label: "dummy" },
    E: { code: "E1", label: "dummy" },
    L: { code: "L1", label: "dummy" },
    S: { code: "S1", label: "dummy" },
    B: { code: "B1", label: "dummy" }
  };

  const res = enforceLogicGates(ssot, bands);
  assert.equal(res.bands.TD.code, v.expected_TD, `Vector failed: ${v.name}`);
}

console.log("LOGIC_GATE_TEST_OK");
