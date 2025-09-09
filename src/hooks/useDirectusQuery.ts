import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useEffect } from 'react';
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
  return useQuery<Schema[T]>({
    queryKey: [collection, query],
    queryFn: async () => {
      const response = await directus.request(
        readItems(collection, query)
      );
      return response as Schema[T];
    },
  });
}

// Hook to update items
export function useUpdateItem<T extends CollectionName>(
  collection: T
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: { id: string | number; data: Partial<CollectionItem<T>> }) =>
      directus.request(
        updateItem(collection, variables.id, variables.data)
      ) as Promise<CollectionItem<T>>,
    onSuccess: (_, variables) => {
      // Invalidate and refetch the items query
      queryClient.invalidateQueries({ queryKey: [collection] });
      queryClient.invalidateQueries({ queryKey: [collection, variables.id] });
    },
  });
}

// Hook to subscribe to real-time updates
type RealtimeEvent<T> = {
  event: 'create' | 'update' | 'delete';
  key: string;
  payload: Partial<T>;
};

export function useRealtimeUpdates<T extends CollectionName>(collection: T) {
  const queryClient = useQueryClient();
  
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
      queryClient.setQueriesData<Schema[T]>(
        { queryKey: [collection] },
        (currentData) => {
          if (!currentData) return currentData;
          
          if (event.event === 'delete') {
            return currentData.filter(
              (item) => item.id.toString() !== event.key
            ) as Schema[T];
          }
          
          return currentData.map((item) =>
            item.id.toString() === event.key
              ? { ...item, ...event.payload }
              : item
          ) as Schema[T];
        }
      );
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
  }, [collection, queryClient]);
}
