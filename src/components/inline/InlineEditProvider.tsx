import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  InlineEditContext,
  useInlineEditContext,
  type InlineEditProviderProps,
  type EditingState,
  type InlineEditContextType,
} from './inline-edit-context';

export const InlineEditProvider: React.FC<InlineEditProviderProps> = ({
  children,
  initialEditMode = false
}) => {
  const [editingState, setEditingState] = useState<EditingState>({});
  const [showEditMode, setShowEditMode] = useState(initialEditMode);

  const setEditing = useCallback((key: string, isEditing: boolean) => {
    setEditingState(prev => ({
      ...prev,
      [key]: isEditing
    }));
  }, []);

  const isAnyEditing = Object.values(editingState).some(Boolean);

  const toggleEditMode = useCallback(() => {
    if (showEditMode && isAnyEditing) {
      const confirmExit = window.confirm(
        'You have unsaved changes. Are you sure you want to exit edit mode?'
      );
      if (!confirmExit) return;
    }
    
    setShowEditMode(prev => !prev);
    if (!showEditMode) {
      // Clear all editing states when entering edit mode
      setEditingState({});
    }
  }, [showEditMode, isAnyEditing]);

  const saveAll = useCallback(async () => {
    // This would trigger save on all currently editing fields
    // Implementation depends on how we want to coordinate saves
    toast.success('All changes saved successfully');
  }, []);

  const revertAll = useCallback(() => {
    // This would trigger revert on all currently editing fields
    setEditingState({});
    toast.info('All changes reverted');
  }, []);

  const contextValue: InlineEditContextType = {
    editingState,
    setEditing,
    isAnyEditing,
    showEditMode,
    toggleEditMode,
    saveAll,
    revertAll
  };

  return (
    <InlineEditContext.Provider value={contextValue}>
      {children}
    </InlineEditContext.Provider>
  );
};

export default InlineEditProvider;
