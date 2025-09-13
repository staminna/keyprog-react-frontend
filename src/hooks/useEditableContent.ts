import { useContext } from 'react';
import { EditableContentContext, EditableContentContextType } from '@/contexts/EditableContentTypes';

export const useEditableContent = () => {
  const context = useContext(EditableContentContext);
  if (context === undefined) {
    throw new Error('useEditableContent must be used within an EditableContentProvider');
  }
  return context;
};
