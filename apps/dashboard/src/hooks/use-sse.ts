'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface SSEMetrics {
  timestamp: string;
  health: {
    status: 'online' | 'offline';
    uptimeMs: number;
    errorRate: number;
  };
  conversations: {
    total: number;
    activeUsers: number;
  };
  performance: {
    responseTimeP50: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}

interface UseSSEOptions {
  onMetrics?: (metrics: SSEMetrics) => void;
  onConnect?: () => void;
  onError?: (error: Event) => void;
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<SSEMetrics | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
      options.onConnect?.();
    });

    eventSource.addEventListener('metrics', (event) => {
      try {
        const metrics = JSON.parse(event.data) as SSEMetrics;
        setLastMetrics(metrics);
        options.onMetrics?.(metrics);
      } catch (error) {
        console.error('Failed to parse SSE metrics:', error);
      }
    });

    eventSource.onerror = (error) => {
      setIsConnected(false);
      options.onError?.(error);

      // Auto-reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [url, options]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    lastMetrics,
    disconnect,
    reconnect: connect,
  };
}
