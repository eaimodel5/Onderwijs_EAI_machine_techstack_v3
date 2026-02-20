import React, { useState } from 'react';
import { ChevronDown, Brain, Shield, BarChart3, PieChart, BookOpen, Zap, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TransparencyPanelProps {
  v20Metadata?: {
    tdMatrixFlag?: string;
    fusionStrategy?: string;
    safetyScore?: number;
    eaaScores?: { ownership: number; autonomy: number; agency: number };
  };
  symbolicInferences?: string[];
  explainText?: string;
  className?: string;
}

export const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ 
  v20Metadata, 
  symbolicInferences,
  explainText,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!v20Metadata && !symbolicInferences && !explainText) return null;

  const tdMatrixLabels: Record<string, { icon: typeof Scale; label: string; color: string }> = {
    DIDACTIC: { icon: BookOpen, label: 'Didactisch', color: 'from-blue-400 to-indigo-500' },
    AUTONOMOUS: { icon: Zap, label: 'Autonoom', color: 'from-green-400 to-emerald-500' },
    BALANCED: { icon: Scale, label: 'Gebalanceerd', color: 'from-purple-400 to-pink-500' },
  };

  const fusionLabels: Record<string, { icon: typeof Brain; label: string; segments: { neural: number; symbolic: number } }> = {
    neural_enhanced: { icon: Brain, label: 'Neural Enhanced', segments: { neural: 70, symbolic: 30 } },
    weighted_blend: { icon: PieChart, label: 'Hybrid Blend', segments: { neural: 50, symbolic: 50 } },
    symbolic_primary: { icon: BookOpen, label: 'Symbolic Primary', segments: { neural: 30, symbolic: 70 } },
  };

  const tdConfig = v20Metadata?.tdMatrixFlag ? tdMatrixLabels[v20Metadata.tdMatrixFlag] : null;
  const fusionConfig = v20Metadata?.fusionStrategy ? fusionLabels[v20Metadata.fusionStrategy] : null;

  return (
    <div className={`glass-strong border border-primary-purple/20 rounded-xl overflow-hidden shadow-elegant ${className}`}>
      {/* Header Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary-purple" />
          <span className="text-sm font-semibold text-foreground">AI Transparantie</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-slide-in">
          {/* TD-Matrix Gauge */}
          {tdConfig && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <tdConfig.icon className="h-4 w-4 text-primary-purple" />
                <span className="text-xs font-medium text-muted-foreground">TD-Matrix Mode</span>
              </div>
              <div className={`relative h-3 rounded-full bg-gradient-to-r ${tdConfig.color} shadow-glow-sm`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white drop-shadow-md">{tdConfig.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* EAA Scores Bar Chart */}
          {v20Metadata?.eaaScores && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-purple" />
                <span className="text-xs font-medium text-muted-foreground">EAA Framework</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Ownership</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-coral to-primary-purple transition-all duration-500"
                      style={{ width: `${v20Metadata.eaaScores.ownership * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-foreground w-8 text-right">
                    {Math.round(v20Metadata.eaaScores.ownership * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Autonomy</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary-teal to-primary-purple transition-all duration-500"
                      style={{ width: `${v20Metadata.eaaScores.autonomy * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-foreground w-8 text-right">
                    {Math.round(v20Metadata.eaaScores.autonomy * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Agency</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-purple to-primary-coral transition-all duration-500"
                      style={{ width: `${v20Metadata.eaaScores.agency * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-foreground w-8 text-right">
                    {Math.round(v20Metadata.eaaScores.agency * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fusion Strategy Pie Chart */}
          {fusionConfig && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <fusionConfig.icon className="h-4 w-4 text-primary-purple" />
                <span className="text-xs font-medium text-muted-foreground">Fusion Strategy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  {/* Simple pie chart representation */}
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#neural-gradient)" 
                      strokeWidth="20"
                      strokeDasharray={`${fusionConfig.segments.neural * 2.51} ${(100 - fusionConfig.segments.neural) * 2.51}`}
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#symbolic-gradient)" 
                      strokeWidth="20"
                      strokeDasharray={`${fusionConfig.segments.symbolic * 2.51} ${(100 - fusionConfig.segments.symbolic) * 2.51}`}
                      strokeDashoffset={`-${fusionConfig.segments.neural * 2.51}`}
                    />
                    <defs>
                      <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary-purple))" />
                        <stop offset="100%" stopColor="hsl(var(--primary-coral))" />
                      </linearGradient>
                      <linearGradient id="symbolic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--secondary-teal))" />
                        <stop offset="100%" stopColor="hsl(var(--primary-purple))" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary-purple to-primary-coral" />
                    <span className="text-[10px] text-muted-foreground">Neural: {fusionConfig.segments.neural}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-secondary-teal to-primary-purple" />
                    <span className="text-[10px] text-muted-foreground">Symbolic: {fusionConfig.segments.symbolic}%</span>
                  </div>
                  <p className="text-[10px] font-medium text-foreground mt-1">{fusionConfig.label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Safety Score Shield */}
          {v20Metadata?.safetyScore !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-purple" />
                <span className="text-xs font-medium text-muted-foreground">Safety Score</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                  v20Metadata.safetyScore >= 0.7 ? 'from-green-400 to-emerald-500' :
                  v20Metadata.safetyScore >= 0.5 ? 'from-amber-400 to-orange-500' :
                  'from-red-400 to-rose-500'
                } shadow-glow-sm`}>
                  <span className="text-lg font-bold text-white drop-shadow-md">
                    {Math.round(v20Metadata.safetyScore * 100)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {v20Metadata.safetyScore >= 0.7 ? 'Veilig' : v20Metadata.safetyScore >= 0.5 ? 'Gemiddeld' : 'Review vereist'}
                </span>
              </div>
            </div>
          )}

          {/* Symbolic Inferences */}
          {symbolicInferences && symbolicInferences.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Symbolische Inferenties</span>
              <div className="flex flex-wrap gap-1.5">
                {symbolicInferences.map((inference, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-[10px] bg-primary-purple/5 border-primary-purple/20 text-foreground"
                  >
                    {inference}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning Explanation */}
          {explainText && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground">Redenering</span>
              <p className="text-xs text-foreground/80 leading-relaxed">{explainText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
