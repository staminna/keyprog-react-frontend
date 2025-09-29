import { createContext, useContext, type ReactNode } from 'react'

export interface InlineEditorContextType {
  isInlineEditingEnabled: boolean
  setInlineEditingEnabled: (enabled: boolean) => void
}

export interface InlineEditorProviderProps {
  children: ReactNode
}

export const InlineEditorContext = createContext<InlineEditorContextType | undefined>(undefined)

export const useInlineEditor = () => {
  const context = useContext(InlineEditorContext)
  if (!context) {
    throw new Error('useInlineEditor must be used within an InlineEditorProvider')
  }
  return context
}
