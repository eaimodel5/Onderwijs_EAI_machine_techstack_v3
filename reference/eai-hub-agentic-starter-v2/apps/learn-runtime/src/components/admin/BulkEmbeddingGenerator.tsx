import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';

export function BulkEmbeddingGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
  });

  const generateAllEmbeddings = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Fetch all seeds without embeddings from unified_knowledge
      const { data: seedsWithoutEmbeddings, error: fetchError } = await supabase
        .from('unified_knowledge')
        .select('id, emotion, response_text, triggers')
        .eq('content_type', 'seed')
        .eq('active', true)
        .is('vector_embedding', null);

      if (fetchError) {
        console.error('❌ Failed to fetch seeds:', fetchError);
        toast.error('Failed to fetch seeds without embeddings');
        return;
      }

      if (!seedsWithoutEmbeddings || seedsWithoutEmbeddings.length === 0) {
        toast.success('All seeds already have embeddings! 🎉');
        return;
      }

      const total = seedsWithoutEmbeddings.length;
      console.log(`🚀 Starting bulk embedding generation for ${total} seeds`);
      
      setStats({ total, processed: 0, success: 0, failed: 0 });
      
      let success = 0;
      let failed = 0;

      // Process in batches of 5 to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < seedsWithoutEmbeddings.length; i += batchSize) {
        const batch = seedsWithoutEmbeddings.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (seed) => {
            try {
              // Generate text for embedding (combine emotion + response + triggers)
              const text = [
                seed.emotion,
                seed.response_text,
                ...(seed.triggers || [])
              ].filter(Boolean).join(' ');

              // Call edge function to generate embedding
              const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('evai-core', {
                body: { 
                  operation: 'embedding', 
                  input: text, 
                  model: 'text-embedding-3-small' 
                }
              });

              if (embeddingError || !embeddingData?.embedding) {
                console.error(`❌ Failed to generate embedding for seed ${seed.id}:`, embeddingError);
                failed++;
                return;
              }

              // Store embedding in unified_knowledge
              const { error: updateError } = await supabase
                .from('unified_knowledge')
                .update({
                  vector_embedding: `[${(embeddingData.embedding as number[]).join(',')}]`,
                  updated_at: new Date().toISOString()
                })
                .eq('id', seed.id);

              if (updateError) {
                console.error(`❌ Failed to store embedding for seed ${seed.id}:`, updateError);
                failed++;
              } else {
                console.log(`✅ Embedding stored for seed ${seed.id}`);
                success++;
              }
            } catch (err) {
              console.error(`❌ Error processing seed ${seed.id}:`, err);
              failed++;
            }
          })
        );

        const processed = Math.min(i + batchSize, total);
        setProgress((processed / total) * 100);
        setStats({ total, processed, success, failed });
        
        // Small delay to respect rate limits
        if (i + batchSize < seedsWithoutEmbeddings.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Bulk embedding complete: ${success} success, ${failed} failed`);
      
      // Verify final state
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from('unified_knowledge')
        .select('id, vector_embedding')
        .eq('content_type', 'seed')
        .eq('active', true);
      
      if (!finalCheckError && finalCheck) {
        const totalSeeds = finalCheck.length;
        const seedsWithEmbeddings = finalCheck.filter(s => s.vector_embedding !== null).length;
        const seedsWithoutEmbeddings = totalSeeds - seedsWithEmbeddings;
        
        console.log(`📊 Final state: ${seedsWithEmbeddings}/${totalSeeds} seeds have embeddings`);
        
        if (seedsWithoutEmbeddings === 0) {
          toast.success(`🎉 All ${totalSeeds} seeds now have embeddings!`, {
            description: 'Vector search is now fully operational'
          });
        } else {
          toast.warning(`${seedsWithoutEmbeddings} seeds still missing embeddings`, {
            description: `${seedsWithEmbeddings}/${totalSeeds} seeds embedded successfully`
          });
        }
      }
      
      if (success > 0) {
        toast.success(`${success} embeddings generated successfully! 🎉`, {
          description: failed > 0 ? `${failed} seeds failed` : 'All seeds processed'
        });
      } else {
        toast.error('No embeddings were generated', {
          description: 'Check console for error details'
        });
      }
    } catch (error) {
      console.error('🔴 Bulk embedding generation error:', error);
      toast.error('Critical error during bulk embedding generation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Bulk Embedding Generator
        </CardTitle>
        <CardDescription>
          Generate vector embeddings for all seeds in unified_knowledge that are missing them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {stats.processed} / {stats.total}</span>
            <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 rounded bg-muted">
              <div className="font-semibold text-success">{stats.success}</div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="text-center p-2 rounded bg-muted">
              <div className="font-semibold text-destructive">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-2 rounded bg-muted">
              <div className="font-semibold">{stats.total - stats.processed}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        )}

        <Button
          onClick={generateAllEmbeddings}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Embeddings...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Generate All Missing Embeddings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}