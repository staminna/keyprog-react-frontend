import { useEffect, useRef, useCallback } from 'react';

interface ContentChangeEvent {
  type: 'content.update' | 'connected';
  collection?: string;
  action?: 'create' | 'update' | 'delete';
  key?: string | string[];
  payload?: Record<string, unknown>;
  timestamp?: string;
  message?: string;
}

interface UseContentSyncOptions {
  collection: string;
  itemId?: string | number;
  onUpdate?: (event: ContentChangeEvent) => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time content changes via Server-Sent Events (SSE)
 * Provides two-way binding between Directus backend and React frontend
 * 
 * NOTE: Currently disabled as the /content-sync/events endpoint is not implemented
 * in Directus. This would require a custom Directus extension to work.
 * 
 * To re-enable:
 * 1. Create a Directus extension that provides the /content-sync/events SSE endpoint
 * 2. Set SSE_ENABLED to true below
 */
export const useContentSync = ({
  collection,
  itemId,
  onUpdate,
  enabled = true,
}: UseContentSyncOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // DISABLE SSE until backend endpoint is implemented
  const SSE_ENABLED = false;

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as ContentChangeEvent;
      
      // Filter for relevant updates
      if (data.type === 'content.update' && data.collection === collection) {
        // If itemId is specified, only process updates for that item
        if (itemId === undefined || data.key === String(itemId) || (Array.isArray(data.key) && data.key.includes(String(itemId)))) {
          console.log('🔄 Content sync update received:', { collection, itemId, data });
          onUpdate?.(data);
        }
      } else if (data.type === 'connected') {
        console.log('✅ Connected to content sync:', data.message);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      }
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  }, [collection, itemId, onUpdate]);

  const connect = useCallback(() => {
    // Skip if SSE is disabled
    if (!SSE_ENABLED) {
      return;
    }

    if (!enabled || eventSourceRef.current) {
      return;
    }

    try {
      const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
      const eventSource = new EventSource(`${directusUrl}/content-sync/events`);

      eventSource.onmessage = handleMessage;

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        
        // Close the current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Implement exponential backoff for reconnection
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;

        console.log(`Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffDelay);
      };

      eventSource.onopen = () => {
        console.log('✅ SSE connection opened');
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  }, [enabled, handleMessage, SSE_ENABLED]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('🔌 SSE connection closed');
    }
  }, []);

  useEffect(() => {
    if (SSE_ENABLED && enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect, SSE_ENABLED]);

  return {
    isConnected: eventSourceRef.current !== null,
    reconnect: connect,
    disconnect,
  };
};

export default useContentSync;
