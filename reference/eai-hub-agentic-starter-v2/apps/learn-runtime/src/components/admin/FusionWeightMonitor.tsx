import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface WeightProfile {
  context_type: string;
  symbolic_weight: number;
  neural_weight: number;
  sample_count: number;
  success_rate: number;
  last_updated: string;
  is_candidate: boolean;
}

export function FusionWeightMonitor() {
  const [weights, setWeights] = useState<WeightProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWeights();
    const interval = setInterval(loadWeights, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);
  
  const loadWeights = async () => {
    try {
      const { data, error } = await supabase
        .from('fusion_weight_profiles')
        .select('*')
        .eq('is_candidate', false)
        .order('last_updated', { ascending: false });
      
      if (error) {
        console.error('❌ Failed to load fusion weights:', error);
      } else {
        setWeights(data || []);
      }
    } catch (e) {
      console.error('❌ Exception loading fusion weights:', e);
    } finally {
      setLoading(false);
    }
  };
  
  const getBalanceColor = (symbolic: number) => {
    if (symbolic >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (symbolic >= 0.6) return 'text-purple-600 dark:text-purple-400';
    if (symbolic >= 0.4) return 'text-green-600 dark:text-green-400';
    return 'text-orange-600 dark:text-orange-400';
  };
  
  const getContextBadgeVariant = (context: string) => {
    if (context === 'crisis') return 'destructive';
    if (context === 'low_confidence') return 'secondary';
    if (context === 'high_confidence') return 'default';
    return 'outline';
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🧬 Learned Fusion Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🧬 Learned Fusion Weights</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Meta-learner dynamically adjusts these weights based on HITL feedback and self-learning events
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {weights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No learned weights yet</p>
        ) : (
          weights.map(w => (
            <div key={w.context_type} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant={getContextBadgeVariant(w.context_type)}>
                  {w.context_type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {w.sample_count} samples
                </span>
              </div>
              
              <div className="flex gap-1 h-10 rounded overflow-hidden">
                <div 
                  className="bg-blue-500 dark:bg-blue-600 flex items-center justify-center transition-all"
                  style={{ width: `${w.symbolic_weight * 100}%` }}
                >
                  <span className="text-xs text-white font-bold px-2">
                    {Math.round(w.symbolic_weight * 100)}% Symbolic
                  </span>
                </div>
                <div 
                  className="bg-green-500 dark:bg-green-600 flex items-center justify-center transition-all"
                  style={{ width: `${w.neural_weight * 100}%` }}
                >
                  <span className="text-xs text-white font-bold px-2">
                    {Math.round(w.neural_weight * 100)}% Neural
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className={getBalanceColor(w.symbolic_weight)}>
                  Balance: {w.symbolic_weight >= 0.7 ? 'Symbolic-dominant' : 
                           w.symbolic_weight >= 0.5 ? 'Balanced' : 'Neural-dominant'}
                </span>
                <span className="text-muted-foreground">
                  Updated: {new Date(w.last_updated).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
