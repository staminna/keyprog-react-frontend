import React, { createContext, useContext, useState, useMemo } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

interface InlineEditorContextType {
  isInlineEditingEnabled: boolean;
  setInlineEditingEnabled: (enabled: boolean) => void;
}

const InlineEditorContext = createContext<InlineEditorContextType | undefined>(undefined);

export const useInlineEditor = () => {
  const context = useContext(InlineEditorContext);
  if (!context) {
    throw new Error('useInlineEditor must be used within an InlineEditorProvider');
  }
  return context;
};

/**
 * InlineEditorProvider component
 * This component provides a context to enable or disable inline editing across the application.
 * It replaces the old sidebar-based EditorActivator.
 */
export const InlineEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEverEnableEditing = isInDirectusEditor || isAuthenticated;

  const [isInlineEditingEnabled, setInlineEditingEnabled] = useState(false);

  const value = useMemo(() => ({
    isInlineEditingEnabled: canEverEnableEditing && isInlineEditingEnabled,
    setInlineEditingEnabled,
  }), [canEverEnableEditing, isInlineEditingEnabled]);

  return (
    <InlineEditorContext.Provider value={value}>
      {children}
    </InlineEditorContext.Provider>
  );
};

export default InlineEditorProvider;
