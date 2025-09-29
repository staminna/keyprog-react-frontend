import { createContext, useContext, type ReactNode } from 'react'

export interface GlobalEditingState {
  editingSessions: Set<string>
  updatingSessions: Set<string>
  isAnyEditing: boolean
  isAnyUpdating: boolean
}

export interface GlobalEditingContextType {
  state: GlobalEditingState
  startEditing: (sessionId: string) => void
  stopEditing: (sessionId: string) => void
  startUpdating: (sessionId: string) => void
  stopUpdating: (sessionId: string) => void
  isEditing: (sessionId: string) => boolean
  isUpdating: (sessionId: string) => boolean
}

export interface GlobalEditingProviderProps {
  children: ReactNode
}

export const GlobalEditingContext = createContext<GlobalEditingContextType | null>(null)

export const useGlobalEditingState = () => {
  const context = useContext(GlobalEditingContext)
  if (!context) {
    throw new Error('useGlobalEditingState must be used within a GlobalEditingProvider')
  }
  return context
}
