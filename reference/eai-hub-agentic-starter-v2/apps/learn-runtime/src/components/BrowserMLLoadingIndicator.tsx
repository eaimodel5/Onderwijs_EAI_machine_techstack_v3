/**
 * Browser ML Loading Indicator
 * Shows loading state when ML model is being downloaded/initialized
 */

import { useEffect } from 'react';
import { Brain, CheckCircle2 } from 'lucide-react';
import { useBrowserTransformerEngine } from '@/hooks/useBrowserTransformerEngine';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function BrowserMLLoadingIndicator() {
  const { isModelLoading, loadingProgress, device, modelLoaded } = useBrowserTransformerEngine();

  // Show toast on first load
  useEffect(() => {
    if (isModelLoading && loadingProgress === 0) {
      toast.info('🧠 ML model wordt geladen...', {
        description: '~120MB download, daarna permanent beschikbaar offline',
        duration: 10000,
      });
    }
  }, [isModelLoading, loadingProgress]);

  // Show success toast when model is ready
  useEffect(() => {
    if (modelLoaded && !isModelLoading && loadingProgress === 100) {
      toast.success('✅ ML model klaar!', {
        description: `Werkt nu offline met ${device === 'webgpu' ? 'WebGPU (GPU)' : 'WASM (CPU)'}`,
        duration: 5000,
      });
    }
  }, [modelLoaded, isModelLoading, loadingProgress, device]);

  // Don't render if model is already loaded and not loading
  if (modelLoaded && !isModelLoading) {
    return (
      <Badge variant="outline" className="gap-1.5 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[hsl(var(--border))]">
        <CheckCircle2 className="h-3 w-3" />
        ML: {device === 'webgpu' ? 'GPU' : 'CPU'}
      </Badge>
    );
  }

  // Show loading state
  if (isModelLoading) {
    return (
      <Badge variant="outline" className="gap-1.5 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[hsl(var(--border))] animate-pulse">
        <Brain className="h-3 w-3 animate-pulse" />
        Loading ML {loadingProgress > 0 && `${loadingProgress}%`}
      </Badge>
    );
  }

  return null;
}
