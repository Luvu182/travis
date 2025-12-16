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

  return res.json();
}

export const dashboardAPI = {
  getHealth: () => fetchAPI<any>('/api/dashboard/health'),

  getConversations: (period: string = '24h') =>
    fetchAPI<any>(`/api/dashboard/conversations?period=${period}`),

  getPerformance: () => fetchAPI<any>('/api/dashboard/performance'),

  getMemory: () => fetchAPI<any>('/api/dashboard/memory'),

  getGroups: () => fetchAPI<any>('/api/dashboard/groups'),

  getConversationHistory: (params: { limit?: number; offset?: number }) =>
    fetchAPI<any>(
      `/api/dashboard/conversations/history?limit=${params.limit || 50}&offset=${params.offset || 0}`
    ),

  getMetricsHistory: (metric: string, range: string) =>
    fetchAPI<any>(`/api/dashboard/metrics/history?metric=${metric}&range=${range}`),
};
