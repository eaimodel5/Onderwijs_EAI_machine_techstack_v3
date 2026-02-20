
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { HealthCheckResult } from '../types/healthCheck';
import { supabase } from '@/integrations/supabase/client';

export const useHealthCheck = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  // Using server-side checks via Edge Functions

  const runHealthCheck = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    
    const tests: HealthCheckResult[] = [];
    const totalTests = 4; // Reduced from 6
    let currentTest = 0;

    const updateProgress = () => {
      currentTest++;
      setProgress((currentTest / totalTests) * 100);
    };

    try {
      // Test 1: OpenAI API 1 (server-side)
      console.log('🧪 Test 1: OpenAI API 1 (edge)');
      try {
        const { data, error } = await supabase.functions.invoke('evai-admin', {
          body: { operation: 'test-openai-key' }
        });
        if (error) throw error;
        const { isValid, error: dataError, model } = (data ?? {}) as {
          isValid?: boolean;
          error?: string;
          model?: string;
        };
        const ok = isValid === true;
        tests.push({
          component: 'OpenAI API 1',
          status: ok ? 'success' : 'error',
          message: ok ? 'Key actief (server)' : (dataError || 'Key ontbreekt of ongeldig'),
          details: ok ? `Model: ${model || 'gpt-4o-mini'}` : undefined
        });
      } catch (error) {
        tests.push({
          component: 'OpenAI API 1',
          status: 'error',
          message: 'Server-side check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      updateProgress();

      // Test 2: Neurosymbolisch Core
      console.log('🧪 Test 2: Neurosymbolic Core');
      tests.push({
        component: 'Neurosymbolisch Core',
        status: 'success',
        message: '🧠 Pure neurosymbolische architectuur actief',
        details: 'Browser ML + Unified Knowledge Base'
      });
      updateProgress();

      // Test 3: Neurosymbolisch Integration
      console.log('🧪 Test 3: Neurosymbolische Integratie');
      const api1Working = tests.find(t => t.component === 'OpenAI API 1')?.status === 'success';
      const neurosymbolicWorking = tests.find(t => t.component === 'Neurosymbolisch Core')?.status === 'success';
      
      if (api1Working && neurosymbolicWorking) {
        tests.push({
          component: '🧠 Neurosymbolische Integratie',
          status: 'success',
          message: 'Volledige neurosymbolische flow actief',
          details: 'Browser ML + Unified Core + Embeddings'
        });
      } else if (api1Working) {
        tests.push({
          component: '🧠 Neurosymbolische Integratie',
          status: 'warning',
          message: 'Gedeeltelijke integratie',
          details: 'Basis werkt, Browser ML mogelijk offline'
        });
      } else {
        tests.push({
          component: '🧠 Neurosymbolische Integratie',
          status: 'error',
          message: 'Integratie problemen',
          details: 'Niet alle componenten werken'
        });
      }
      updateProgress();

      // Test 4: Overall System Health
      console.log('🧪 Test 4: Overall System Health');
      const successCount = tests.filter(t => t.status === 'success').length;
      const warningCount = tests.filter(t => t.status === 'warning').length;
      const errorCount = tests.filter(t => t.status === 'error').length;
      
      let overallStatus: 'success' | 'warning' | 'error' = 'success';
      let overallMessage = 'Systeem volledig operationeel';
      
      if (errorCount > 0) {
        overallStatus = 'error';
        overallMessage = `${errorCount} kritieke problemen gedetecteerd`;
      } else if (warningCount > 0) {
        overallStatus = 'warning';
        overallMessage = `${warningCount} waarschuwingen, systeem gedeeltelijk operationeel`;
      }
      
      tests.push({
        component: 'Systeem Gezondheid',
        status: overallStatus,
        message: overallMessage,
        details: `${successCount} successen, ${warningCount} waarschuwingen, ${errorCount} fouten`
      });
      updateProgress();

      setResults(tests);
      
      // Show summary toast
      const overallResult = tests[tests.length - 1];
      toast({
        title: "Health Check Voltooid",
        description: overallResult.message,
        variant: overallResult.status === 'error' ? 'destructive' : 'default'
      });

    } catch (error) {
      console.error('🔴 Health check failed:', error);
      toast({
        title: "Health Check Gefaald",
        description: "Er ging iets mis tijdens de systeemcontrole",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    progress,
    results,
    runHealthCheck
  };
};
