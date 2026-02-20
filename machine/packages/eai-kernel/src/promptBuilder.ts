import type { BandSelection } from "./logicGates.js";

export type CardContext = {
  audience: "teacher" | "student" | "team" | "system";
  subject: string;
  level: string;
  task_description: string;
  process_phase: string;
  assessment_stakes?: "low" | "medium" | "high";
  language?: string;
  constraints?: string[];
};

export type Policy = {
  allowed: string[];
  forbidden: string[];
  verification: { required_checks: string[]; citation_required?: boolean };
  transparency: { student_visible_steps: string[]; ai_contribution_label: string };
};

export function buildPastePromptText(context: CardContext, bands: BandSelection, policy: Policy, outputContract: any) {
  const lines: string[] = [];
  lines.push("EAI-card (plakbaar in elke LLM)");
  lines.push("");
  lines.push("1) Context");
  lines.push(`- Doelgroep: ${context.audience}`);
  lines.push(`- Vak/gebied: ${context.subject}`);
  lines.push(`- Niveau: ${context.level}`);
  lines.push(`- Taak: ${context.task_description}`);
  lines.push(`- Procesfase: ${context.process_phase}`);
  if (context.assessment_stakes) lines.push(`- Stakes: ${context.assessment_stakes}`);
  if (context.constraints?.length) {
    lines.push("- Extra beperkingen:");
    for (const c of context.constraints) lines.push(`  - ${c}`);
  }
  lines.push("");
  lines.push("2) Rubric banden (SSOT)");
  for (const [k, v] of Object.entries(bands)) {
    lines.push(`- ${k}: ${v.code} | ${v.label}`);
  }
  lines.push("");
  lines.push("3) Regels voor AI gebruik");
  lines.push("Toegestaan:");
  for (const a of policy.allowed) lines.push(`- ${a}`);
  lines.push("Niet toegestaan:");
  for (const f of policy.forbidden) lines.push(`- ${f}`);
  lines.push("");
  lines.push("4) Verificatie (verplicht)");
  for (const chk of policy.verification.required_checks) lines.push(`- ${chk}`);
  lines.push("");
  lines.push("5) Transparantie (verplicht)");
  lines.push(`- Label AI-bijdrage: ${policy.transparency.ai_contribution_label}`);
  lines.push("- Stappen die de leerling zichtbaar moet tonen:");
  for (const s of policy.transparency.student_visible_steps) lines.push(`- ${s}`);
  lines.push("");
  lines.push("6) Output contract");
  lines.push(`- contract_id: ${outputContract.contract_id}`);
  lines.push(`- format: ${outputContract.format}`);
  lines.push("Volg exact het schema hieronder:");
  lines.push(JSON.stringify(outputContract.schema, null, 2));
  lines.push("");
  lines.push("7) Werkafspraak");
  lines.push("Als je twijfelt of informatie klopt, vraag door en stel een verificatiestap voor. Geef geen eindantwoord als dat verboden is door de regels hierboven.");

  return lines.join("\n");
}
