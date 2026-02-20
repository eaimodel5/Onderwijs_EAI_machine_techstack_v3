
import { MetricSet, EvalConfig, EvalReport } from '../types';

export class EAIEvaluator {
  config: EvalConfig;

  constructor(config?: Partial<EvalConfig>) {
      this.config = {
          weights: {
              w_P: 0.25,
              w_V: 0.25,
              w_DA: 0.15,
              w_DBc: 0.10,
              w_T: 0.10,
              w_A: 0.10,
              w_B: 0.05,
          },
          lambdas: {
              TD_corr: 0.5,
              bias_penalty: 0.3,
              variance_stabilizer: 0.2,
          },
          ...config,
      } as EvalConfig;
  }

  public evaluate(metrics: MetricSet): EvalReport {
      const trace: string[] = [];
      const id = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const timestamp = new Date().toISOString();

      // --- CLASS V ENGINE UPGRADE ---
      // 1. Context-Weight Normalizer (Simulated based on complexity of V)
      // If Skill Potential (V) is high, we tolerate higher Task Density.
      const contextWeight = 1 + (metrics.V * 0.2); 
      
      const { TD, F_TD, flag } = this.computeTaskDensity(metrics.P, metrics.V, contextWeight);
      
      trace.push(`[Class V] Context Weight: ${contextWeight.toFixed(3)}`);
      trace.push(`[Class V] TD calculated: ${TD.toFixed(3)}`);
      trace.push(`[Class V] Correction Factor F_TD: ${F_TD.toFixed(3)} [${flag}]`);

      const w = this.config.weights;
      
      // Core Components
      const c_PV = w.w_P * metrics.P * w.w_V * metrics.V;
      const c_Dialog = w.w_DA * metrics.D_A * w.w_DBc * metrics.D_Bc;
      const c_Transfer = w.w_T * metrics.T * w.w_A * metrics.A;
      
      // Bias Penalty Curve (Sigmoid-like penalty for high bias)
      const biasPenalty = Math.pow(metrics.B, 2.5); 
      const c_Balance = (1 - w.w_B * biasPenalty);

      const core = c_PV + c_Dialog + c_Transfer + c_Balance;
      const safeCore = Math.max(0, core);
      
      // Fourth Root Stabilization (Class IV Legacy)
      const fourthRoot = Math.pow(safeCore, 0.25);
      
      // Final Assembly
      const EAI = fourthRoot * metrics.C * F_TD * 10; // Scaled to 10

      // Clamp
      const finalScore = Math.min(10, Math.max(0, EAI));

      return {
          id,
          timestamp,
          EAI: Number(finalScore.toFixed(4)),
          F_TD: Number(F_TD.toFixed(3)),
          TD: Number(TD.toFixed(3)),
          TD_flag: flag,
          trace,
          metrics,
      };
  }

  private computeTaskDensity(P: number, V: number, contextWeight: number): { TD: number; F_TD: number; flag: string } {
      const TD = (P + V) / 2;
      let F_TD: number;

      // Class V Curve: The "Goldilocks Zone" moves based on contextWeight
      const optimalTD = 0.5 * contextWeight; 
      const tolerance = 0.2;

      // Distance from optimal
      const dist = Math.abs(TD - optimalTD);

      if (dist <= tolerance) {
          F_TD = 1.0;
      } else {
          // Penalty grows quadratically with distance
          F_TD = 1 - (Math.pow(dist - tolerance, 2) * 2);
      }
      
      F_TD = Math.max(0.1, Math.min(1, F_TD));

      let flag: string;
      if (TD > optimalTD + 0.3) flag = "AI_dominance";
      else if (TD < 0.2) flag = "Underuse_warning";
      else flag = "TD_balanced";

      return {
          TD: Number(TD.toFixed(3)),
          F_TD: Number(F_TD.toFixed(3)),
          flag,
      };
  }
}

export function getTDRecommendation(flag: string): string {
  const recommendations: Record<string, string> = {
      AI_dominance: "⚠️ High AI dependency (Pseudo-Complexity). Use /turn or /choice strategies to increase student agency.",
      Underuse_warning: "⚠️ Low AI utilization. The tool is passive. Consider /intro or /schema to leverage AI scaffolding.",
      TD_balanced: "✅ Optimal Human-AI Balance (Class V Verified). Proceed with /meta reflection.",
  };
  return recommendations[flag] || "No specific recommendation.";
}
