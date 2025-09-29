import { createContext, useContext, type ReactNode } from 'react'

export interface EditingState {
  [key: string]: boolean // collection:itemId:field -> isEditing
}

export interface RemirrorEditorContextType {
  isAnyEditing: boolean
  showEditMode: boolean
  setShowEditMode: (show: boolean) => void
  editingState: EditingState
  setEditing: (key: string, isEditing: boolean) => void
  saveAll: () => void
  revertAll: () => void
  pendingChanges: Record<string, unknown>
  setPendingChange: (key: string, value: unknown) => void
  clearPendingChange: (key: string) => void
}

export interface RemirrorEditorProviderProps {
  children: ReactNode
  initialEditMode?: boolean
}

export const RemirrorEditorContext = createContext<RemirrorEditorContextType | undefined>(undefined)

export const useRemirrorEditorContext = () => {
  const context = useContext(RemirrorEditorContext)
  if (!context) {
    throw new Error('useRemirrorEditorContext must be used within RemirrorEditorProvider')
  }
  return context
}
