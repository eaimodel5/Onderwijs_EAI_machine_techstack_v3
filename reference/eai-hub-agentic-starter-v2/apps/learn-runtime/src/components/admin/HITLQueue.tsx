import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { HITLQueueItem } from '@/types/hitl';
import { getPendingHITLItems, resolveHITL } from '@/lib/hitlTriggers';
import { toast } from 'sonner';

export function HITLQueue() {
  const [items, setItems] = useState<HITLQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HITLQueueItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();

    // Subscribe to real-time updates for both hitl_queue and hitl_notifications
    const queueChannel = supabase
      .channel('hitl_queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hitl_queue' }, () => {
        loadItems();
      })
      .subscribe();
    
    const notificationsChannel = supabase
      .channel('hitl_notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'hitl_notifications' 
      }, (payload) => {
        console.log('🔔 New HITL notification:', payload);
        toast.warning('HITL Notificatie', {
          description: payload.new.message || 'Nieuwe review aanvraag',
        });
        loadItems(); // Refresh queue
      })
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await getPendingHITLItems();
    setItems(data);
    setLoading(false);
  };

  const handleResolve = async (
    itemId: string,
    status: 'approved' | 'rejected' | 'override'
  ) => {
    if (!adminResponse.trim()) {
      toast.error('Voeg een admin response toe');
      return;
    }

    const success = await resolveHITL(itemId, status, adminResponse);
    if (success) {
      toast.success(`Item ${status === 'approved' ? 'goedgekeurd' : status === 'rejected' ? 'afgewezen' : 'overschreven'}`);
      setSelectedItem(null);
      setAdminResponse('');
      loadItems();
    } else {
      toast.error('Fout bij opslaan');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'crisis':
        return '🚨';
      case 'td_critical':
        return '⚖️';
      case 'ngbse_blindspot':
        return '🔍';
      case 'low_confidence':
        return '❓';
      case 'repeated_failure':
        return '🔧';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>HITL Queue laden...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🚨 HITL Review Queue</CardTitle>
          <CardDescription>
            {items.length} items wachten op menselijke review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Geen items in de queue - alle systemen operationeel!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTriggerIcon(item.trigger_type)}</span>
                          <Badge variant={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.trigger_type}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{item.reason}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          User: {item.user_input.slice(0, 100)}...
                        </p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>
              {getTriggerIcon(selectedItem.trigger_type)} {selectedItem.trigger_type} -{' '}
              <Badge variant={getSeverityColor(selectedItem.severity)}>
                {selectedItem.severity}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Reason:</h4>
              <p className="text-sm">{selectedItem.reason}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">User Input:</h4>
              <p className="text-sm p-3 bg-muted rounded-md">{selectedItem.user_input}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">AI Response:</h4>
              <p className="text-sm p-3 bg-muted rounded-md">{selectedItem.ai_response}</p>
            </div>

            {selectedItem.context && Object.keys(selectedItem.context).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Context:</h4>
                <pre className="text-xs p-3 bg-muted rounded-md overflow-auto max-h-40">
                  {JSON.stringify(selectedItem.context, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Admin Response:</h4>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Voeg je review toe..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleResolve(selectedItem.id, 'approved')}
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Goedkeuren
              </Button>
              <Button
                onClick={() => handleResolve(selectedItem.id, 'override')}
                variant="secondary"
              >
                Override
              </Button>
              <Button
                onClick={() => handleResolve(selectedItem.id, 'rejected')}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Afwijzen
              </Button>
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setAdminResponse('');
                }}
                variant="outline"
              >
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
