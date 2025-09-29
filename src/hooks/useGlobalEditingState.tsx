import React, { useState, useCallback } from 'react';

import {
  GlobalEditingContext,
  type GlobalEditingState,
  type GlobalEditingContextType,
  type GlobalEditingProviderProps,
} from './global-editing-utils';

export const GlobalEditingProvider: React.FC<GlobalEditingProviderProps> = ({ children }) => {
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

