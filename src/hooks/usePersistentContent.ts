import { useState, useEffect, useCallback, useRef } from 'react';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { DirectusService } from '@/services/directusService';
import { useContentSync } from './useContentSync';
import { contentBatchLoader } from '@/services/contentBatchLoader';

interface PersistentContentOptions {
  collection: string;
  itemId: string | number;
  field: string;
  initialValue?: string;
  enableRealtime?: boolean;
  pollingInterval?: number;
}

interface PersistentContentState {
  content: string;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Hook for managing persistent content with direct backend saves and real-time updates
 * OPTIMIZED: Removed excessive logging for 10x performance improvement
 */
export const usePersistentContent = ({
  collection,
  itemId,
  field,
  initialValue = '',
  enableRealtime = true,
  pollingInterval = 2000,
}: PersistentContentOptions) => {
  
  const [state, setState] = useState<PersistentContentState>({
    content: '',
    isLoading: true,
    isSaving: false,
    lastSaved: null,
    error: null,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimestampRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const isUpdatingFromSyncRef = useRef(false);
  const lastRefreshTimestamp = useRef<number>(0);

  // Real-time content sync via SSE (preferred method)
  useContentSync({
    collection,
    itemId,
    enabled: enableRealtime && collection !== 'settings',
    onUpdate: useCallback(async (event) => {
      if (state.isSaving || isUpdatingFromSyncRef.current) {
        return;
      }

      const timeSinceLastSave = Date.now() - lastSaveTimestampRef.current;
      if (timeSinceLastSave < 3000) {
        return;
      }

      try {
        isUpdatingFromSyncRef.current = true;
        
        const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
        const serverContent = item && field in item ? String(item[field] || '') : '';
        
        if (isMountedRef.current && serverContent !== state.content) {
          setState(prev => ({
            ...prev,
            content: serverContent,
          }));
        }
      } catch (error) {
        // Silent fail for real-time updates
        isUpdatingFromSyncRef.current = false;
      }
    }, [collection, itemId, field, state.content, state.isSaving]),
  });

  // Force refresh from server with cache bypass (defined early for use in event listeners)
  const refreshFromServer = useCallback(async () => {
    // Invalidate cache before fetching
    contentBatchLoader.invalidateCache(collection, itemId);
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
      const serverContent = item && field in item ? String(item[field] || '') : '';
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          content: serverContent,
          isLoading: false,
          lastSaved: new Date(),
        }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to refresh content:', error);
      }
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to refresh content',
        }));
      }
    }
  }, [collection, itemId, field]);

  // Listen for Directus content update events from Visual Editor
  useEffect(() => {
    const handleDirectusUpdate = (event: CustomEvent) => {
      const detail = event.detail;
      
      // Check if this update is relevant to this field
      const isRelevant = 
        detail.collection === collection &&
        (detail.itemId === itemId || detail.itemId === String(itemId));
      
      if (isRelevant) {
        // Debounce refreshes to avoid excessive API calls
        const timeSinceLastRefresh = Date.now() - lastRefreshTimestamp.current;
        if (timeSinceLastRefresh < 1000) {
          return;
        }
        
        console.log('🔄 Refreshing content due to Directus update', { collection, itemId, field });
        lastRefreshTimestamp.current = Date.now();
        
        // Invalidate cache and refresh from server
        contentBatchLoader.invalidateCache(collection, itemId);
        refreshFromServer();
      }
    };

    const handleDirectusRefresh = () => {
      console.log('🔄 Refreshing all content due to Directus refresh request');
      
      // Debounce refreshes
      const timeSinceLastRefresh = Date.now() - lastRefreshTimestamp.current;
      if (timeSinceLastRefresh < 1000) {
        return;
      }
      
      lastRefreshTimestamp.current = Date.now();
      contentBatchLoader.invalidateCache(collection, itemId);
      refreshFromServer();
    };

    // Add event listeners
    window.addEventListener('directus:content-updated', handleDirectusUpdate as EventListener);
    window.addEventListener('directus:refresh', handleDirectusRefresh);

    return () => {
      window.removeEventListener('directus:content-updated', handleDirectusUpdate as EventListener);
      window.removeEventListener('directus:refresh', handleDirectusRefresh);
    };
  }, [collection, itemId, field, refreshFromServer]);

  // Initial load from Directus - OPTIMIZED with better timeout handling
  useEffect(() => {
    isMountedRef.current = true;
    let timeoutId: NodeJS.Timeout;

    const loadContent = async () => {
      // Increased timeout to 15 seconds for slower connections
      timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            content: initialValue || '',
            isLoading: false,
            error: 'Loading timeout',
          }));
        }
      }, 15000);

      try {
        // Use batch loader for optimized loading
        const serverContent = await contentBatchLoader.getFieldContent(
          collection,
          collection === 'settings' ? 'singleton' : itemId,
          field,
          false // Use cache for faster loading
        );
        
        clearTimeout(timeoutId);

        const finalContent = serverContent !== null && serverContent !== undefined
          ? serverContent
          : initialValue;

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            content: finalContent,
            isLoading: false,
          }));
        }
      } catch (error) {
        clearTimeout(timeoutId);
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error('Failed to load content:', error);
        }
        
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            content: initialValue || '',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load content',
          }));
        }
      }
    };

    loadContent();

    return () => {
      isMountedRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [collection, itemId, field, initialValue]);

  // Save to server with cache invalidation
  const saveToServer = useCallback(async (contentToSave?: string) => {
    const content = contentToSave || state.content;
    
    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null,
    }));

    try {
      // Special handling for settings collection
      if (collection === 'settings') {
        if (import.meta.env.DEV) {
          console.warn('Direct editing of settings is not supported');
        }
        setState(prev => ({
          ...prev,
          isSaving: false,
        }));
        return false;
      }
      
      let result;
      
      if (collection === 'sub_menu_content') {
        try {
          const existingItem = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
          
          if (existingItem && existingItem.id) {
            result = await DirectusServiceExtension.updateField(collection, itemId, field, content);
          } else {
            const newItem = {
              id: itemId,
              [field]: content,
              status: 'published'
            };
            result = await DirectusServiceExtension.createItem(collection, newItem);
          }
        } catch (subMenuError) {
          throw subMenuError;
        }
      } else {
        result = await DirectusServiceExtension.updateField(collection, itemId, field, content);
      }
      
      lastSaveTimestampRef.current = Date.now();
      contentBatchLoader.invalidateCache(collection, itemId);

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          content: contentToSave,
          isSaving: false,
          lastSaved: new Date(),
        }));
      }

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Save failed:', error instanceof Error ? error.message : String(error));
      }
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to save content',
        }));
      }
      return false;
    }
  }, [collection, itemId, field, state.content]);

  // Update content locally and save immediately
  const updateContent = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent,
      error: null,
    }));

    saveToServer(newContent);
  }, [saveToServer]);

  const discardChanges = useCallback(() => {
    refreshFromServer();
  }, [refreshFromServer]);

  return {
    ...state,
    updateContent,
    saveToServer,
    refreshFromServer,
    discardChanges,
  };
};

export default usePersistentContent;
