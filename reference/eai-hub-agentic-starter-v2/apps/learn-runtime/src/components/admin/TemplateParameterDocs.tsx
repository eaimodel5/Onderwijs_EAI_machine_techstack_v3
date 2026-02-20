/**
 * Template Parameter Documentation Component
 * Displays available template parameters for seed responses
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TEMPLATE_PARAMETERS, generateExampleResponse } from '@/lib/templateParameterDocs';
import { Code, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function TemplateParameterDocs() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Template Parameters</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Gebruik deze parameters in seed responses voor dynamische context substitutie
          </p>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(TEMPLATE_PARAMETERS).map(([key, param]) => (
              <div key={key} className="space-y-3 pb-6 border-b last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                        {`{${key}}`}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        Fallback: "{param.fallback}"
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {param.description}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Voorbeelden:</p>
                  <ul className="space-y-1">
                    {param.examples.map((example, i) => (
                      <li key={i} className="text-sm pl-4 border-l-2 border-primary/20">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-sm">Voorbeeld Gebruik</h4>
          </div>
          
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Template:</p>
            <code className="text-xs block p-2 bg-background rounded border">
              {generateExampleResponse()}
            </code>
          </div>

          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Na compilatie:</p>
            <code className="text-xs block p-2 bg-background rounded border">
              Het is begrijpelijk dat je je zo voelt deze ochtend. Op het werk kan het soms 
              moeilijk maken om met deze emoties om te gaan. Recent heb je gemerkt dat de 
              deadline je beïnvloedt.
            </code>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Waarom Template Parameters?
              </p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• Voorkomt overspecifieke responses ("na een goede nachtrust")</li>
                <li>• Maakt seeds herbruikbaar in verschillende contexten</li>
                <li>• Context wordt dynamisch uit user input gehaald</li>
                <li>• Verhoogt relevantie zonder hardcoded aannames</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}