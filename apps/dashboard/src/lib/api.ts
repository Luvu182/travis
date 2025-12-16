const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Try refresh token
      const refreshed = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshed.ok) {
        // Retry original request
        return fetchAPI(path, options);
      }
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// API response types
interface HealthResponse {
  status: string;
  uptimeMs: number;
  lastPing: string;
}

interface ConversationsResponse {
  total: number;
  active: number;
  messagesPerMin: number;
}

interface PerformanceResponse {
  requestRate: number;
  responseTime: { p50: number; p95: number; p99: number };
  errorRate: { '4xx': number; '5xx': number };
  systemMetrics: { cpuUsage: number; memoryUsage: { percentage: number } };
  throughput: number;
}

interface MemoryResponse {
  vectorStoreSize: { formatted: string };
  embeddingCount: number;
  storageUsed: { formatted: string };
  growthTrend: { daily: number; weekly: number };
  topConsumers: { name: string; count: number }[];
}

interface GroupsResponse {
  groups: { id: string; name: string; memberCount: number }[];
}

interface ConversationItem {
  id: string;
  content: string;
  createdAt: string;
  groupName: string | null;
  userName: string | null;
  platform: string;
}

interface ConversationHistoryResponse {
  data: ConversationItem[];
  pagination: {
    total: number;
    hasMore: boolean;
    offset: number;
    limit: number;
  };
}

interface MetricsHistoryResponse {
  data: { timestamp: string; value: number }[];
}

export const dashboardAPI = {
  getHealth: () => fetchAPI<HealthResponse>('/api/dashboard/health'),

  getConversations: (period: string = '24h') =>
    fetchAPI<ConversationsResponse>(`/api/dashboard/conversations?period=${period}`),

  getPerformance: () => fetchAPI<PerformanceResponse>('/api/dashboard/performance'),

  getMemory: () => fetchAPI<MemoryResponse>('/api/dashboard/memory'),

  getGroups: () => fetchAPI<GroupsResponse>('/api/dashboard/groups'),

  getConversationHistory: (params: { limit?: number; offset?: number }) =>
    fetchAPI<ConversationHistoryResponse>(
      `/api/dashboard/conversations/history?limit=${params.limit || 50}&offset=${params.offset || 0}`
    ),

  getMetricsHistory: (metric: string, range: string) =>
    fetchAPI<MetricsHistoryResponse>(`/api/dashboard/metrics/history?metric=${metric}&range=${range}`),
};
