
// Production version - No mock data
// All mock data has been removed for production use

export const mockApiKeys = {};
export const mockEmotions: string[] = [];
export const mockConversations: any[] = [];
export const mockSeeds: any[] = [];
export const mockApiResponses = {};
export const mockAnalytics = {};
export const mockSystemStatus = {};

// Helper functions return empty/null values in production
export const getRandomMockApiKey = (provider: string) => {
  console.warn('Mock API keys are disabled in production. Please configure real API keys.');
  return '';
};

export const getRandomMockEmotion = () => {
  console.warn('Mock emotions are disabled in production.');
  return '';
};

export const generateMockConversation = (emotionHint?: string) => {
  console.warn('Mock conversations are disabled in production.');
  return null;
};
