import React, { useState, useMemo, useEffect, useCallback } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import {
  InlineEditorContext,
  type InlineEditorContextType,
  type InlineEditorProviderProps,
} from './inline-editor-context';

const INLINE_EDITING_ENABLED_KEY = 'inline-editor-enabled';
const INLINE_EDITING_OVERRIDE_KEY = 'inline-editor-override';

/**
 * InlineEditorProvider component
 * This component provides a context to enable or disable inline editing across the application.
 * It replaces the old sidebar-based EditorActivator.
 */
export const InlineEditorProvider: React.FC<InlineEditorProviderProps> = ({ children }) => {
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const devOverride = import.meta.env.DEV || import.meta.env.VITE_FORCE_INLINE_EDITING === 'true';

  const [manualOverride, setManualOverride] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return devOverride;
    }

    const stored = window.localStorage.getItem(INLINE_EDITING_OVERRIDE_KEY);
    if (stored === null) {
      return devOverride;
    }

    return stored === 'true';
  });

  const canEverEnableEditing = isInDirectusEditor || isAuthenticated || manualOverride;

  const [isInlineEditingEnabled, setInlineEditingEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return canEverEnableEditing;
    }

    const stored = window.localStorage.getItem(INLINE_EDITING_ENABLED_KEY);
    if (stored !== null) {
      return stored === 'true';
    }

    return canEverEnableEditing;
  });

  // Persist manual override choice
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(INLINE_EDITING_OVERRIDE_KEY, manualOverride ? 'true' : 'false');
  }, [manualOverride]);

  // Persist enabled state
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(INLINE_EDITING_ENABLED_KEY, isInlineEditingEnabled ? 'true' : 'false');
  }, [isInlineEditingEnabled]);

  // Auto-enable when capabilities become available OR when accessed from Directus Visual Editor
  useEffect(() => {
    // Check if we're in an iframe (Directus Visual Editor context)
    const isInIframe = window.self !== window.top;
    
    // Auto-enable if:
    // 1. User can edit AND editing is not enabled yet, OR
    // 2. We're in an iframe (likely Directus Visual Editor)
    if ((canEverEnableEditing && !isInlineEditingEnabled) || (isInIframe && isInDirectusEditor)) {
      setInlineEditingEnabledState(true);
    }

    if (!canEverEnableEditing && isInlineEditingEnabled) {
      setInlineEditingEnabledState(false);
    }
  }, [canEverEnableEditing, isInlineEditingEnabled, isInDirectusEditor, isAuthenticated, manualOverride]);

  const setInlineEditingEnabled = useCallback<InlineEditorContextType['setInlineEditingEnabled']>((enabled) => {
    setInlineEditingEnabledState(enabled);

    if (enabled) {
      setManualOverride((current) => {
        if (current) {
          return current;
        }

        if (isInDirectusEditor || isAuthenticated) {
          return current;
        }

        return true;
      });
      return;
    }

    // Disable override when turning editing off outside Directus
    if (!isInDirectusEditor && !isAuthenticated) {
      setManualOverride(false);
    }
  }, [isAuthenticated, isInDirectusEditor]);

  const value = useMemo<InlineEditorContextType>(() => ({
    isInlineEditingEnabled: canEverEnableEditing && isInlineEditingEnabled,
    setInlineEditingEnabled,
  }), [canEverEnableEditing, isInlineEditingEnabled, setInlineEditingEnabled]);

  // Listen for Directus toolbar toggle events forwarded by visualEditorBridge.js
  useEffect(() => {
    const handleToggle = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      if (event.data.type === 'directus-inline-editing-toggle' && typeof event.data.enabled === 'boolean') {
        setInlineEditingEnabled(event.data.enabled);
      }
    };

    window.addEventListener('message', handleToggle);

    return () => {
      window.removeEventListener('message', handleToggle);
    };
  }, [setInlineEditingEnabled]);

  return (
    <InlineEditorContext.Provider value={value}>
      {children}
    </InlineEditorContext.Provider>
  );
};

export default InlineEditorProvider;
