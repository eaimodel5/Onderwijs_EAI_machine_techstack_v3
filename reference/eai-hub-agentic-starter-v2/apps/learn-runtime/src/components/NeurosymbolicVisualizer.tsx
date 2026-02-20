
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Database, GitBranch } from 'lucide-react';
import { NeurosymbolicData } from '@/types/neurosymbolic';

interface NeurosymbolicVisualizerProps {
  data?: NeurosymbolicData;
  isProcessing: boolean;
}

const NeurosymbolicVisualizer: React.FC<NeurosymbolicVisualizerProps> = ({ 
  data, 
  isProcessing 
}) => {
  if (!data && !isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Neurosymbolische Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Geen data beschikbaar. Start een conversatie om de analyse te zien.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Processing Indicator */}
      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Neurosymbolische analyse in uitvoering...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Symbolic Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                Symbolische Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.symbolicMatches.length > 0 ? (
                <div className="space-y-3">
                  {data.symbolicMatches.map((match, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{match.source}</Badge>
                        <span className="text-sm font-medium">
                          {Math.round(match.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{match.pattern}</p>
                      <Progress value={match.confidence * 100} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Geen symbolische matches gevonden
                </p>
              )}
            </CardContent>
          </Card>

          {/* Neural Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                Neurale Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Emotie:</span>
                  <Badge>{data.neuralAnalysis.emotion}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vertrouwen:</span>
                  <span className="text-sm">{Math.round(data.neuralAnalysis.confidence * 100)}%</span>
                </div>
                <Progress value={data.neuralAnalysis.confidence * 100} className="h-1" />
                <div>
                  <span className="text-sm font-medium">Redenering:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.neuralAnalysis.reasoning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hybrid Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <GitBranch className="h-4 w-4" />
                Hybride Beslissing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Finale Emotie:</span>
                  <Badge variant="default">{data.hybridDecision.finalEmotion}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vertrouwen:</span>
                  <span className="text-sm font-bold">
                    {Math.round(data.hybridDecision.confidence * 100)}%
                  </span>
                </div>
                <Progress value={data.hybridDecision.confidence * 100} className="h-2" />
                <div>
                  <span className="text-sm font-medium">Verwerkingspad:</span>
                  <Badge variant="secondary" className="ml-2">
                    {data.hybridDecision.processingPath}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Gebruikte Componenten:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {data.hybridDecision.componentsUsed}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Verwerkingstijd:</span>
                  <span className="text-sm ml-2">{data.hybridDecision.processingTime}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NeurosymbolicVisualizer;
