import React, { createContext, useContext, useState, ReactNode } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

interface EditableContentContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
}

const EditableContentContext = createContext<EditableContentContextType | undefined>(undefined);

interface EditableContentProviderProps {
  children: ReactNode;
}

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

export const useEditableContent = (): EditableContentContextType => {
  const context = useContext(EditableContentContext);
  if (context === undefined) {
    throw new Error('useEditableContent must be used within an EditableContentProvider');
  }
  return context;
};

