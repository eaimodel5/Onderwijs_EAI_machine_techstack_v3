/**
 * Browser-Based Transformer Engine v1.0
 * Uses @huggingface/transformers for client-side ML inference
 * - Multilingual emotion detection (Dutch + English)
 * - WebGPU acceleration (fallback to WASM)
 * - Model caching in browser storage
 * - No API keys required
 */

import { useState, useCallback, useRef } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { normalizeEmotion, isValidEmotion, type ValidEmotion } from '@/utils/seedValidator';

// Extend Navigator interface for deviceMemory
declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_NAME = 'Xenova/bert-base-multilingual-uncased-sentiment';

type DeviceType = 'webgpu' | 'wasm';

// ============ MODULE-LEVEL STATE (Persistent across component mounts) ============
// Note: Using `any` for pipeline type due to transformers.js type complexity (TS2590)
const pipelineRef: { current: any } = { current: null };
let globalDevice: DeviceType | null = (localStorage.getItem('browserML-device') as DeviceType | null) || null;
let globalModelLoaded = localStorage.getItem('browserML-loaded') === 'true';
let isInitializing = false;

export interface BrowserEngineResult {
  emotion: string;
  confidence: number;
  allScores?: Array<{ label: string; score: number }>;
  device: 'webgpu' | 'wasm';
  inferenceTime: number;
}

export interface BrowserEngineResponse {
  ok: boolean;
  engine: 'browser-transformers';
  model: string;
  result: BrowserEngineResult;
  meta: {
    firstLoad: boolean;
    modelSize: string;
    device: 'webgpu' | 'wasm';
  };
}

// Sentiment to emotion mapping (5-star sentiment → Dutch emotions)
const SENTIMENT_TO_EMOTION: Record<string, ValidEmotion> = {
  '1 star': 'verdriet',
  '2 stars': 'teleurstelling', 
  '3 stars': 'onzekerheid',
  '4 stars': 'opluchting',
  '5 stars': 'blijdschap',
};

export function useBrowserTransformerEngine() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lastResult, setLastResult] = useState<BrowserEngineResponse | null>(null);
  const [, forceUpdate] = useState(0); // Force re-render trigger
  
  const lastProgressUpdate = useRef<number>(0); // Throttle progress updates

  /**
   * Initialize the ML pipeline (lazy loading)
   * Returns the pipeline instance or null if initialization fails
   */
  const initPipeline = useCallback(async () => {
    if (pipelineRef.current) return pipelineRef.current;
    if (isInitializing) {
      // Wait for ongoing initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      return pipelineRef.current;
    }

    isInitializing = true;
    setIsModelLoading(true);
    setLoadingProgress(0);

    try {
      console.log('🧠 Browser Transformer: Initializing pipeline...');
      console.log('📊 Browser info:', {
        userAgent: navigator.userAgent,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'unknown',
        webGPU: 'gpu' in navigator ? 'available' : 'not available'
      });
      
      // Try WebGPU first
      try {
        console.log('🔄 Attempting WebGPU initialization...');
        setLoadingProgress(10);
        
        const webgpuPipe = await pipeline('text-classification', MODEL_NAME, {
          device: 'webgpu',
          progress_callback: (progress: { progress?: number; status?: string }) => {
            const now = Date.now();
            if (progress.progress && now - lastProgressUpdate.current > 500) {
              console.log('📥 Model download progress:', progress);
              setLoadingProgress(10 + Math.floor(progress.progress * 40));
              lastProgressUpdate.current = now;
            }
          }
        });
        
        pipelineRef.current = webgpuPipe;
        globalDevice = 'webgpu';
        globalModelLoaded = true;
        localStorage.setItem('browserML-device', 'webgpu');
        localStorage.setItem('browserML-loaded', 'true');
        forceUpdate(prev => prev + 1);
        console.log('✅ Browser Transformer: WebGPU enabled');
      } catch (webgpuError) {
        console.warn('⚠️ WebGPU not available, falling back to WASM:', webgpuError);
        console.warn('WebGPU error details:', {
          name: (webgpuError as Error).name,
          message: (webgpuError as Error).message,
          stack: (webgpuError as Error).stack?.split('\n').slice(0, 3)
        });
        
        console.log('🔄 Attempting WASM initialization...');
        setLoadingProgress(50);
        
        try {
          const wasmPipe: any = await pipeline('text-classification', MODEL_NAME, {
            device: 'wasm',
            progress_callback: (progress: any) => {
              const now = Date.now();
              if (progress.progress && now - lastProgressUpdate.current > 500) {
                console.log('📥 Model download progress (WASM):', progress);
                setLoadingProgress(50 + Math.floor(progress.progress * 50));
                lastProgressUpdate.current = now;
              }
            }
          });
          
          pipelineRef.current = wasmPipe;
          globalDevice = 'wasm';
          globalModelLoaded = true;
          localStorage.setItem('browserML-device', 'wasm');
          localStorage.setItem('browserML-loaded', 'true');
          forceUpdate(prev => prev + 1);
          console.log('✅ Browser Transformer: WASM enabled');
        } catch (wasmError) {
          console.error('❌ WASM initialization also failed:', wasmError);
          console.error('WASM error details:', {
            name: (wasmError as Error).name,
            message: (wasmError as Error).message,
            stack: (wasmError as Error).stack?.split('\n').slice(0, 3)
          });
          throw wasmError;
        }
      }

      setLoadingProgress(100);
      setIsModelLoading(false);
      isInitializing = false;
      console.log('🎉 Browser Transformer: Initialization complete!', {
        device: globalDevice,
        modelName: MODEL_NAME,
        pipelineReady: !!pipelineRef.current
      });
      return pipelineRef.current;
    } catch (error) {
      console.error('❌ Browser Transformer: Pipeline initialization failed:', error);
      console.error('🔍 Failure context:', {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        browserOnline: navigator.onLine,
        storageAvailable: 'storage' in navigator && 'estimate' in navigator.storage
      });
      
      // Check storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          console.warn('💾 Storage info:', {
            usage: estimate.usage ? `${(estimate.usage / 1024 / 1024).toFixed(2)} MB` : 'unknown',
            quota: estimate.quota ? `${(estimate.quota / 1024 / 1024).toFixed(2)} MB` : 'unknown',
            percentUsed: estimate.usage && estimate.quota ? `${((estimate.usage / estimate.quota) * 100).toFixed(1)}%` : 'unknown'
          });
        } catch (storageError) {
          console.warn('⚠️ Could not check storage:', storageError);
        }
      }
      
      setIsModelLoading(false);
      isInitializing = false;
      pipelineRef.current = null;
      globalDevice = null;
      globalModelLoaded = false;
      localStorage.removeItem('browserML-device');
      localStorage.removeItem('browserML-loaded');
      throw error;
    }
  }, []);

  /**
   * Detect emotion using browser-based ML
   */
  const detectEmotionInBrowser = useCallback(async (
    text: string,
    language: 'nl' | 'en' = 'nl'
  ): Promise<BrowserEngineResponse | null> => {
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Empty text provided to browser engine');
      return null;
    }

    setIsProcessing(true);
    const startTime = performance.now();
    const isFirstLoad = !pipelineRef.current;

    try {
      const pipe = await initPipeline();
      if (!pipe) {
        throw new Error('Failed to initialize pipeline');
      }

      console.log(`🔍 Browser Transformer: Analyzing "${text.substring(0, 50)}..."`);
      
      type PipelineResult = Array<{ label: string; score: number }>;
      const results = await pipe(text, { top_k: 5 }) as PipelineResult;
      const inferenceTime = performance.now() - startTime;

      if (!results || results.length === 0) {
        throw new Error('No results from pipeline');
      }

      // Get top prediction
      const topResult = Array.isArray(results) ? results[0] : results;
      const sentimentLabel = topResult.label;
      const confidence = topResult.score;

      // Map sentiment to emotion
      const emotion = SENTIMENT_TO_EMOTION[sentimentLabel] || 'onzekerheid';

      const allScores = Array.isArray(results) ? results.map((r: any) => ({
        label: SENTIMENT_TO_EMOTION[r.label] || r.label,
        score: r.score
      })) : [];

      const response: BrowserEngineResponse = {
        ok: true,
        engine: 'browser-transformers',
        model: MODEL_NAME,
        result: {
          emotion,
          confidence,
          allScores,
          device: globalDevice || 'wasm',
          inferenceTime: Math.round(inferenceTime),
        },
        meta: {
          firstLoad: isFirstLoad,
          modelSize: '~120MB',
          device: globalDevice || 'wasm',
        },
      };

      setLastResult(response);
      console.log(`✅ Browser Transformer: Detected "${emotion}" (${Math.round(confidence * 100)}% confidence, ${Math.round(inferenceTime)}ms)`);
      
      return response;
    } catch (error) {
      console.error('❌ Browser Transformer: Detection failed:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [initPipeline]);

  /**
   * Ping engine to check availability
   */
  const pingEngine = useCallback(async (): Promise<boolean> => {
    try {
      const result = await detectEmotionInBrowser('test', 'en');
      return result !== null;
    } catch {
      return false;
    }
  }, [detectEmotionInBrowser]);

  /**
   * Preload model in background
   */
  const preloadModel = useCallback(async (): Promise<void> => {
    if (pipelineRef.current || isInitializing) {
      console.log('⏭️ Browser Transformer: Model already loaded/loading');
      return;
    }

    console.log('🚀 Browser Transformer: Preloading model...');
    try {
      await initPipeline();
      console.log('✅ Browser Transformer: Preload complete');
    } catch (error) {
      console.warn('⚠️ Browser Transformer: Preload failed:', error);
    }
  }, [initPipeline]);

  return {
    detectEmotionInBrowser,
    pingEngine,
    preloadModel,
    isProcessing,
    isModelLoading,
    loadingProgress,
    lastResult,
    device: globalDevice,
    modelLoaded: globalModelLoaded,
  };
}
