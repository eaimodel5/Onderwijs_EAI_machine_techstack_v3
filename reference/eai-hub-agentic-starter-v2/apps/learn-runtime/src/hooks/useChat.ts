import { useState, useCallback } from 'react';
import { Message, ChatHistoryItem, UnifiedResponse } from '../types';
import { useProcessingOrchestrator } from './useProcessingOrchestrator';
import { v4 as uuidv4 } from 'uuid';
import { useSelfLearningManager } from './useSelfLearningManager';
import { saveChatMessage } from '@/lib/chatHistoryStorage';
import { toast } from 'sonner';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  
  console.log('🔄 useChat hook initialized - Production mode');
  const { orchestrateProcessing, isProcessing, stats } = useProcessingOrchestrator();
  const { analyzeTurn } = useSelfLearningManager();

  const onSend = useCallback(async (message: string) => {
    console.log('📤 useChat onSend called with message:', message);
    console.log('📊 isProcessing state:', isProcessing);
    
    if (!message.trim() || isProcessing) {
      console.log('❌ Message blocked - empty or processing');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      from: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLastError(null); // Clear any previous errors
    setLastUserMessage(message); // Store for retry

    // 💾 Long-Term Memory: Save user message to database
    await saveChatMessage(userMessage);

    try {
      // Convert to ChatHistoryItem format
      const history: ChatHistoryItem[] = messages.map(msg => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Get optional API keys from localStorage (deprecated - kept for backward compatibility only)
      // All production API calls now go through Supabase Edge Functions with server-side keys
      const storedApiKey = undefined; // Removed client-side API key usage
      
      console.log('🔑 Using keys - Primary present:', !!storedApiKey);
      console.log('📋 History length:', history.length);

      // Process through the orchestrator
      console.log('🎼 Calling orchestrateProcessing...');
      const result: UnifiedResponse = await orchestrateProcessing(message, history, storedApiKey);
      console.log('✅ orchestrateProcessing returned result:', result);

      const aiResponse: Message = {
        id: uuidv4(),
        from: 'ai',
        content: result.content,
        timestamp: new Date(),
        emotionSeed: result.emotion,
        confidence: result.confidence,
        label: result.label,
        explainText: result.reasoning,
        symbolicInferences: result.symbolicInferences,
        secondaryInsights: result.secondaryInsights,
        meta: {
          processingPath: result.metadata.processingPath,
          totalProcessingTime: result.metadata.totalProcessingTime,
          componentsUsed: result.metadata.componentsUsed
        },
        v20Metadata: result.metadata.fusionMetadata ? {
          tdMatrixFlag: result.metadata.fusionMetadata.tdMatrixFlag,
          fusionStrategy: result.metadata.fusionMetadata.strategy,
          safetyScore: result.metadata.fusionMetadata.safetyScore,
          eaaScores: result.metadata.fusionMetadata.eaaScores
        } : undefined,
        feedback: null
      };

      setMessages(prev => [...prev, aiResponse]);

      // 💾 Long-Term Memory: Save AI response to database
      await saveChatMessage(aiResponse);

      // Proactief zelflerend proces (fire-and-forget)
      void analyzeTurn(
        message,
        result,
        [...history, { role: 'user', content: message }]
      );

    } catch (error) {
      console.error('Chat processing error:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Er ging iets mis. Controleer je API configuratie.';
      setLastError(errorMsg);
      
      const errorMessage: Message = {
        id: uuidv4(),
        from: 'ai',
        content: errorMsg,
        timestamp: new Date(),
        emotionSeed: 'error',
        confidence: 0,
        label: 'Fout',
        feedback: null
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Verwerking mislukt', { description: errorMsg });
    }
  }, [messages, isProcessing, orchestrateProcessing]);

  const setFeedback = useCallback((messageId: string, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  }, []);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    setInput('');
    setLastError(null);
    setLastUserMessage('');
    // Clear database as well
    const { clearChatHistory } = await import('@/lib/chatHistoryStorage');
    await clearChatHistory();
  }, []);

  const retryLastMessage = useCallback(() => {
    if (lastUserMessage) {
      void onSend(lastUserMessage);
    }
  }, [lastUserMessage, onSend]);

  const getChatStats = useCallback(() => {
    return {
      messageCount: messages.length,
      processingStats: stats,
      lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : null
    };
  }, [messages, stats]);

  return {
    messages,
    input,
    setInput,
    isProcessing,
    onSend,
    setFeedback,
    clearHistory,
    getChatStats,
    lastError,
    retryLastMessage
  };
}
