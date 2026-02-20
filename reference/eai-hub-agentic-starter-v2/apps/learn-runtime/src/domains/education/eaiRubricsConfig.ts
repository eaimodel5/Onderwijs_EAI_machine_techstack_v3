import rubrics from '@/../config/eai/EAI_Rubrics_11_0_0_all_RELATIONAL_full.json';

export interface NestedLearningProfile {
  nested_level: number;              // 0 = turn, 1 = task, 2 = trajectory
  update_window_turns: number;       // how many turns to consider
  memory_role: 'fast_correction' | 'bridge' | 'slow_trace' | string;
  inner_objective?: string;
}

export interface MechanisticSignatureConfig {
  fast_weight?: number;
  mid_weight?: number;
  slow_weight?: number;
  risks?: string[];
}

export interface BandConfig {
  id: string;                        // e.g. "TD_Taakdichtheid_3"
  score_min: number;
  score_max: number;
  flag_id: string | null;
  fix_id: string | null;
  nl_profile?: NestedLearningProfile;
  mechanistic_signature?: MechanisticSignatureConfig;
}

export interface DimensionConfig {
  id: string;                        // e.g. "TD_Taakdichtheid"
  bands: BandConfig[];
}

export interface RubricsConfig {
  dimensions: Record<string, DimensionConfig>;
}

// The raw JSON is the full EAI rubric export. We map it into a simpler runtime view.
// We assume the JSON has a top-level "rubrics" array where each rubric has:
// - rubric_id
// - bands: [{ band_id, score_min, score_max, flag, fix, nested_learning, mechanistic_signature_target }, ...]
interface RawRubricBand {
  band_id: string;
  score_min: number;
  score_max: number;
  flag?: { id: string } | null;
  fix?: { id: string } | null;
  nested_learning?: {
    nested_level?: number;
    update_window_turns?: number;
    memory_role?: string;
    inner_objective?: string;
  } | null;
  mechanistic_signature_target?: {
    fast_weight?: number;
    mid_weight?: number;
    slow_weight?: number;
    risks?: string[];
  } | null;
}

interface RawRubric {
  rubric_id: string;
  bands: RawRubricBand[];
}

interface RawRubricsFile {
  rubrics: RawRubric[];
}

const raw = rubrics as unknown as RawRubricsFile;

const dimensionMap: Record<string, DimensionConfig> = {};

for (const rubric of raw.rubrics) {
  const bands: BandConfig[] = rubric.bands.map((b) => ({
    id: b.band_id,
    score_min: b.score_min,
    score_max: b.score_max,
    flag_id: b.flag?.id ?? null,
    fix_id: b.fix?.id ?? null,
    nl_profile: b.nested_learning
      ? {
          nested_level: b.nested_learning.nested_level ?? 0,
          update_window_turns: b.nested_learning.update_window_turns ?? 3,
          memory_role: (b.nested_learning.memory_role as any) ?? 'fast_correction',
          inner_objective: b.nested_learning.inner_objective
        }
      : undefined,
    mechanistic_signature: b.mechanistic_signature_target
      ? {
          fast_weight: b.mechanistic_signature_target.fast_weight,
          mid_weight: b.mechanistic_signature_target.mid_weight,
          slow_weight: b.mechanistic_signature_target.slow_weight,
          risks: b.mechanistic_signature_target.risks
        }
      : undefined
  }));

  dimensionMap[rubric.rubric_id] = {
    id: rubric.rubric_id,
    bands
  };
}

export const rubricsConfig: RubricsConfig = {
  dimensions: dimensionMap
};

export function getDimensionConfig(id: string): DimensionConfig | undefined {
  return rubricsConfig.dimensions[id];
}

export function getBandForScore(dimensionId: string, score: number): BandConfig | undefined {
  const dim = getDimensionConfig(dimensionId);
  if (!dim) return undefined;
  return dim.bands.find((b) => score >= b.score_min && score <= b.score_max);
}
