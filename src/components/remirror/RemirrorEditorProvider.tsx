import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  RemirrorEditorContext,
  type RemirrorEditorContextType,
  type RemirrorEditorProviderProps,
  type EditingState,
} from './remirror-editor-context';

export const RemirrorEditorProvider: React.FC<RemirrorEditorProviderProps> = ({
  children,
  initialEditMode = false
}) => {
  const [editingState, setEditingState] = useState<EditingState>({});
  const [showEditMode, setShowEditMode] = useState(initialEditMode);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});

  const isAnyEditing = Object.values(editingState).some(Boolean);

  const setEditing = useCallback((key: string, isEditing: boolean) => {
    setEditingState(prev => ({
      ...prev,
      [key]: isEditing
    }));
  }, []);

  const setPendingChange = useCallback((key: string, value: unknown) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearPendingChange = useCallback((key: string) => {
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[key];
      return newChanges;
    });
  }, []);

  const saveAll = useCallback(() => {
    // This would be implemented to save all pending changes
    // For now, just clear the editing state
    setEditingState({});
    setPendingChanges({});
    toast.success('All changes saved');
  }, []);

  const revertAll = useCallback(() => {
    // Revert all changes by clearing editing state and pending changes
    setEditingState({});
    setPendingChanges({});
    toast.info('All changes reverted');
  }, []);

  const contextValue: RemirrorEditorContextType = {
    editingState,
    setEditing,
    isAnyEditing,
    showEditMode,
    setShowEditMode,
    saveAll,
    revertAll,
    pendingChanges,
    setPendingChange,
    clearPendingChange
  };

  return (
    <RemirrorEditorContext.Provider value={contextValue}>
      {children}
    </RemirrorEditorContext.Provider>
  );
};

export default RemirrorEditorProvider;
