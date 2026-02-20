import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface FlowNode {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  processingTime?: number;
  timestamp: string;
}

const NODE_ORDER = [
  'Safety Check',
  'Rubrics Assessment',
  'EAA Evaluation',
  'Regisseur Briefing',
  'Policy Decision',
  'Semantic Graph',
  'NeSy Fusion',
  'TD-Matrix',
  'E_AI Rules',
  'NGBSE Check',
  'HITL Check',
  'Response Generation',
  'Validation',
];

export function LiveFlowDiagram() {
  const [nodes, setNodes] = useState<Map<string, FlowNode>>(new Map());
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Subscribe to real-time flow events
    const channel = supabase
      .channel('flow_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'processing_flow_events' },
        (payload) => {
          const event = payload.new;
          setSessionId(event.session_id);
          
          setNodes((prev) => {
            const updated = new Map(prev);
            updated.set(event.node_name, {
              id: event.id,
              name: event.node_name,
              status: event.status,
              processingTime: event.processing_time_ms,
              timestamp: event.created_at,
            });
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'processing':
        return <Activity className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'skipped':
        return <Zap className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800';
      case 'failed':
        return 'bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800';
      case 'processing':
        return 'bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-800';
      case 'skipped':
        return 'bg-yellow-100 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Live Processing Flow</CardTitle>
        {sessionId && (
          <p className="text-xs text-muted-foreground">Session: {sessionId.slice(0, 16)}...</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {NODE_ORDER.map((nodeName, index) => {
            const node = nodes.get(nodeName);
            const status = node?.status || 'pending';
            
            return (
              <div key={nodeName} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                
                <div
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${getNodeColor(
                    status
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(status)}
                      <span className="font-medium text-sm">{nodeName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {node?.processingTime && (
                        <Badge variant="outline" className="text-xs">
                          {node.processingTime}ms
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {index < NODE_ORDER.length - 1 && (
                  <div className="flex-shrink-0 w-px h-8 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
