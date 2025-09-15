import { useState, useEffect, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';

export interface UseDirectusContentOptions<T = Record<string, unknown>> {
  /**
   * Collection name in Directus
   */
  collection: string;
  
  /**
   * Item ID for regular collections, or undefined for singletons
   */
  itemId?: string | number;
  
  /**
   * Slug for fetching by slug instead of ID
   */
  slug?: string;
  
  /**
   * Initial data to use while loading
   */
  initialData?: T;
  
  /**
   * Enable automatic synchronization
   */
  autoSync?: boolean;
  
  /**
   * Interval for automatic synchronization in milliseconds
   */
  syncInterval?: number;
  
  /**
   * Fallback collection to try if primary collection fails
   */
  fallbackCollection?: string;
  
  /**
   * Transform function to convert raw data from Directus
   */
  transform?: (data: Record<string, unknown>) => T;
}

export interface UseDirectusContentResult<T = Record<string, unknown>> {
  /**
   * Content data
   */
  data: T | null;
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Refresh data from Directus
   */
  refresh: () => Promise<void>;
  
  /**
   * Update a specific field
   */
  updateField: (field: string, value: unknown) => Promise<boolean>;
  
  /**
   * Update multiple fields
   */
  updateFields: (fields: Partial<T>) => Promise<boolean>;
  
  /**
   * Whether the user can edit this content
   */
  canEdit: boolean;
  
  /**
   * Whether data is currently being synchronized
   */
  isSyncing: boolean;
}

/**
 * Custom hook for bidirectional data flow between React and Directus
 * Provides real-time synchronization and error handling
 */
export function useDirectusContent<T = Record<string, unknown>>(
  options: UseDirectusContentOptions<T>
): UseDirectusContentResult<T> {
  const {
    collection,
    itemId,
    slug,
    initialData = null as unknown as T,
    autoSync = true,
    syncInterval = 30000,
    fallbackCollection,
    transform
  } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Get authentication and permission context
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const { canEditCollection } = useRolePermissions();
  
  // Check if user has permission to edit this content
  const hasAuthPermission = isInDirectusEditor || isAuthenticated;
  const hasRolePermission = canEditCollection(collection);
  const canEdit = hasAuthPermission && hasRolePermission;
  
  // Fetch data from Directus
  const fetchData = useCallback(async () => {
    if (isSyncing) return; // Prevent multiple simultaneous fetches
    
    setIsSyncing(true);
    
    try {
      let rawData: Record<string, unknown> | null = null;
      
      // Try to fetch by ID first
      if (itemId) {
        try {
          rawData = await DirectusServiceExtension.getCollectionItemSafe(
            collection,
            itemId,
            fallbackCollection
          );
        } catch (idError) {
          console.error(`Error fetching ${collection} by ID:`, idError);
          throw idError;
        }
      }
      // Then try by slug if ID is not available
      else if (slug) {
        try {
          const items = await DirectusService.getPages();
          rawData = items.find(item => item.slug === slug) || null;
          
          if (!rawData && fallbackCollection) {
            // Try fallback collection
            const fallbackItems = await DirectusService.getCollectionItem(fallbackCollection, '1');
            rawData = fallbackItems || null;
          }
        } catch (slugError) {
          console.error(`Error fetching ${collection} by slug:`, slugError);
          throw slugError;
        }
      }
      // Settings collection has been removed, use hero collection instead
      else if (collection === 'settings') {
        try {
          rawData = await DirectusServiceExtension.getCollectionItemSafe('hero', 1);
        } catch (heroError) {
          console.error('Error fetching hero data as settings replacement:', heroError);
          throw heroError;
        }
      }
      
      // Apply transform function if provided
      const transformedData = transform && rawData ? transform(rawData) : rawData as unknown as T;
      
      setData(transformedData);
      setError(null);
    } catch (error) {
      console.error(`Error fetching data from ${collection}:`, error);
      setError(error instanceof Error ? error : new Error(`Failed to fetch data from ${collection}`));
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [collection, itemId, slug, fallbackCollection, transform, isSyncing]);
  
  // Update a specific field
  const updateField = useCallback(async (field: string, value: unknown): Promise<boolean> => {
    if (!canEdit) return false;
    
    setIsSyncing(true);
    
    try {
      if (collection === 'settings') {
        // Update hero collection instead of settings
        await DirectusServiceExtension.updateCollectionItemSafe('hero', 1, { [field]: value });
      } else if (itemId) {
        // Update regular item with fallback
        try {
          await DirectusServiceExtension.updateField(collection, itemId, field, value);
        } catch (updateError) {
          console.error(`Error updating ${field} in ${collection}:`, updateError);
          
          // Try fallback collection if provided
          if (fallbackCollection) {
            await DirectusServiceExtension.updateField(fallbackCollection, itemId, field, value);
          } else {
            throw updateError;
          }
        }
      } else if (slug) {
        // Find item by slug and update
        const items = await DirectusService.getPages();
        const item = items.find(item => item.slug === slug);
        
        if (item && item.id) {
          await DirectusServiceExtension.updateField(collection, String(item.id), field, value);
        } else {
          throw new Error(`Item with slug ${slug} not found`);
        }
      } else {
        throw new Error('No itemId or slug provided for update');
      }
      
      // Update local state
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, [field]: value } as T;
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating ${field} in ${collection}:`, error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [collection, itemId, slug, fallbackCollection, canEdit]);
  
  // Update multiple fields at once
  const updateFields = useCallback(async (fields: Partial<T>): Promise<boolean> => {
    if (!canEdit) return false;
    
    setIsSyncing(true);
    
    try {
      const fieldsToUpdate = fields as Record<string, unknown>;
      
      if (collection === 'settings') {
        // Update hero collection instead of settings
        await DirectusServiceExtension.updateCollectionItemSafe('hero', 1, fieldsToUpdate);
      } else if (itemId) {
        // Update regular item
        await DirectusService.updateCollectionItem(collection, itemId, fieldsToUpdate);
      } else if (slug) {
        // Find item by slug and update
        const items = await DirectusService.getPages();
        const item = items.find(item => item.slug === slug);
        
        if (item && item.id) {
          await DirectusService.updateCollectionItem(collection, String(item.id), fieldsToUpdate);
        } else {
          throw new Error(`Item with slug ${slug} not found`);
        }
      } else {
        throw new Error('No itemId or slug provided for update');
      }
      
      // Update local state
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, ...fields } as T;
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating fields in ${collection}:`, error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [collection, itemId, slug, canEdit]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Set up auto-sync if enabled
  useEffect(() => {
    if (!autoSync) return;
    
    const intervalId = setInterval(() => {
      fetchData();
    }, syncInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [autoSync, fetchData, syncInterval]);
  
  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    updateField,
    updateFields,
    canEdit,
    isSyncing
  };
}

export default useDirectusContent;
