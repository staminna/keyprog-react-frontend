import { useState, useEffect, useCallback } from 'react';
import { 
  createDirectus, 
  rest, 
  readItems, 
  updateItem, 
  realtime, 
  type RestClient, 
  type WebSocketClient, 
  type DirectusClient,
  type Query
} from '@directus/sdk';
import type { Schema } from '@/lib/directus-schema';

type CollectionName = keyof Schema;

// Simplified type for items in a collection
type CollectionItem<T extends CollectionName> = Schema[T] extends Array<infer U> ? U : never;

// Initialize Directus client with basic types
const directus = createDirectus<Schema>(import.meta.env.VITE_DIRECTUS_URL)
  .with(rest())
  .with(realtime({
    authMode: 'handshake',
    reconnect: {
      retries: 5,
      delay: 1000,
    },
  }));

// Hook to fetch items
export function useItems<T extends CollectionName>(
  collection: T,
  query?: unknown // Simplified for now - can be typed more strictly later
) {
  const [data, setData] = useState<Schema[T] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await directus.request(
          readItems(collection, query)
        );
        setData(response as Schema[T]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [collection, JSON.stringify(query)]);

  return { data, isLoading, error };
}

// Hook to update items
export function useUpdateItem<T extends CollectionName>(
  collection: T
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<CollectionItem<T> | null>(null);

  const mutate = useCallback(
    async (variables: { id: string | number; data: Partial<CollectionItem<T>> }) => {
      try {
        setIsLoading(true);
        const result = await directus.request(
          updateItem(collection, variables.id, variables.data)
        ) as CollectionItem<T>;
        setData(result);
        setError(null);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [collection]
  );

  return { mutate, isLoading, error, data };
}

// Hook to subscribe to real-time updates
type RealtimeEvent<T> = {
  event: 'create' | 'update' | 'delete';
  key: string;
  payload: Partial<T>;
};

export function useRealtimeUpdates<T extends CollectionName>(collection: T) {
  useEffect(() => {
    // Simple implementation without real-time for now
    // Will be enhanced in a future update
    return () => {};
    
    /* Future real-time implementation will go here */
    /*
    const subscription = directus.subscribe(collection, {
      event: 'all',
      query: {}
    });

    const handleEvent = (event: RealtimeEvent<CollectionItem<T>>) => {
      // Handle real-time updates here
    };

    const subscriptionPromise = subscription.subscribe(handleEvent);

    return () => {
      subscriptionPromise.then((sub) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    };
    */
  }, [collection]);
}
