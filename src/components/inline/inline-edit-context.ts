import { createContext, useContext, type ReactNode } from "react"

export interface EditingState {
  [key: string]: boolean
}

export interface InlineEditContextType {
  editingState: EditingState
  setEditing: (key: string, isEditing: boolean) => void
  isAnyEditing: boolean
  showEditMode: boolean
  toggleEditMode: () => void
  saveAll: () => Promise<void>
  revertAll: () => void
}

export interface InlineEditProviderProps {
  children: ReactNode
  initialEditMode?: boolean
}

export const InlineEditContext = createContext<InlineEditContextType | undefined>(
  undefined
)

export const useInlineEditContext = () => {
  const context = useContext(InlineEditContext)
  if (!context) {
    throw new Error("useInlineEditContext must be used within InlineEditProvider")
  }
  return context
}
