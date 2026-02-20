
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface ReflectionLog {
  id: string;
  created_at: string;
  trigger_type: string;
  context: any;
  new_seeds_generated: number;
  learning_impact: number;
}

const SelfLearningMonitor: React.FC = () => {
  const [logs, setLogs] = useState<ReflectionLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_recent_reflection_logs', { p_limit: 50 });
      if (error) throw error;
      setLogs((data as ReflectionLog[]) || []);
    } catch (e) {
      console.error('Failed to load reflection logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const t = setInterval(loadLogs, 30000);
    return () => clearInterval(t);
  }, []);

  const totals = useMemo(() => {
    const byType = logs.reduce((acc, l) => {
      acc[l.trigger_type] = (acc[l.trigger_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const seeds = logs.reduce((sum, l) => sum + (l.new_seeds_generated || 0), 0);
    const impact = logs.reduce((sum, l) => sum + (l.learning_impact || 0), 0);
    return { byType, seeds, impact };
  }, [logs]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Self-Learning Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {Object.entries(totals.byType).map(([type, count]) => (
            <Badge key={type} variant="outline">
              {type.replace('_', ' ')}: {count}
            </Badge>
          ))}
          <Badge variant="outline">Seeds toegevoegd: {totals.seeds}</Badge>
          <Badge variant="outline">Impact score: {totals.impact.toFixed(2)}</Badge>
        </div>

        <Separator />

        <div className="space-y-3 max-h-80 overflow-auto">
          {loading && <div className="text-sm text-muted-foreground">Laden...</div>}
          {!loading && logs.length === 0 && (
            <div className="text-sm text-muted-foreground">Nog geen zelfleer-events vastgelegd.</div>
          )}
          {logs.map((l) => (
            <div key={l.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {l.trigger_type.replace('_', ' ')}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString('nl-NL')}
                </div>
              </div>
              <div className="mt-2 text-sm">
                <div className="line-clamp-2">
                  {l?.context?.userInput || l?.context?.input || '-'}
                </div>
                {l?.context?.newSeed?.id && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Nieuwe seed: {l.context.newSeed.emotion} · {l.context.newSeed.label}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelfLearningMonitor;
