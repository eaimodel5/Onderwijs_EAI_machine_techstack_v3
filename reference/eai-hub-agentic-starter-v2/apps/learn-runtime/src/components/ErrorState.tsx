import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, className = '' }) => {
  return (
    <Alert variant="destructive" className={`animate-fade-slide-in glass-strong border-destructive/30 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1">
          <AlertTitle className="text-destructive font-semibold mb-1">Er ging iets mis</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="flex-1 text-foreground/80">{error}</span>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="flex-shrink-0 glass hover:glass-strong border-border/30 transition-all duration-300 group"
              >
                <RefreshCw className="h-3 w-3 mr-1 group-hover:rotate-180 transition-transform duration-500" />
                Opnieuw
              </Button>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
