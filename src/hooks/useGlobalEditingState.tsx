import React, { useState, useCallback, useContext, createContext, ReactNode } from 'react';

interface GlobalEditingState {
  editingSessions: Set<string>;
  updatingSessions: Set<string>;
  isAnyEditing: boolean;
  isAnyUpdating: boolean;
}

interface GlobalEditingContextType {
  state: GlobalEditingState;
  startEditing: (sessionId: string) => void;
  stopEditing: (sessionId: string) => void;
  startUpdating: (sessionId: string) => void;
  stopUpdating: (sessionId: string) => void;
  isEditing: (sessionId: string) => boolean;
  isUpdating: (sessionId: string) => boolean;
}

const GlobalEditingContext = createContext<GlobalEditingContextType | null>(null);

export const GlobalEditingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalEditingState>({
    editingSessions: new Set(),
    updatingSessions: new Set(),
    isAnyEditing: false,
    isAnyUpdating: false,
  });

  const startEditing = useCallback((sessionId: string) => {
    setState(prev => {
      const newEditingSessions = new Set(prev.editingSessions);
      newEditingSessions.add(sessionId);
      return {
        ...prev,
        editingSessions: newEditingSessions,
        isAnyEditing: newEditingSessions.size > 0,
      };
    });
  }, []);

  const stopEditing = useCallback((sessionId: string) => {
    setState(prev => {
      const newEditingSessions = new Set(prev.editingSessions);
      newEditingSessions.delete(sessionId);
      return {
        ...prev,
        editingSessions: newEditingSessions,
        isAnyEditing: newEditingSessions.size > 0,
      };
    });
  }, []);

  const startUpdating = useCallback((sessionId: string) => {
    setState(prev => {
      const newUpdatingSessions = new Set(prev.updatingSessions);
      newUpdatingSessions.add(sessionId);
      return {
        ...prev,
        updatingSessions: newUpdatingSessions,
        isAnyUpdating: newUpdatingSessions.size > 0,
      };
    });
  }, []);

  const stopUpdating = useCallback((sessionId: string) => {
    setState(prev => {
      const newUpdatingSessions = new Set(prev.updatingSessions);
      newUpdatingSessions.delete(sessionId);
      return {
        ...prev,
        updatingSessions: newUpdatingSessions,
        isAnyUpdating: newUpdatingSessions.size > 0,
      };
    });
  }, []);

  const isEditing = useCallback((sessionId: string) => {
    return state.editingSessions.has(sessionId);
  }, [state.editingSessions]);

  const isUpdating = useCallback((sessionId: string) => {
    return state.updatingSessions.has(sessionId);
  }, [state.updatingSessions]);

  const contextValue: GlobalEditingContextType = {
    state,
    startEditing,
    stopEditing,
    startUpdating,
    stopUpdating,
    isEditing,
    isUpdating,
  };

  return (
    <GlobalEditingContext.Provider value={contextValue}>
      {children}
    </GlobalEditingContext.Provider>
  );
};

export const useGlobalEditingState = () => {
  const context = useContext(GlobalEditingContext);
  if (!context) {
    throw new Error('useGlobalEditingState must be used within a GlobalEditingProvider');
  }
  return context;
};

export default useGlobalEditingState;
