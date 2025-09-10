import { useState, useEffect, useCallback, useRef } from 'react';
import { DirectusService } from '@/services/directusService';
import { RealTimeService, type RealTimeEvent } from '@/services/realTimeService';

export interface InlineEditOptions<T = unknown> {
  collection: string;
  itemId?: string | number;
  field: string;
  debounceMs?: number;
  optimistic?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

export interface InlineEditState<T = unknown> {
  value: T;
  originalValue: T;
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
}

export const useInlineEdit = <T = unknown>(options: InlineEditOptions<T>) => {
  const {
    collection,
    itemId,
    field,
    debounceMs = 500,
    optimistic = true,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<InlineEditState<T>>({
    value: '' as T,
    originalValue: '' as T,
    isEditing: false,
    isSaving: false,
    hasChanges: false,
    error: null
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const saveQueueRef = useRef<Promise<void> | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!itemId) return;
      
      try {
        const data = await DirectusService.getCollectionItem(collection, itemId);
        const fieldValue = (data[field] || '') as T;
        setState(prev => ({
          ...prev,
          value: fieldValue,
          originalValue: fieldValue,
          error: null
        }));
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load data'
        }));
      }
    };

    loadData();
  }, [collection, itemId, field]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!itemId) return;

    const handleRealTimeUpdate = (event: RealTimeEvent) => {
      if (event.collection === collection && event.key === String(itemId)) {
        const newValue = event.item?.[field];
        if (newValue !== undefined && newValue !== state.value) {
          setState(prev => ({
            ...prev,
            value: newValue,
            originalValue: newValue,
            hasChanges: false,
            error: null
          }));
        }
      }
    };

    RealTimeService.subscribe(collection, handleRealTimeUpdate);
    
    return () => {
      // RealTimeService.unsubscribe(collection, handleRealTimeUpdate); // TODO: Implement unsubscribe
    };
  }, [collection, itemId, field, state.value]);

  // Debounced save function
  const debouncedSave = useCallback(async (newValue: T) => {
    if (!itemId) return;

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // Wait for any pending save to complete
      if (saveQueueRef.current) {
        await saveQueueRef.current;
      }

      setState(prev => ({ ...prev, isSaving: true, error: null }));

      const savePromise = (async () => {
        try {
          const updateData = { [field]: newValue };
          await DirectusService.updateCollectionItem(collection, itemId, updateData);
          
          setState(prev => ({
            ...prev,
            originalValue: newValue,
            hasChanges: false,
            isSaving: false,
            error: null
          }));

          onSuccess?.(newValue);
        } catch (error) {
          console.error('Failed to save:', error);
          const errorMessage = error instanceof Error ? error.message : 'Save failed';
          
          if (!optimistic) {
            // Revert to original value
            setState(prev => ({
              ...prev,
              value: prev.originalValue,
              hasChanges: false,
              isSaving: false,
              error: errorMessage
            }));
          } else {
            setState(prev => ({
              ...prev,
              isSaving: false,
              error: errorMessage
            }));
          }

          onError?.(error instanceof Error ? error : new Error(errorMessage));
        }
      })();

      saveQueueRef.current = savePromise;
      await savePromise;
      saveQueueRef.current = null;
    }, debounceMs);
  }, [collection, itemId, field, debounceMs, optimistic, onError, onSuccess]);

  // Update value and trigger save
  const updateValue = useCallback((newValue: T) => {
    setState(prev => ({
      ...prev,
      value: newValue,
      hasChanges: newValue !== prev.originalValue,
      error: null
    }));

    if (optimistic && newValue !== state.originalValue) {
      debouncedSave(newValue);
    }
  }, [debouncedSave, optimistic, state.originalValue]);

  // Manual save
  const save = useCallback(async () => {
    if (!state.hasChanges || !itemId) return;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const updateData = { [field]: state.value };
      await DirectusService.updateCollectionItem(collection, itemId, updateData);
      
      setState(prev => ({
        ...prev,
        originalValue: prev.value,
        hasChanges: false,
        isSaving: false,
        error: null
      }));

      onSuccess?.(state.value);
    } catch (error) {
      console.error('Failed to save:', error);
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [collection, itemId, field, state.value, state.hasChanges, onError, onSuccess]);

  // Revert changes
  const revert = useCallback(() => {
    setState(prev => ({
      ...prev,
      value: prev.originalValue,
      hasChanges: false,
      error: null
    }));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Start/stop editing
  const startEditing = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: true }));
  }, []);

  const stopEditing = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: false }));
    if (state.hasChanges && !optimistic) {
      save();
    }
  }, [save, state.hasChanges, optimistic]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    ...state,
    updateValue,
    save,
    revert,
    startEditing,
    stopEditing
  };
};

export default useInlineEdit;
