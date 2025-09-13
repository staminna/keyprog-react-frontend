import { createContext } from 'react';

export interface EditableContentContextType {
  isEditing: boolean;
  toggleEditing: () => void;
  setIsEditing: (isEditing: boolean) => void;
  canEdit: boolean;
}

export const EditableContentContext = createContext<EditableContentContextType | undefined>(undefined);
