export type AnalyticsSnapshot = {
  activeSessions: number;
  totalMessages: number;
  avgLatencyMs: number;
  breachRate: number;
  updatedAt: number;
};

export const fetchAnalytics = async (): Promise<AnalyticsSnapshot> => {
  return {
      activeSessions: 12,
      totalMessages: 1248,
      avgLatencyMs: 840,
      breachRate: 0.02,
      updatedAt: Date.now()
  };
};