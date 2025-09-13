import { useState, useEffect, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';

interface PageData {
  id: string | number;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  [key: string]: unknown;
}

interface UsePageOptions {
  slug?: string;
  id?: string | number;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UsePageResult {
  page: PageData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updatePage: (data: Partial<PageData>) => Promise<boolean>;
  isSyncing: boolean;
}

/**
 * Custom hook for bidirectional page data management
 * Provides real-time synchronization between React and Directus
 */
export function usePage(options: UsePageOptions = {}): UsePageResult {
  const { slug, id, autoSync = true, syncInterval = 30000 } = options;
  
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Fetch page data from Directus
  const fetchPage = useCallback(async () => {
    if (!slug && !id) {
      setError(new Error('Either slug or id must be provided'));
      setIsLoading(false);
      return;
    }
    
    try {
      setIsSyncing(true);
      let pageData;
      
      if (id) {
        // Fetch by ID
        pageData = await DirectusService.getCollectionItem('pages', id);
      } else if (slug) {
        // Fetch by slug
        const pages = await DirectusService.getPages();
        pageData = pages && pages.length > 0 ? 
          pages.find(page => page.slug === slug) : null;
      }
      
      if (pageData) {
        setPage(pageData as PageData);
        setError(null);
      } else {
        setPage(null);
        setError(new Error('Page not found'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch page data'));
      console.error('Error fetching page:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [slug, id]);
  
  // Update page data in Directus
  const updatePage = useCallback(async (data: Partial<PageData>): Promise<boolean> => {
    if (!page) return false;
    
    try {
      setIsSyncing(true);
      
      // Merge new data with existing data
      const updatedData = {
        ...page,
        ...data
      };
      
      // Update in Directus
      await DirectusService.updateCollectionItem('pages', page.id, updatedData);
      
      // Update local state
      setPage(updatedData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update page data'));
      console.error('Error updating page:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [page]);
  
  // Initial fetch
  useEffect(() => {
    fetchPage();
  }, [fetchPage]);
  
  // Set up auto-sync if enabled
  useEffect(() => {
    if (!autoSync) return;
    
    const intervalId = setInterval(() => {
      fetchPage();
    }, syncInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [autoSync, fetchPage, syncInterval]);
  
  return {
    page,
    isLoading,
    error,
    refresh: fetchPage,
    updatePage,
    isSyncing
  };
}

export default usePage;
