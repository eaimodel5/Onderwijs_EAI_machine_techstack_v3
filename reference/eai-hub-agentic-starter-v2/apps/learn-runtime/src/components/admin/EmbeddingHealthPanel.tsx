/**
 * EmbeddingHealthPanel
 * 
 * Admin UI component for monitoring and managing embedding health
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import { useEmbeddingHealth } from '@/hooks/useEmbeddingHealth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function EmbeddingHealthPanel() {
  const { health, isLoading, isProcessing, progress, loadHealth, processAllMissing } = useEmbeddingHealth();

  if (isLoading && !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Embedding Health
          </CardTitle>
          <CardDescription>Loading status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Embedding Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load health status</AlertTitle>
            <AlertDescription>
              Unable to fetch embedding statistics. Check console for errors.
            </AlertDescription>
          </Alert>
          <Button onClick={loadHealth} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCritical = health.coverage < 50;
  const isWarning = health.coverage >= 50 && health.coverage < 90;
  const isHealthy = health.coverage >= 90;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isHealthy && <CheckCircle className="h-5 w-5 text-green-500" />}
          {isWarning && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          {isCritical && <AlertCircle className="h-5 w-5 text-red-500" />}
          Embedding Health Monitor
        </CardTitle>
        <CardDescription>
          Vector embeddings coverage for neurosymbolic search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Coverage</span>
            <Badge variant={isHealthy ? "default" : isWarning ? "secondary" : "destructive"}>
              {health.coverage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={health.coverage} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{health.embedded} embedded</span>
            <span>{health.missing} missing</span>
            <span>{health.total} total</span>
          </div>
        </div>

        {/* Breakdown by Type */}
        {Object.keys(health.byType).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Missing by Type</h4>
            <div className="space-y-1">
              {Object.entries(health.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing...</span>
              <Badge variant="secondary">
                Batch {progress.currentBatch}/{progress.totalBatches}
              </Badge>
            </div>
            <Progress 
              value={(progress.processed / progress.total) * 100} 
              className="h-2" 
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.successful} successful</span>
              <span>{progress.failed} failed</span>
              <span>{progress.processed}/{progress.total}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={processAllMissing}
            disabled={isProcessing || health.missing === 0}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Missing ({health.missing})
              </>
            )}
          </Button>
          <Button
            onClick={loadHealth}
            variant="outline"
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Health Alerts */}
        {health.missing > 0 && (
          <Alert variant={isCritical ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isCritical ? 'Critical: Low Coverage' : 'Warning: Missing Embeddings'}
            </AlertTitle>
            <AlertDescription>
              {isCritical && (
                <>
                  Only {health.coverage.toFixed(1)}% of items have embeddings. 
                  Vector search is severely limited. Process missing embeddings immediately.
                </>
              )}
              {isWarning && (
                <>
                  {health.coverage.toFixed(1)}% coverage. 
                  Generate missing embeddings to improve search accuracy.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isHealthy && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Healthy</AlertTitle>
            <AlertDescription>
              Embedding coverage is excellent ({health.coverage.toFixed(1)}%). 
              Vector search is operating at full capacity.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
