import { useState, useEffect, useCallback, useRef } from 'react';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { DirectusService } from '@/services/directusService';
import { useContentSync } from './useContentSync';

interface PersistentContentOptions {
  collection: string;
  itemId: string | number;
  field: string;
  initialValue?: string;
  enableRealtime?: boolean; // Enable real-time updates via polling
  pollingInterval?: number; // Polling interval in ms (default 2000)
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
 * Includes polling for two-way binding between React and Directus
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
    content: '', // Start empty, will be populated from Directus
    isLoading: true,
    isSaving: false,
    lastSaved: null,
    error: null,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimestampRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const isUpdatingFromSyncRef = useRef(false);

  // Real-time content sync via SSE (preferred method)
  useContentSync({
    collection,
    itemId,
    enabled: enableRealtime && collection !== 'settings',
    onUpdate: useCallback(async (event) => {
      // Don't update if we're currently saving (avoid loops)
      if (state.isSaving || isUpdatingFromSyncRef.current) {
        return;
      }

      // Don't update too soon after our own save
      const timeSinceLastSave = Date.now() - lastSaveTimestampRef.current;
      if (timeSinceLastSave < 3000) {
        return;
      }

      try {
        isUpdatingFromSyncRef.current = true;
        console.log('🔄 Applying real-time update from SSE:', event);
        
        // Fetch the latest version
        const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
        const serverContent = item && field in item ? String(item[field] || '') : '';
        
        if (isMountedRef.current && serverContent !== state.content) {
          setState(prev => ({
            ...prev,
            content: serverContent,
          }));
        }
      } catch (error) {
        console.error('Failed to apply real-time update:', error);
        isUpdatingFromSyncRef.current = false;
      }
    }, [collection, itemId, field, state.content, state.isSaving]),
  });

  // Initial load from Directus on mount - ALWAYS fetch from server first
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadContent = async () => {
      console.log('🔄 Fetching initial content from Directus:', { collection, itemId, field });
      
      // Special handling for settings collection
      if (collection === 'settings') {
        try {
          const settings = await DirectusService.getSettingsItem();
          const serverContent = settings && field in settings 
            ? String(settings[field] || '') 
            : initialValue;
            
          console.log('✅ Settings loaded from Directus:', serverContent.substring(0, 100));
          if (isMountedRef.current) {
            setState(prev => ({
              ...prev,
              content: serverContent,
              isLoading: false,
            }));
          }
          return;
        } catch (settingsError) {
          console.warn('⚠️ Failed to load settings from Directus, using fallback:', settingsError);
          if (isMountedRef.current) {
            setState(prev => ({
              ...prev,
              content: initialValue,
              isLoading: false,
            }));
          }
          return;
        }
      }

      // For non-settings collections, ALWAYS fetch from Directus first
      try {
        const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
        
        // Check if the field exists in the response
        const hasField = item && field in item;
        const serverContent = hasField ? String(item[field] || '') : null;
        
        console.log('✅ Content loaded from Directus:', { 
          collection, 
          field, 
          hasField,
          serverContent: serverContent ? serverContent.substring(0, 100) : 'null',
          initialValue: initialValue.substring(0, 100)
        });
        
        // CRITICAL FIX: Only use initialValue as fallback if API call failed
        // If API succeeds but field is empty/null, respect that (don't fallback to hardcoded value)
        // This ensures edited content (including deletions) is preserved after refresh
        let finalContent: string;
        
        if (serverContent !== null) {
          // Field exists in Directus response - use it (even if empty string)
          finalContent = serverContent;
        } else if (hasField === false && item) {
          // Field doesn't exist in the item but item exists - field was never set
          // Use empty string to indicate "no content yet" rather than hardcoded fallback
          finalContent = '';
        } else {
          // Item doesn't exist at all - use initialValue as true fallback
          finalContent = initialValue;
        }
        
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            content: finalContent,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('❌ Failed to load content from Directus, using fallback:', error);
        // Fallback to initialValue ONLY if Directus API is down/unreachable
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            content: initialValue,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load content',
          }));
        }
      }
    };

    loadContent();

    return () => {
      isMountedRef.current = false;
    };
  }, [collection, itemId, field, initialValue]);

  // Set up real-time polling for changes (only for external updates, not our own saves)
  useEffect(() => {
    if (!enableRealtime || collection === 'settings') {
      return;
    }

    const pollForChanges = async () => {
      // Don't poll while saving or updating from SSE to avoid conflicts
      if (state.isSaving || isUpdatingFromSyncRef.current) {
        return;
      }

      // Don't poll for 15 seconds after our own save to prevent overwriting
      const timeSinceLastSave = Date.now() - lastSaveTimestampRef.current;
      if (timeSinceLastSave < 15000) {
        return;
      }

      try {
        const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
        const serverContent = item && field in item ? String(item[field] || '') : '';
        
        // Normalize both strings for comparison
        const normalizedServer = serverContent.trim();
        const normalizedLocal = state.content.trim();
        
        // Only update if content actually changed (external edit detected)
        if (isMountedRef.current && normalizedServer !== normalizedLocal && !state.isSaving && !isUpdatingFromSyncRef.current) {
          console.log('🔄 External change detected, syncing from Directus:', {
            field,
            newContent: normalizedServer.substring(0, 50)
          });
          setState(prev => ({
            ...prev,
            content: serverContent,
          }));
        }
      } catch (error) {
        // Silently fail polling errors
        if (process.env.NODE_ENV === 'development') {
          console.debug('Polling error:', error);
        }
      }
    };

    // Poll every 10 seconds (longer interval to reduce load)
    pollingIntervalRef.current = setInterval(pollForChanges, 10000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [collection, itemId, field, enableRealtime, state.content, state.isSaving]);


  // Save to server with proper cache busting
  const saveToServer = useCallback(async (contentToSave?: string) => {
    const content = contentToSave || state.content;
    
    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null,
    }));

    try {
      console.log('🔄 Attempting save:', { collection, itemId, field, content: content.substring(0, 100) });
      
      // Special handling for settings collection
      if (collection === 'settings') {
        console.warn('Direct editing of settings is not supported through this interface');
        setState(prev => ({
          ...prev,
          isSaving: false,
        }));
        return false;
      }
      
      let result;
      
      if (collection === 'sub_menu_content') {
        console.log('📝 Updating sub_menu_content:', { itemId, field, content });
        try {
          const existingItem = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
          console.log('🔍 Existing item check:', existingItem);
          
          if (existingItem && existingItem.id) {
            result = await DirectusServiceExtension.updateField(collection, itemId, field, content);
            console.log('✅ Updated existing sub_menu_content:', result);
          } else {
            const newItem = {
              id: itemId,
              [field]: content,
              status: 'published'
            };
            console.log('📝 Creating new sub_menu_content item:', newItem);
            result = await DirectusServiceExtension.createItem(collection, newItem);
            console.log('✅ Created new sub_menu_content:', result);
          }
        } catch (subMenuError) {
          console.error('Sub menu content save failed:', subMenuError);
          throw subMenuError;
        }
      } else {
        // For all other collections, use the extension
        result = await DirectusServiceExtension.updateField(collection, itemId, field, content);
        console.log('✅ Collection update result:', result);
      }
      
      // Mark save timestamp - prevents polling from interfering
      lastSaveTimestampRef.current = Date.now();
      
      // Immediately update local state with what we saved (optimistic update)
      // Don't wait for verification - trust the API response
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          content: contentToSave, // Use what we just saved
          isSaving: false,
          lastSaved: new Date(),
        }));
      }
      
      console.log('✅ Save successful, content updated locally');

      return true;
    } catch (error) {
      console.error('Save failed:', error instanceof Error ? error.message : String(error));
      
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

    // Save immediately to server
    saveToServer(newContent);
  }, [saveToServer]);

  // Force refresh from server (discarding local changes)
  const refreshFromServer = useCallback(async () => {
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
      console.error('Failed to refresh content:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to refresh content',
        }));
      }
    }
  }, [collection, itemId, field]);

  // Refresh from server
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
