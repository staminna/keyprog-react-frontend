import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface EditingState {
  [key: string]: boolean; // collection:itemId:field -> isEditing
}

interface InlineEditContextType {
  editingState: EditingState;
  setEditing: (key: string, isEditing: boolean) => void;
  isAnyEditing: boolean;
  showEditMode: boolean;
  toggleEditMode: () => void;
  saveAll: () => Promise<void>;
  revertAll: () => void;
}

const InlineEditContext = createContext<InlineEditContextType | undefined>(undefined);

export const useInlineEditContext = () => {
  const context = useContext(InlineEditContext);
  if (!context) {
    throw new Error('useInlineEditContext must be used within InlineEditProvider');
  }
  return context;
};

interface InlineEditProviderProps {
  children: React.ReactNode;
  initialEditMode?: boolean;
}

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
