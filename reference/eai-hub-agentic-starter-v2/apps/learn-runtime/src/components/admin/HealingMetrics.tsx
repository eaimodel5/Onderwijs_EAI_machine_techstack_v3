import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCw, AlertOctagon } from 'lucide-react';
import { getHealingStats } from '@/orchestrator/autoHealing';

export function HealingMetrics() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getHealingStats();
    if (data) {
      setStats(data.stats);
      setLogs(data.logs);
    }
    setLoading(false);
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'retry':
        return <RotateCw className="h-4 w-4" />;
      case 'fallback':
        return <AlertOctagon className="h-4 w-4" />;
      case 'escalate_hitl':
        return <AlertOctagon className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auto-Healing laden...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Laatste 100 healing attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate.toFixed(1)}%
            </div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Per healing attempt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">HITL Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.byStrategy.escalate_hitl}
            </div>
            <p className="text-xs text-muted-foreground">Couldn't auto-heal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Strategy Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                <span className="text-sm">Retry</span>
              </div>
              <Badge variant="secondary">{stats.byStrategy.retry}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" />
                <span className="text-sm">Fallback</span>
              </div>
              <Badge variant="secondary">{stats.byStrategy.fallback}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-destructive" />
                <span className="text-sm">Escalate to HITL</span>
              </div>
              <Badge variant="destructive">{stats.byStrategy.escalate_hitl}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byErrorType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                <Badge variant="outline">{count as number}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Healing Attempts</CardTitle>
          <CardDescription>Laatste 20 attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.slice(0, 20).map((log) => (
              <Card key={log.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStrategyIcon(log.strategy)}
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.strategy}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Attempt #{log.attempt_number}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Error:</span> {log.error_type}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-muted-foreground truncate">
                        {log.error_message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span>{log.processing_time_ms}ms</span>
                      <span>•</span>
                      <span>{new Date(log.created_at).toLocaleTimeString('nl-NL')}</span>
                    </div>
                  </div>
                  {log.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
