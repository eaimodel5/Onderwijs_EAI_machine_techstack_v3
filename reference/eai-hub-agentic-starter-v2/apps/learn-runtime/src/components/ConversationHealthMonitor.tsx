import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Activity } from 'lucide-react';
import { useState } from 'react';
import { useProcessingOrchestrator } from '@/hooks/useProcessingOrchestrator';
import { useBrowserTransformerEngine } from '@/hooks/useBrowserTransformerEngine';
import { ContextualHelp } from './ContextualHelp';

export function ConversationHealthMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const { stats, knowledgeStats } = useProcessingOrchestrator();
  const { device, modelLoaded } = useBrowserTransformerEngine();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-l-4 border-l-primary bg-card">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-accent/50 transition-colors text-card-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Systeem Status</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 px-3 pb-3 space-y-2 text-card-foreground">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                Browser ML
                <ContextualHelp term="self-learning" className="ml-1" />
              </span>
              <Badge variant={modelLoaded ? 'default' : 'secondary'}>
                {modelLoaded ? `${device}` : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                Knowledge Base
                <ContextualHelp term="self-learning" className="ml-1" />
              </span>
              <Badge variant={knowledgeStats.total > 0 ? 'default' : 'secondary'}>
                {knowledgeStats.total} items
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span>Response Rate</span>
              <Badge variant={stats.successRate > 80 ? 'default' : 'destructive'}>
                {Math.round(stats.successRate)}%
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span>Avg Response Time</span>
              <Badge variant="outline">
                {Math.round(stats.averageProcessingTime)}ms
              </Badge>
            </div>
            
            {stats.lastError && (
              <div className="text-xs text-destructive-foreground p-2 bg-destructive/10 rounded border border-destructive/20">
                ⚠️ {stats.lastError}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
