
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Brain, Database, Search, Zap, CheckCircle, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUnifiedDecisionCore, UnifiedKnowledgeItem } from '../../hooks/useUnifiedDecisionCore';

const UnifiedKnowledgeManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedKnowledgeItem[]>([]);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [autoConsolidated, setAutoConsolidated] = useState(false);

  const { 
    searchUnifiedKnowledge, 
    consolidateKnowledge, 
    loadKnowledgeStats,
    knowledgeStats,
    isProcessing 
  } = useUnifiedDecisionCore();

  useEffect(() => {
    loadKnowledgeStats();
  }, [loadKnowledgeStats]);

  // Auto-trigger consolidation if no knowledge exists
  useEffect(() => {
    if (knowledgeStats.total === 0 && !autoConsolidated) {
      handleAutoConsolidation();
    }
  }, [knowledgeStats, autoConsolidated]);

  const handleAutoConsolidation = async () => {
    try {
      console.log('🔄 Auto-triggering knowledge consolidation...');
      setIsConsolidating(true);
      
      const success = await consolidateKnowledge();
      
      if (success) {
        setAutoConsolidated(true);
        toast({
          title: "Automatic Consolidation Complete",
          description: "Legacy seeds and embeddings have been migrated to unified knowledge.",
        });
      }
    } catch (error) {
      console.error('Auto-consolidation failed:', error);
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleConsolidateKnowledge = async () => {
    setIsConsolidating(true);
    
    try {
      const success = await consolidateKnowledge();
      
      if (success) {
        toast({
          title: "Knowledge Consolidation Complete",
          description: "All knowledge sources have been unified successfully.",
        });
      } else {
        throw new Error('Consolidation failed');
      }
    } catch (error) {
      toast({
        title: "Consolidation Failed",
        description: "Failed to consolidate knowledge sources.",
        variant: "destructive"
      });
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    
    try {
      // searchUnifiedKnowledge uses server-side Edge Functions for embeddings
      const results = await searchUnifiedKnowledge(searchTerm, undefined, 20);
      setSearchResults(results);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} knowledge items via server-side search.`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search unified knowledge.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'seed': return 'bg-green-100 text-green-800';
      case 'embedding': return 'bg-blue-100 text-blue-800';
      case 'pattern': return 'bg-purple-100 text-purple-800';
      case 'insight': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'seed': return '🌱';
      case 'embedding': return '🧠';
      case 'pattern': return '🔗';
      case 'insight': return '💡';
      default: return '📄';
    }
  };

  const isSystemActive = knowledgeStats.total > 0;

  return (
    <div className="space-y-6">
      <Card className={`${isSystemActive ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className={`h-5 w-5 ${isSystemActive ? 'text-indigo-600' : 'text-orange-600'}`} />
            Unified Knowledge Manager
            <Badge variant="secondary" className={`${isSystemActive ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}>
              Decision Core v6.0
            </Badge>
            {isSystemActive && <Badge className="bg-green-100 text-green-800">Active</Badge>}
          </CardTitle>
          <CardDescription>
            Centralized knowledge management voor de nieuwe Unified Decision Core
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Knowledge Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`text-center p-4 rounded-lg border ${isSystemActive ? 'bg-white/60 border-indigo-100' : 'bg-white/60 border-yellow-100'}`}>
              <div className={`text-2xl font-bold ${isSystemActive ? 'text-indigo-600' : 'text-orange-600'}`}>
                {knowledgeStats.total}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Totaal
                {isSystemActive && <TrendingUp className="h-3 w-3 text-green-500" />}
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">{knowledgeStats.seeds}</div>
              <div className="text-sm text-gray-600">Seeds</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{knowledgeStats.embeddings}</div>
              <div className="text-sm text-gray-600">Embeddings</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">{knowledgeStats.patterns}</div>
              <div className="text-sm text-gray-600">Patterns</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">{knowledgeStats.insights}</div>
              <div className="text-sm text-gray-600">Insights</div>
            </div>
          </div>

          {/* Status Alert */}
          {!isSystemActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Knowledge Base is Empty</p>
                  <p>
                    Het systeem detecteerde geen unified knowledge. Auto-consolidatie wordt gestart om 
                    bestaande seeds en embeddings te migreren.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consolidation Control */}
          <div className={`rounded-lg p-4 border ${isSystemActive ? 'bg-white/70 border-indigo-100' : 'bg-white/70 border-yellow-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h4 className="font-medium text-gray-800">Knowledge Consolidation</h4>
                <p className="text-sm text-gray-600">
                  Migreer bestaande seeds en embeddings naar de unified knowledge base
                </p>
              </div>
              <Button 
                onClick={handleConsolidateKnowledge}
                disabled={isConsolidating || isProcessing}
                className="flex items-center gap-2"
              >
                {isConsolidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Consolidating...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Consolidate Knowledge
                  </>
                )}
              </Button>
            </div>
            
            {isConsolidating && (
              <div className="space-y-2">
                <Progress value={66} className="w-full" />
                <p className="text-sm text-blue-600">Migratie bezig... Dit kan even duren.</p>
              </div>
            )}
          </div>

          {/* Knowledge Search */}
          <div className={`rounded-lg p-4 border ${isSystemActive ? 'bg-white/70 border-indigo-100' : 'bg-white/70 border-gray-100'}`}>
            <h4 className="font-medium text-gray-800 mb-3">Knowledge Search</h4>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Zoek in unified knowledge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                disabled={!isSystemActive}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim() || !isSystemActive}
                variant="outline"
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <div key={index} className="p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getContentTypeIcon(item.content_type)}</span>
                        <Badge className={getContentTypeColor(item.content_type)}>
                          {item.content_type}
                        </Badge>
                        <span className="font-medium text-gray-900">{item.emotion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {Math.round(item.confidence_score * 100)}%
                        </span>
                        {item.similarity_score && (
                          <span className="text-sm text-blue-600">
                            {Math.round(item.similarity_score * 100)}% sim
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.response_text || 'No response text available'}
                    </p>
                    {item.triggers && item.triggers.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {item.triggers.slice(0, 3).map((trigger, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                          {item.triggers.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.triggers.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Status */}
          <div className={`${isSystemActive ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} border rounded-lg p-4`}>
            <div className="flex items-start gap-2">
              {isSystemActive ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              <div className={`text-sm ${isSystemActive ? 'text-green-800' : 'text-blue-800'}`}>
                <p className="font-medium mb-1">
                  {isSystemActive ? 'Unified Decision Core Status' : 'System Initializing'}
                </p>
                <p>
                  {isSystemActive 
                    ? 'Het systeem is succesvol geïntegreerd en alle knowledge sources zijn gecentraliseerd voor optimale decision-making performance.'
                    : 'Het systeem wordt geïnitialiseerd. Knowledge consolidatie is bezig om bestaande data te migreren naar de unified knowledge base.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedKnowledgeManager;
