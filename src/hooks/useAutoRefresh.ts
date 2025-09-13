import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
  initialDelay?: number;
  stopOnSuccess?: boolean;
  refreshOnWindowFocus?: boolean;
}

/**
 * A hook for automatically refreshing data.
 * It can refresh on a given interval and/or when the window regains focus.
 */
export function useAutoRefresh<T>(
  fetchFunction: () => Promise<T>,
  options: UseAutoRefreshOptions = {}
) {
  const {
    interval = 15000, // Default to a longer interval
    enabled = true,
    initialDelay = 0,
    stopOnSuccess = false,
    refreshOnWindowFocus = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const savedFetchFunction = useRef(fetchFunction);

  useEffect(() => {
    savedFetchFunction.current = fetchFunction;
  }, [fetchFunction]);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (!enabled) return;

    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const result = await savedFetchFunction.current();
      setData(result);
      setError(null);
      if (stopOnSuccess && result) {
        // Logic to stop refreshing is handled in the interval/event listeners
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [enabled, stopOnSuccess]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => fetchData(true), initialDelay);
      return () => clearTimeout(timer);
    }
  }, [enabled, initialDelay, fetchData]);

  // Interval-based refreshing
  useEffect(() => {
    if (!enabled || !interval) return;

    const intervalId = setInterval(() => {
      if (stopOnSuccess && data) {
        clearInterval(intervalId);
        return;
      }
      fetchData();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, data, stopOnSuccess, fetchData]);

  // Window focus-based refreshing
  useEffect(() => {
    if (!enabled || !refreshOnWindowFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, refreshOnWindowFocus, fetchData]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, isRefreshing, refresh };
}

export default useAutoRefresh;
