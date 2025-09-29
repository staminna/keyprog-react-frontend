import { createContext, useContext, type ReactNode } from 'react'

export interface EditableContentContextType {
  isEditMode: boolean
  toggleEditMode: () => void
  canEdit: boolean
}

export interface EditableContentProviderProps {
  children: ReactNode
}

export const EditableContentContext = createContext<EditableContentContextType | undefined>(undefined)

export const useEditableContent = (): EditableContentContextType => {
  const context = useContext(EditableContentContext)
  if (context === undefined) {
    throw new Error('useEditableContent must be used within an EditableContentProvider')
  }
  return context
}
