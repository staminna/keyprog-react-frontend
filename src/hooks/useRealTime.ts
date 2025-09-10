import { useEffect, useCallback, useRef } from 'react';
import { RealTimeService, RealTimeEvent, RealTimeCallback } from '@/services/realTimeService';

export function useRealTime(collection: string, callback: RealTimeCallback) {
  const callbackRef = useRef(callback);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Stable callback that uses the ref
  const stableCallback = useCallback((event: RealTimeEvent) => {
    callbackRef.current(event);
  }, []);

  useEffect(() => {
    // Subscribe to real-time updates
    unsubscribeRef.current = RealTimeService.subscribe(collection, stableCallback);

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [collection, stableCallback]);

  // Return connection status
  return {
    isConnected: RealTimeService.isConnected()
  };
}

export function useProductUpdates(callback: RealTimeCallback) {
  return useRealTime('products', callback);
}

export function useOrderUpdates(callback: RealTimeCallback) {
  return useRealTime('orders', callback);
}

export function useNewsUpdates(callback: RealTimeCallback) {
  return useRealTime('news', callback);
}

export function useServiceUpdates(callback: RealTimeCallback) {
  return useRealTime('services', callback);
}

export function useSettingsUpdates(callback: RealTimeCallback) {
  return useRealTime('settings', callback);
}

export function useAllUpdates(callback: RealTimeCallback) {
  return useRealTime('*', callback);
}
