import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Eye, AlertTriangle } from 'lucide-react';
import { getBlindspotStats } from '@/lib/ngbseEngine';

export function NGBSEPanel() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getBlindspotStats();
    if (data) {
      setStats(data.stats);
      setLogs(data.logs);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assumption':
        return '💭';
      case 'missing_context':
        return '❓';
      case 'overconfidence':
        return '📈';
      case 'bias':
        return '⚖️';
      case 'novel_situation':
        return '🆕';
      default:
        return '🔍';
    }
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NGBSE laden...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Blindspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Laatste 100 checks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.bySeverity.critical}
            </div>
            <Progress
              value={(stats.bySeverity.critical / stats.total) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bySeverity.high}</div>
            <Progress value={(stats.bySeverity.high / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidence.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Detection confidence</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🔍 Blindspot Distribution</CardTitle>
          <CardDescription>By type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getTypeIcon(type)}</span>
                  <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                </div>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Blindspot Logs</CardTitle>
          <CardDescription>Laatste 20 detections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.slice(0, 20).map((log) => (
              <Card key={log.id} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(log.blindspot_type)}</span>
                    <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString('nl-NL')}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{log.description}</p>
                {log.recommendation && (
                  <p className="text-xs text-muted-foreground">💡 {log.recommendation}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs">Confidence: {Number(log.confidence).toFixed(2)}</span>
                  {log.resolved && <Badge variant="outline">Resolved</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
