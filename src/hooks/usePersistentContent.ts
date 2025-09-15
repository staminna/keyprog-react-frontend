import { useState, useEffect, useCallback, useRef } from 'react';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { DirectusService } from '@/services/directusService';

interface PersistentContentOptions {
  collection: string;
  itemId: string | number;
  field: string;
  initialValue?: string;
}

interface PersistentContentState {
  content: string;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Hook for managing persistent content with direct backend saves
 * No localStorage drafts - saves directly to Directus
 */
export const usePersistentContent = ({
  collection,
  itemId,
  field,
  initialValue = '',
}: PersistentContentOptions) => {
  
  const [state, setState] = useState<PersistentContentState>({
    content: initialValue,
    isLoading: true,
    isSaving: false,
    lastSaved: null,
    error: null,
  });

  // Load content from storage or server on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load from server - get the item directly using DirectusServiceExtension
        const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
        const serverContent = item && field in item ? String(item[field] || '') : initialValue;
        
        
        setState(prev => ({
          ...prev,
          content: serverContent,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load content:', error);
        setState(prev => ({
          ...prev,
          content: initialValue,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load content',
        }));
      }
    };

    loadContent();
  }, [collection, itemId, field, initialValue]);


  // Save to server
  const saveToServer = useCallback(async (contentToSave?: string) => {
    const content = contentToSave || state.content;
    
    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null,
    }));

    try {
      console.log('🔄 Attempting save:', { collection, itemId, field, content });
      
      let result;
      
      if (collection === 'sub_menu_content') {
        // For sub_menu_content, try to update or create the item
        console.log('📝 Updating sub_menu_content:', { itemId, field, content });
        try {
          // First try to get the item to see if it exists
          const existingItem = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
          console.log('🔍 Existing item check:', existingItem);
          
          if (existingItem && existingItem.id) {
            // Item exists, update it
            result = await DirectusServiceExtension.updateField(collection, itemId, field, content);
            console.log('✅ Updated existing sub_menu_content:', result);
          } else {
            // Item doesn't exist, create it with the field
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
      
      // Verify the update actually worked by fetching the latest data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const verifyItem = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
      console.log('🔍 Collection verification:', { 
        collection,
        itemId,
        field, 
        expected: content, 
        actual: verifyItem?.[field]
      });
      
      // If verification fails, throw an error
      if (verifyItem?.[field] !== content) {
        console.error('❌ Save verification failed:', {
          expected: content,
          actual: verifyItem?.[field],
          field,
          collection,
          allFields: Object.keys(verifyItem || {})
        });
        throw new Error(`Save verification failed`);
      }
      
      console.log('✅ Save verification passed');
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
      }));

      return true;
    } catch (error) {
      console.error('Save failed:', error instanceof Error ? error.message : String(error));
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save content',
      }));
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
      
      setState(prev => ({
        ...prev,
        content: serverContent,
        isLoading: false,
        lastSaved: new Date(),
      }));
    } catch (error) {
      console.error('Failed to refresh content:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh content',
      }));
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
