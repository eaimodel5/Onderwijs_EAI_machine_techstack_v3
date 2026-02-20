import crypto from "node:crypto";

import type { BandSelection } from "./logicGates.js";
import { enforceLogicGates } from "./logicGates.js";
import { buildPastePromptText, type CardContext, type Policy } from "./promptBuilder.js";
import { suggestEvidenceLinks, type EvidencePack } from "./evidenceLinker.js";

export type CardInput = {
  context: CardContext;

  // Bands are selected by the user (UI) or by another resolver upstream.
  bands: BandSelection;

  // Optional: provide an evidence pack so the printer can attach traceable links.
  evidence_pack?: EvidencePack;
};

function nowIso() {
  return new Date().toISOString();
}

function checksum(obj: unknown): string {
  const raw = JSON.stringify(obj);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function defaultPolicyFor(bands: BandSelection): Policy {
  const td = bands.TD.code;
  const highTD = /^TD([5-8])$/.test(td);

  const allowed = [
    "Vragen stellen die de leerling aanzetten tot uitleggen en redeneren",
    "Feedback geven op leerlingwerk volgens succescriteria",
    "Alternatieven en voorbeelden geven nadat de leerling een eerste poging deed",
    "Samenvatten van leerling-uitleg in eigen woorden, met terugvraag",
  ];

  const forbidden = [
    "Het eindantwoord geven zonder tussenstappen en bewijs van leerlingdenken",
    "Een volledige uitwerking geven als de card dit verbiedt (bijvoorbeeld bij K1 of K3)",
    "Ongecontroleerde feitenclaims doen zonder verificatie of bronvermelding wanneer vereist",
    "Werk van de leerling herschrijven zodat de bijdrage van de leerling onzichtbaar wordt",
  ];

  const required_checks = [
    "Vraag eerst om de eigen poging van de leerling (of om tussenstappen) voordat je verbetert",
    "Controleer definities, aannames en eenheden als het een reken- of redeneertaak is",
    "Markeer onzekerheid expliciet en stel een verificatievraag als er twijfel is",
  ];

  if (highTD) {
    required_checks.push("Maak een korte checklist: wat is bewezen door de leerling en wat is AI-hulp");
  }

  return {
    allowed,
    forbidden,
    verification: { required_checks, citation_required: false },
    transparency: {
      ai_contribution_label: "AI-hulp gebruikt volgens EAI-card",
      student_visible_steps: [
        "Eigen poging of eerste antwoord",
        "Redenering of tussenstappen",
        "Wat is aangepast na feedback",
        "Korte reflectie: wat heb ik geleerd",
      ],
    },
  };
}

export function defaultOutputContract() {
  return {
    contract_id: "process_evidence_table_v1",
    format: "markdown_table",
    schema: {
      type: "table",
      columns: [
        { name: "Stap", type: "string" },
        { name: "Wat deed de leerling", type: "string" },
        { name: "Welke AI-hulp", type: "string" },
        { name: "Controle of bewijs", type: "string" },
      ],
      min_rows: 4,
    },
  };
}

export function printCard(ssot: any, input: CardInput, generatorVersion = "2.1.0") {
  // Step 1: apply SSOT logic gates
  const before = JSON.parse(JSON.stringify(input.bands));
  const gate = enforceLogicGates(ssot, input.bands);

  // Step 2: policy and output contract
  const policy = defaultPolicyFor(gate.bands);
  const outputContract = defaultOutputContract();

  const evidence_links = input.evidence_pack
    ? suggestEvidenceLinks(input.context, gate.bands as BandSelection, input.evidence_pack)
    : [];

  const card: any = {
    meta: {
      card_id: crypto.randomUUID(),
      card_version: "2.1.0",
      created_at: nowIso(),
      ssot_version: ssot?.version ?? "unknown",
      generator_version: generatorVersion,
      status: "verified",
    },

    context: input.context,
    bands: gate.bands,
    policy,

    prompt_pack: {
      system_prompt: `Je bent een onderwijsassistent die strikt de EAI-card volgt.
Je vraagt door, dwingt transparantie af, en je geeft geen verboden output.`,

      user_prompt_template: `Gebruik de EAI-card hieronder.
Start met 2 verduidelijkende vragen, daarna begeleid je de leerling stap voor stap.`,

      paste_prompt_text: "",
    },

    output_contract: outputContract,

    trace_requirements: {
      trace_level: "standard",
      required_fields: (ssot?.trace_schema?.required_fields ?? []).map((x: any) => String(x)),
    },

    evidence_links,
  };

  card.prompt_pack.paste_prompt_text = buildPastePromptText(
    input.context,
    gate.bands as BandSelection,
    policy,
    outputContract,
  );

  // Step 3: attach validation report
  card.validation_report = {
    enforced_changes: gate.report,
    input_bands_before: before,
    input_bands_after: gate.bands,
    evidence_links_count: evidence_links.length,
  };

  // Step 4: checksum
  card.meta.checksum_sha256 = checksum({
    meta: { ...card.meta, checksum_sha256: undefined },
    context: card.context,
    bands: card.bands,
    policy: card.policy,
    prompt_pack: card.prompt_pack,
    output_contract: card.output_contract,
    trace_requirements: card.trace_requirements,
    evidence_links: card.evidence_links,
  });

  return card;
}
