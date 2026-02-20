import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  hitlQueueDepth: number;
  blindspotsLast24h: number;
  healingSuccessRate: number;
  avgProcessingTime: number;
}

export function MasterFlowStatus() {
  const [health, setHealth] = useState<SystemHealth>({
    hitlQueueDepth: 0,
    blindspotsLast24h: 0,
    healingSuccessRate: 100,
    avgProcessingTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthMetrics();
    const interval = setInterval(loadHealthMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealthMetrics = async () => {
    try {
      // HITL queue depth
      const { count: hitlCount } = await supabase
        .from('hitl_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Blindspots last 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: blindspotCount } = await supabase
        .from('blindspot_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Healing success rate
      const { data: healingData } = await supabase
        .from('healing_attempts')
        .select('success')
        .limit(50);

      const successRate = healingData
        ? (healingData.filter((h) => h.success).length / healingData.length) * 100
        : 100;

      // Avg processing time
      const { data: flowData } = await supabase
        .from('processing_flow_events')
        .select('processing_time_ms')
        .not('processing_time_ms', 'is', null)
        .limit(100);

      const avgTime = flowData?.length
        ? flowData.reduce((sum, f) => sum + (f.processing_time_ms || 0), 0) / flowData.length
        : 0;

      setHealth({
        hitlQueueDepth: hitlCount || 0,
        blindspotsLast24h: blindspotCount || 0,
        healingSuccessRate: Math.round(successRate),
        avgProcessingTime: Math.round(avgTime),
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load health metrics:', error);
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (health.hitlQueueDepth > 10) return 'critical';
    if (health.healingSuccessRate < 70) return 'warning';
    if (health.blindspotsLast24h > 50) return 'warning';
    return 'healthy';
  };

  const status = getHealthStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>⚡ MasterFlow Health</CardTitle>
          {status === 'healthy' && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Operational
            </Badge>
          )}
          {status === 'warning' && (
            <Badge variant="secondary">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Warning
            </Badge>
          )}
          {status === 'critical' && (
            <Badge variant="destructive">
              <Activity className="mr-1 h-3 w-3" />
              Critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">HITL Queue</span>
              <span className="font-bold">{health.hitlQueueDepth}</span>
            </div>
            <Progress
              value={Math.min(health.hitlQueueDepth * 10, 100)}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Blindspots (24h)</span>
              <span className="font-bold">{health.blindspotsLast24h}</span>
            </div>
            <Progress value={Math.min(health.blindspotsLast24h * 2, 100)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Healing Rate</span>
              <span className="font-bold">{health.healingSuccessRate}%</span>
            </div>
            <Progress value={health.healingSuccessRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Time</span>
              <span className="font-bold">{health.avgProcessingTime}ms</span>
            </div>
            <Progress
              value={Math.max(0, 100 - health.avgProcessingTime / 10)}
              className="h-2"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {status === 'healthy' && '✅ All systems operational'}
            {status === 'warning' && '⚠️ Some systems require attention'}
            {status === 'critical' && '🚨 Immediate attention required'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
