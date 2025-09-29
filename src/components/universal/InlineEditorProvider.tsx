import React, { useState, useMemo, useEffect } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import {
  InlineEditorContext,
  type InlineEditorContextType,
  type InlineEditorProviderProps,
} from './inline-editor-context';

/**
 * InlineEditorProvider component
 * This component provides a context to enable or disable inline editing across the application.
 * It replaces the old sidebar-based EditorActivator.
 */
export const InlineEditorProvider: React.FC<InlineEditorProviderProps> = ({ children }) => {
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEverEnableEditing = isInDirectusEditor || isAuthenticated;

  const [isInlineEditingEnabled, setInlineEditingEnabled] = useState(false);

  // Enable inline editing when authentication is available
  useEffect(() => {
    if (canEverEnableEditing && !isInlineEditingEnabled) {
      setInlineEditingEnabled(true);
    }
  }, [canEverEnableEditing, isInlineEditingEnabled]);

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
