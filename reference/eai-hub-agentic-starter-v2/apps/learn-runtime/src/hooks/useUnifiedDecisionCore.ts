
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateEmbedding } from '../lib/embeddingUtils';
import { EmotionDetection } from './useOpenAI';
import { ChatHistoryItem } from '../types';
import { useBrowserTransformerEngine } from './useBrowserTransformerEngine';
import { toast } from 'sonner';

export interface UnifiedKnowledgeItem {
  id: string;
  content_type: 'seed' | 'embedding' | 'pattern' | 'insight';
  emotion: string;
  triggers?: string[];
  response_text?: string;
  confidence_score: number;
  similarity_score?: number;
  metadata: Record<string, any>;
}

export interface DecisionResult {
  emotion: string;
  response: string;
  confidence: number;
  reasoning: string;
  sources: UnifiedKnowledgeItem[];
  label: "Valideren" | "Reflectievraag" | "Suggestie";
  symbolicInferences: string[];
  meta: string;
  fusionReady?: boolean;
  seedCore?: {
    therapeuticIntent: string;
    preserveStructure: boolean;
    originalSeed?: string;
  };
}

export function useUnifiedDecisionCore() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [knowledgeStats, setKnowledgeStats] = useState({
    total: 0,
    seeds: 0,
    embeddings: 0,
    patterns: 0,
    insights: 0
  });

  // 🧠 Neurosymbolisch: Browser Transformer Engine voor snelle emotion pre-detection
  const { detectEmotionInBrowser } = useBrowserTransformerEngine();

  useEffect(() => {
    console.log('🚀 UnifiedDecisionCore v2.0 initializing...');
    loadKnowledgeStats();
  }, []);

  const loadKnowledgeStats = async () => {
    try {
      console.log('📊 Loading unified knowledge stats...');
      
      const { data, error } = await supabase
        .from('unified_knowledge')
        .select('content_type, active')
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .eq('active', true);

      if (error) {
        console.error('❌ Failed to load knowledge stats:', error);
        return;
      }

      const stats = data.reduce((acc, item) => {
        acc.total++;
        if (item.content_type === 'seed') acc.seeds++;
        else if (item.content_type === 'embedding') acc.embeddings++;
        else if (item.content_type === 'pattern') acc.patterns++;
        else if (item.content_type === 'insight') acc.insights++;
        return acc;
      }, { total: 0, seeds: 0, embeddings: 0, patterns: 0, insights: 0 });

      console.log('📊 Knowledge stats loaded:', stats);
      setKnowledgeStats(stats);
    } catch (error) {
      console.error('🔴 Error loading knowledge stats:', error);
    }
  };

  const autoConsolidateIfNeeded = async (): Promise<boolean> => {
    try {
      if (knowledgeStats.total === 0) {
        console.log('🔄 No unified knowledge found, attempting auto-consolidation...');
        
        const { data: legacySeeds, error: seedError } = await supabase
          .from('emotion_seeds')
          .select('id')
          .eq('active', true)
          .limit(1);

        if (seedError) {
          console.error('❌ Error checking legacy seeds:', seedError);
          return false;
        }

        if (legacySeeds && legacySeeds.length > 0) {
          console.log('🚀 Found legacy seeds, triggering consolidation...');
          const success = await consolidateKnowledge();
          if (success) {
            await loadKnowledgeStats();
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('🔴 Auto-consolidation error:', error);
      return false;
    }
  };

  const searchUnifiedKnowledge = async (
    query: string,
    vectorApiKey?: string,
    maxResults: number = 10
  ): Promise<UnifiedKnowledgeItem[]> => {
    try {
      console.log('🔍 Searching unified knowledge v2.0 for:', query.substring(0, 50));
      
      await autoConsolidateIfNeeded();
      
      // 🆕 FASE 5: Verbeterd error handling voor embedding generatie
      let queryEmbedding: number[] | null = null;
      if (vectorApiKey?.trim()) {
        try {
          queryEmbedding = await generateEmbedding(query);
          console.log('✅ Query embedding generated successfully');
        } catch (error) {
          console.warn('⚠️ Failed to generate embedding, continuing with text search only');
          console.error('   Embedding error details:', error instanceof Error ? error.message : error);
          toast.warning('Vector zoeken niet beschikbaar', {
            description: 'Gebruikt alleen tekst-matching voor zoekresultaten'
          });
        }
      }

      // 🆕 FASE 2 FIX: Lower threshold from 0.7 to 0.3 for more matches
      const { data, error } = await supabase.rpc('search_unified_knowledge', {
        query_text: query,
        query_embedding: queryEmbedding ? `[${queryEmbedding.join(',')}]` : null,
        similarity_threshold: 0.3,
        max_results: 20
      });

      if (error) {
        console.error('❌ Unified knowledge search error:', error);
        toast.error('Knowledge base zoeken mislukt', {
          description: `Database error: ${error.message}. Probeer het opnieuw.`
        });
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} unified knowledge items`);
      return (data || []).map((item: any) => ({
        id: item.id,
        content_type: item.content_type,
        emotion: item.emotion,
        triggers: item.metadata?.triggers || [],
        response_text: item.response_text,
        confidence_score: item.confidence_score,
        similarity_score: item.similarity_score,
        metadata: item.metadata || {}
      }));

    } catch (error) {
      console.error('🔴 Unified knowledge search failed:', error);
      return [];
    }
  };

  const makeUnifiedDecision = async (
    input: string,
    apiKey?: string,
    vectorApiKey?: string,
    strategicBriefing?: any,
    history?: ChatHistoryItem[]
  ): Promise<DecisionResult | null> => {
    // Support legacy context parameter structure
    const context = strategicBriefing && typeof strategicBriefing === 'object' && 'dislikedLabel' in strategicBriefing 
      ? strategicBriefing 
      : undefined;
    console.log('🧠 makeUnifiedDecision v3.0 NEUROSYMBOLISCH called with input:', input.substring(0, 50) + '...');
    console.log('🔑 API keys provided - primary:', !!apiKey, 'vector:', !!vectorApiKey);
    
    if (!input?.trim()) {
      console.log('❌ Empty input provided to makeUnifiedDecision');
      return null;
    }

    setIsProcessing(true);
    console.log('🧠 Unified Decision Core v3.0 NEUROSYMBOLISCH processing:', input.substring(0, 50));

    try {
      // 🚀 NEUROSYMBOLISCH STAP 1: Browser Transformer Engine voor snelle emotion pre-detection
      let browserEmotion: string | null = null;
      let browserConfidence = 0;
      
      try {
        console.log('🧠 Browser ML Engine: Pre-detecting emotion...');
        const browserResult = await detectEmotionInBrowser(input, 'nl');
        
        if (browserResult?.ok && browserResult.result?.emotion) {
          browserEmotion = browserResult.result.emotion;
          browserConfidence = browserResult.result.confidence || 0.7;
          console.log(`✅ Browser ML Engine detected: ${browserEmotion} (${Math.round(browserConfidence * 100)}%)`);
        }
      } catch (browserErr) {
        console.warn('⚠️ Browser ML Engine pre-detection failed (niet kritiek):', browserErr);
      }

      // 🚀 NEUROSYMBOLISCH STAP 2: Symbolic search met Browser ML-enhanced query
      const enhancedQuery = browserEmotion ? `${browserEmotion} ${input}` : input;
      console.log('🔍 Enhanced search query:', enhancedQuery.substring(0, 80));
      
      const knowledgeItems = await searchUnifiedKnowledge(enhancedQuery, vectorApiKey, 15);
      
      // ✅ LAYER 2 FIX: Filter seeds by context BEFORE ranking
      const contextFilteredItems = filterSeedsByContext(
        knowledgeItems,
        input,
        history?.length || 0
      );
      
      // 🚀 NEUROSYMBOLISCH STAP 3: Ranking met Browser ML emotion boost
      const rankedSources = rankKnowledgeSources(
        contextFilteredItems, 
        input, 
        context,
        browserEmotion
      );
      
      // 🚀 NEUROSYMBOLISCH STAP 4: Decision generation (met strategic briefing)
      const decision = await generateUnifiedDecision(input, rankedSources, context, history, browserEmotion, strategicBriefing);

      // 🆕 CRITICAL FIX: Update usage_count en last_used voor gebruikte seeds
      if (decision && rankedSources.length > 0) {
        try {
          for (const source of rankedSources.slice(0, 3)) {
            await supabase
              .from('unified_knowledge')
              .update({
                usage_count: (source.metadata?.usageCount || 0) + 1,
                last_used: new Date().toISOString()
              })
              .eq('id', source.id);
          }
          console.log(`✅ Updated usage_count for ${rankedSources.slice(0, 3).length} seeds`);
        } catch (usageError) {
          console.warn('⚠️ Failed to update usage_count:', usageError);
        }
      }

      // Log decision with v3.0 metadata
      await logUnifiedDecision(input, rankedSources, decision, {
        version: '3.0'
      });

      console.log('✅ Unified decision v2.0 complete:', decision?.emotion);
      return decision;

    } catch (error) {
      console.error('🔴 Unified decision core v2.0 error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * ✅ LAYER 2 FIX: Context-aware seed filtering
   */
  const filterSeedsByContext = (
    seeds: UnifiedKnowledgeItem[],
    userInput: string,
    conversationLength: number
  ): UnifiedKnowledgeItem[] => {
    const isGreeting = /^(hi|hallo|hey|hoi|dag)/i.test(userInput.trim());
    const isFirstMessage = conversationLength === 0;
    
    if (isGreeting && isFirstMessage) {
      // Filter out reflective seeds for simple greetings
      const filtered = seeds.filter(s => {
        const response = s.response_text || '';
        const isReflective = /wat zou er gebeuren|hoe zou het zijn|denk eens na|zou je|als je/i.test(response);
        if (isReflective) {
          console.log(`⚠️ Filtered reflective seed for greeting: ${s.emotion}`);
        }
        return !isReflective;
      });
      console.log(`✅ Context filter: ${seeds.length} → ${filtered.length} seeds (removed reflective for greeting)`);
      return filtered;
    }
    
    return seeds;
  };

  const rankKnowledgeSources = (
    sources: UnifiedKnowledgeItem[],
    input: string,
    context?: any,
    browserEmotion?: string | null
  ): UnifiedKnowledgeItem[] => {
    return sources
      .map(source => {
        let score = source.confidence_score || 0;
        
        // 🧠 NEUROSYMBOLISCH: Boost als Browser ML Engine dezelfde emotie detecteerde
        if (browserEmotion && source.emotion.toLowerCase().includes(browserEmotion.toLowerCase())) {
          score += 0.4;
          console.log(`🚀 Browser ML boost for ${source.emotion}: +0.4`);
        }
        
        if (source.emotion && input.toLowerCase().includes(source.emotion.toLowerCase())) {
          score += 0.3;
        }
        
        if (source.triggers?.some(trigger => 
          input.toLowerCase().includes(trigger.toLowerCase())
        )) {
          score += 0.2;
        }
        
        if (source.similarity_score) {
          score += source.similarity_score * 0.3;
        }
        
        const usageCount = source.metadata?.usageCount || 0;
        score += Math.min(usageCount * 0.01, 0.1);
        
        if (context?.dislikedLabel && source.metadata?.label === context.dislikedLabel) {
          score *= 0.3;
        }
        
        // 🚨 CRITICAL FIX: Cap confidence at 100% (1.0)
        score = Math.min(score, 1.0);
        
        return { ...source, confidence_score: score };
      })
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 5);
  };

  const generateUnifiedDecision = async (
    input: string,
    sources: UnifiedKnowledgeItem[],
    context?: any,
    history?: ChatHistoryItem[],
    browserEmotion?: string | null,
    strategicBriefing?: any
  ): Promise<DecisionResult | null> => {
    if (sources.length === 0) {
      return null;
    }

    const bestSource = sources[0];
    const otherSources = sources.slice(1, 3);

    let label: "Valideren" | "Reflectievraag" | "Suggestie" = "Valideren";
    let responseType = bestSource.metadata?.type || 'validation';
    
    if (context?.dislikedLabel) {
      if (context.dislikedLabel === "Valideren") label = "Reflectievraag";
      else if (context.dislikedLabel === "Reflectievraag") label = "Suggestie";
      else label = "Valideren";
    } else {
      switch (responseType) {
        case 'reflection': label = "Reflectievraag"; break;
        case 'suggestion': label = "Suggestie"; break;
        default: label = "Valideren"; break;
      }
    }

    const reasoning = [
      `Hoofdbron: ${bestSource.emotion} (vertrouwen: ${Math.round(bestSource.confidence_score * 100)}%)`,
      otherSources.length > 0 ? `Ondersteunende bronnen: ${otherSources.map(s => s.emotion).join(', ')}` : '',
      `Type response: ${label} gebaseerd op ${responseType}`,
      context?.dislikedLabel ? `Vermeden label: ${context.dislikedLabel}` : ''
    ].filter(Boolean).join('. ');

    const symbolicInferences = [
      `🧠 NEUROSYMBOLISCH v3.0`,
      browserEmotion ? `🧠 Browser ML Engine: ${browserEmotion}` : null,
      `🎯 Hoofdemotie: ${bestSource.emotion}`,
      `📊 Vertrouwen: ${Math.round(bestSource.confidence_score * 100)}%`,
      `🔗 Bronnen: ${sources.length} gevonden`,
      `💡 Type: ${label}`,
      ...sources.slice(0, 2).map(s => `• ${s.emotion} (${Math.round(s.confidence_score * 100)}%)`)
    ].filter(Boolean) as string[];

    return {
      emotion: bestSource.emotion,
      response: bestSource.response_text || 'Ik begrijp hoe je je voelt.',
      confidence: bestSource.confidence_score,
      reasoning,
      sources,
      label,
      symbolicInferences,
      meta: `🧠 Neurosymbolisch v3.0: ${sources.length} bronnen${browserEmotion ? ` + Browser ML(${browserEmotion})` : ''}`,
      fusionReady: true, // Signal dat dit seed klaar is voor fusion
      seedCore: {
        therapeuticIntent: bestSource.metadata?.therapeuticIntent || responseType,
        preserveStructure: true,
        originalSeed: bestSource.response_text
      }
    };
  };

  const logUnifiedDecision = async (
    input: string,
    sources: UnifiedKnowledgeItem[],
    decision: DecisionResult | null,
    metadata: { googleApiUsed?: boolean; version?: string; v20Metadata?: any } = {}
  ) => {
    try {
      // 🆕 V3.0: Use new log_unified_decision_v3 RPC for simplified, reliable logging
      const sessionId = sessionStorage.getItem('evai-current-session-id') || 'unified-decision-' + Date.now();
      
      const sourcesJson = sources.map(s => ({
        id: s.id,
        emotion: s.emotion,
        confidence: s.confidence_score,
        content_type: s.content_type,
        similarity: s.similarity_score || 0
      }));

      const apiCollaboration = {
        api1Used: true,
        api2Used: false,
        vectorApiUsed: sources.some(s => s.similarity_score),
        googleApiUsed: metadata.googleApiUsed || false,
        seedGenerated: false,
        secondaryAnalysis: false
      };

      // Call new v3.0 RPC function with v20 metadata
      const { data: logId, error } = await supabase.rpc('log_unified_decision_v3', {
        p_user_input: input,
        p_emotion: decision?.emotion || 'no-match',
        p_response: decision?.response || '[NO MATCH FOUND]',
        p_confidence: decision?.confidence || 0,
        p_label: decision?.label || 'Fout',
        p_sources: sourcesJson,
        p_conversation_id: sessionId,
        p_processing_time_ms: 0,
        p_api_collaboration: apiCollaboration,
        p_eaa_profile: metadata.v20Metadata?.eaaProfile || {},
        p_td_matrix: metadata.v20Metadata?.tdMatrix || {},
        p_eai_rules: metadata.v20Metadata?.eaiRules || {},
        p_regisseur_briefing: metadata.v20Metadata?.regisseurBriefing || {},
        p_fusion_metadata: metadata.v20Metadata?.fusionMetadata || {},
        p_safety_check: metadata.v20Metadata?.safetyCheck || {},
        p_rubrics_analysis: metadata.v20Metadata?.rubricsAnalysis || {}
      });

      if (error) {
        console.error('❌ Failed to log decision via RPC:', error);
        toast.error('Logging gefaald', {
          description: 'Decision werd niet opgeslagen in database'
        });
        return;
      }

      console.log('✅ Decision logged successfully via v3.0 RPC:', logId);
      console.log(`   Sources: ${sources.length}, Emotion: ${decision?.emotion || 'no-match'}`);
    } catch (error) {
      console.error('❌ Failed to log unified decision:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
      }
      toast.error('Logging gefaald', {
        description: 'Decision werd niet opgeslagen in database'
      });
    }
  };

  const consolidateKnowledge = async (): Promise<boolean> => {
    try {
      console.log('🔄 Starting knowledge consolidation v2.0...');
      
      const { error } = await supabase.rpc('consolidate_knowledge');
      
      if (error) {
        console.error('❌ Knowledge consolidation failed:', error);
        return false;
      }
      
      console.log('✅ Knowledge consolidation v2.0 completed');
      await loadKnowledgeStats();
      return true;
    } catch (error) {
      console.error('🔴 Knowledge consolidation error:', error);
      return false;
    }
  };

  return {
    makeUnifiedDecision,
    searchUnifiedKnowledge,
    consolidateKnowledge,
    loadKnowledgeStats,
    knowledgeStats,
    isProcessing
  };
}
