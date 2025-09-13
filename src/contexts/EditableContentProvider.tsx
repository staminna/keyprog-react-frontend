import React, { useState, ReactNode } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import { EditableContentContext } from './EditableContentTypes';

interface EditableContentProviderProps {
  children: ReactNode;
}

export const EditableContentProvider: React.FC<EditableContentProviderProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  
  // Determine if editing should be enabled
  const canEdit = isInDirectusEditor || isAuthenticated;
  
  const toggleEditing = () => {
    setIsEditing(prev => !prev);
  };
  
  return (
    <EditableContentContext.Provider 
      value={{ 
        isEditing, 
        toggleEditing, 
        setIsEditing, 
        canEdit 
      }}
    >
      {children}
    </EditableContentContext.Provider>
  );
};
