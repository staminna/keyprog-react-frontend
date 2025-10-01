import { useState, useEffect } from 'react';

/**
 * DEPRECATED: This hook is kept for backward compatibility only.
 * Use useUnifiedAuth instead for all authentication needs.
 * 
 * This simplified version runs silently in the background.
 */
export function useDirectusEditorContext() {
  const [isInDirectusEditor, setIsInDirectusEditor] = useState(false);

  useEffect(() => {
    // Minimal detection without logging
    const inIframe = window.parent !== window;
    if (inIframe) {
      const referrer = document.referrer;
      setIsInDirectusEditor(
        referrer.includes('localhost:8065') || 
        referrer.includes('/admin/')
      );
    }
  }, []);

  return {
    isInDirectusEditor,
    parentToken: null,
    isLoading: false,
    isAuthenticated: false,
    authChecked: true,
    directusUserId: null,
    directusUserRole: null
  };
}

export default useDirectusEditorContext;
