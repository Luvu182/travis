import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface MetricPoint {
  timestamp: number;
  value: number;
}

interface HealthStatus {
  status: 'online' | 'offline' | 'degraded';
  uptime: { ms: number; hours: number; percentage: number };
  lastPing: string;
  platforms: Record<string, { connected: boolean; lastActivity: string }>;
  errorRate: number;
}

interface ConversationMetrics {
  totalConversations: number;
  activeUsers: { '1h': number; '24h': number; '7d': number };
  messagesPerMinute: number;
  avgResponseTimeMs: number;
  uniqueGroups: number;
}

interface PerformanceMetrics {
  requestRate: number;
  responseTime: { p50: number; p95: number; p99: number };
  errorRate: { '4xx': number; '5xx': number };
  throughput: number;
  systemMetrics: {
    cpuUsage: number;
    memoryUsage: { used: number; total: number; percentage: number };
  };
}

interface MetricsState {
  health: HealthStatus | null;
  conversations: ConversationMetrics | null;
  performance: PerformanceMetrics | null;
  requestRateHistory: MetricPoint[];
  latencyHistory: MetricPoint[];
  isLoading: boolean;
  error: string | null;

  setHealth: (health: HealthStatus) => void;
  setConversations: (conversations: ConversationMetrics) => void;
  setPerformance: (performance: PerformanceMetrics) => void;
  addRequestRatePoint: (value: number) => void;
  addLatencyPoint: (value: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const MAX_HISTORY_POINTS = 60; // 5 minutes at 5s intervals

export const useMetricsStore = create<MetricsState>()(
  subscribeWithSelector((set) => ({
    health: null,
    conversations: null,
    performance: null,
    requestRateHistory: [],
    latencyHistory: [],
    isLoading: false,
    error: null,

    setHealth: (health) => set({ health }),
    setConversations: (conversations) => set({ conversations }),
    setPerformance: (performance) => set({ performance }),

    addRequestRatePoint: (value) =>
      set((state) => ({
        requestRateHistory: [
          ...state.requestRateHistory.slice(-MAX_HISTORY_POINTS + 1),
          { timestamp: Date.now(), value },
        ],
      })),

    addLatencyPoint: (value) =>
      set((state) => ({
        latencyHistory: [
          ...state.latencyHistory.slice(-MAX_HISTORY_POINTS + 1),
          { timestamp: Date.now(), value },
        ],
      })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
  }))
);
