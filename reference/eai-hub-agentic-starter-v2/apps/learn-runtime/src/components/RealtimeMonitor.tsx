
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Monitor, Cpu, Database, Network } from 'lucide-react';

interface SystemMetrics {
  neuralProcessing: boolean;
  symbolicMatching: boolean;
  vectorSearch: boolean;
  databaseConnection: boolean;
  lastUpdate: Date;
}

interface RealtimeMonitorProps {
  isProcessing: boolean;
  lastDecision?: {
    type: 'neural' | 'symbolic' | 'hybrid';
    confidence: number;
    source: string;
    processingTime: number;
  } | null;
}

const RealtimeMonitor: React.FC<RealtimeMonitorProps> = ({ 
  isProcessing, 
  lastDecision 
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    neuralProcessing: true,
    symbolicMatching: true,
    vectorSearch: true,
    databaseConnection: true,
    lastUpdate: new Date()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-500' : 'bg-red-500';
  };

  const getDecisionTypeColor = (type?: string) => {
    switch (type) {
      case 'symbolic': return 'default';
      case 'neural': return 'secondary';
      case 'hybrid': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Realtime Systeem Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div>
          <h4 className="text-sm font-medium mb-2">Systeem Status</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.neuralProcessing)}`} />
              <span className="text-sm">Neural Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.symbolicMatching)}`} />
              <span className="text-sm">Symbolic Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.vectorSearch)}`} />
              <span className="text-sm">Vector Search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.databaseConnection)}`} />
              <span className="text-sm">Database</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Processing Status */}
        <div>
          <h4 className="text-sm font-medium mb-2">Verwerkingsstatus</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm">
              {isProcessing ? 'Actief aan het verwerken...' : 'Wachtend op input'}
            </span>
          </div>
        </div>

        {/* Last Decision */}
        {lastDecision && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Laatste Beslissing</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getDecisionTypeColor(lastDecision.type)}>
                    {lastDecision.type}
                  </Badge>
                  <span className="text-sm">Vertrouwen: {Math.round(lastDecision.confidence * 100)}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Bron: {lastDecision.source} • {lastDecision.processingTime}ms
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center">
          Laatste update: {metrics.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeMonitor;
