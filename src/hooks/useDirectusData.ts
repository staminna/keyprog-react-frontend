/**
 * React Hook for Directus Data with MCP Integration
 * Provides type-safe access to Directus data with real-time schema awareness
 */

import { useState, useEffect, useCallback } from 'react';
import { createMCPDirectusClient, MCPDirectusClient, SchemaAwareness } from '../lib/mcp-directus';
import { DirectusQueries, DirectusSchema } from '../types/directus-schema';
import { directus, readItems, readSingleton } from '../lib/directus';

// =============================================================================
// HOOK STATE INTERFACE
// =============================================================================

interface UseDirectusDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseDirectusDataReturn<T> extends UseDirectusDataState<T> {
  refetch: () => Promise<void>;
  update: (newData: T) => void;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useDirectusData<T>(
  queryFn: (queries: DirectusQueries) => Promise<T>,
  dependencies: any[] = []
): UseDirectusDataReturn<T> {
  const [state, setState] = useState<UseDirectusDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Try MCP first for enhanced data access
      const mcpClient = await createMCPDirectusClient();
      const mcpData = await queryFn(mcpClient.queriesInstance);
      
      setState({
        data: mcpData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      mcpClient.close();
    } catch (error) {
      console.warn('MCP unavailable, falling back to direct SDK:', error);
      
      try {
        // Fallback to direct SDK
        const directData = await queryFn({
          // Provide minimal fallback implementation
          getHeaderMenu: async () => await readItems('header_menu'),
          getFooterMenu: async () => await readItems('footer_menu'),
          getHero: async () => await readSingleton('hero'),
          getServices: async () => await readItems('services'),
          getServiceBySlug: async () => null,
          getCategories: async () => await readItems('categories'),
          getCategoryBySlug: async () => null,
          getSubMenuContent: async () => await readItems('sub_menu_content'),
          getSubMenuContentBySlug: async () => null,
          getPages: async () => await readItems('pages'),
          getPageBySlug: async () => null,
          getNews: async () => await readItems('news'),
          getNewsById: async () => null,
          getSettings: async () => await readSingleton('settings')
        } as DirectusQueries);
        
        setState({
          data: directData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (fallbackError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        }));
      }
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const update = useCallback((newData: T) => {
    setState(prev => ({
      ...prev,
      data: newData,
      lastUpdated: new Date()
    }));
  }, []);

  return {
    ...state,
    refetch,
    update
  };
}

// =============================================================================
// SPECIFIC DATA HOOKS
// =============================================================================

export function useHeaderMenu() {
  return useDirectusData(
    (queries) => queries.getHeaderMenu(),
    []
  );
}

export function useFooterMenu() {
  return useDirectusData(
    (queries) => queries.getFooterMenu(),
    []
  );
}

export function useHero() {
  return useDirectusData(
    (queries) => queries.getHero(),
    []
  );
}

export function useServices(publishedOnly = true) {
  return useDirectusData(
    (queries) => queries.getServices(publishedOnly),
    [publishedOnly]
  );
}

export function useServiceBySlug(slug: string) {
  return useDirectusData(
    (queries) => queries.getServiceBySlug(slug),
    [slug]
  );
}

export function useCategories() {
  return useDirectusData(
    (queries) => queries.getCategories(),
    []
  );
}

export function useSubMenuContent(category?: string, publishedOnly = true) {
  return useDirectusData(
    (queries) => queries.getSubMenuContent(category, publishedOnly),
    [category, publishedOnly]
  );
}

export function useSubMenuContentBySlug(slug: string) {
  return useDirectusData(
    (queries) => queries.getSubMenuContentBySlug(slug),
    [slug]
  );
}

export function usePages(publishedOnly = true) {
  return useDirectusData(
    (queries) => queries.getPages(publishedOnly),
    [publishedOnly]
  );
}

export function usePageBySlug(slug: string) {
  return useDirectusData(
    (queries) => queries.getPageBySlug(slug),
    [slug]
  );
}

export function useNews(limit = 10) {
  return useDirectusData(
    (queries) => queries.getNews(limit),
    [limit]
  );
}

export function useSettings() {
  return useDirectusData(
    (queries) => queries.getSettings(),
    []
  );
}

// =============================================================================
// SCHEMA AWARENESS HOOK
// =============================================================================

export function useSchemaAwareness() {
  const [schema, setSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupSchemaAwareness = async () => {
      try {
        setSchemaLoading(true);
        const mcpClient = await createMCPDirectusClient();
        
        if (!isMounted) return;

        // Get initial schema
        const currentSchema = await mcpClient.schemaAwarenessInstance.getCurrentSchema();
        if (isMounted) {
          setSchema(currentSchema);
          setSchemaLoading(false);
        }

        // Set up schema change watching
        const cleanup = await mcpClient.schemaAwarenessInstance.watchSchemaChanges((newSchema) => {
          if (isMounted) {
            setSchema(newSchema);
            console.log('🔄 Schema updated:', new Date().toISOString());
          }
        });

        if (isMounted) {
          setUnsubscribe(() => {
            cleanup();
            mcpClient.close();
          });
        } else {
          cleanup();
          mcpClient.close();
        }
      } catch (error) {
        if (isMounted) {
          setSchemaError(error instanceof Error ? error.message : 'Schema awareness failed');
          setSchemaLoading(false);
        }
      }
    };

    setupSchemaAwareness();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    schema,
    loading: schemaLoading,
    error: schemaError,
    hasChanges: !!schema,
    refetch: async () => {
      try {
        setSchemaLoading(true);
        const mcpClient = await createMCPDirectusClient();
        const currentSchema = await mcpClient.schemaAwarenessInstance.getCurrentSchema();
        setSchema(currentSchema);
        setSchemaLoading(false);
        mcpClient.close();
      } catch (error) {
        setSchemaError(error instanceof Error ? error.message : 'Schema fetch failed');
        setSchemaLoading(false);
      }
    }
  };
}

// =============================================================================
// BATCH DATA HOOK
// =============================================================================

export function useBatchDirectusData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Partial<DirectusSchema>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBatchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const mcpClient = await createMCPDirectusClient();
      
      const [
        headerMenu,
        footerMenu,
        hero,
        services,
        categories,
        subMenuContent,
        settings
      ] = await Promise.all([
        mcpClient.queriesInstance.getHeaderMenu(),
        mcpClient.queriesInstance.getFooterMenu(),
        mcpClient.queriesInstance.getHero(),
        mcpClient.queriesInstance.getServices(),
        mcpClient.queriesInstance.getCategories(),
        mcpClient.queriesInstance.getSubMenuContent(),
        mcpClient.queriesInstance.getSettings()
      ]);

      setData({
        header_menu: headerMenu,
        footer_menu: footerMenu,
        hero,
        services,
        categories,
        sub_menu_content: subMenuContent,
        settings
      });

      setLastUpdated(new Date());
      setLoading(false);
      
      mcpClient.close();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Batch fetch failed');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatchData();
  }, [fetchBatchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchBatchData
  };
}

// =============================================================================
// REAL-TIME HOOK (when WebSocket is available)
// =============================================================================

export function useRealTimeDirectus(collection: keyof DirectusSchema) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This would set up WebSocket connection for real-time updates
    // Implementation depends on your WebSocket setup
    
    const setupRealTime = async () => {
      try {
        setLoading(true);
        // Initialize real-time connection
        // Listen for changes to the specified collection
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Real-time setup failed');
      }
    };

    setupRealTime();

    return () => {
      // Cleanup real-time connection
    };
  }, [collection]);

  return {
    items,
    loading,
    error,
    refetch: async () => {
      // Implement refetch logic
    }
  };
}