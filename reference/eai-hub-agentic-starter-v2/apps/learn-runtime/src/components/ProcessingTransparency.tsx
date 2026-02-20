import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ContextualHelp } from './ContextualHelp';

interface ProcessingTransparencyProps {
  meta?: {
    processingPath?: string;
    componentsUsed?: string[];
  };
  explainText?: string;
  className?: string;
}

export const ProcessingTransparency: React.FC<ProcessingTransparencyProps> = ({ 
  meta, 
  explainText, 
  className = '' 
}) => {
  if (!meta?.processingPath && !meta?.componentsUsed && !explainText) {
    return null;
  }

  return (
    <div className={`text-xs text-muted-foreground space-y-2 ${className}`}>
      {meta?.processingPath && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Processing Path:</span>
          <Badge variant="outline" className="text-xs">
            {meta.processingPath}
          </Badge>
        </div>
      )}
      
      {meta?.componentsUsed && meta.componentsUsed.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="font-medium flex items-center gap-1">
            Componenten:
            <ContextualHelp term="eaa" />
          </span>
          <div className="flex flex-wrap gap-1">
            {meta.componentsUsed.map((comp, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {comp}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {explainText && (
        <div className="text-xs border-l-2 border-primary/30 pl-3 py-2 bg-muted/30 rounded-r animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          <span className="font-medium text-foreground">Redenering:</span>
          <p className="mt-1 text-muted-foreground leading-relaxed">{explainText}</p>
        </div>
      )}
    </div>
  );
};
