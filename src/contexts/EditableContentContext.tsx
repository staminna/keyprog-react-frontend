import React, { useState } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

import {
  EditableContentContext,
  type EditableContentContextType,
  type EditableContentProviderProps,
} from './editable-content-utils';

export const EditableContentProvider: React.FC<EditableContentProviderProps> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  
  // Determine if editing should be enabled
  const canEdit = isInDirectusEditor || isAuthenticated;
  
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };
  
  return (
    <EditableContentContext.Provider value={{ isEditMode, toggleEditMode, canEdit }}>
      {children}
    </EditableContentContext.Provider>
  );
};


