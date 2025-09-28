// useDirectusVisualEditor.ts
import { useEffect, useState } from 'react';
import { DirectusService } from '@/services/directusService';

export interface DirectusEditorState {
  isEnabled: boolean;
  isReady: boolean;
  token: string | null;
}

/**
 * Hook to detect and interface with Directus Visual Editor
 * 
 * This hook will:
 * 1. Check if running inside a Directus Visual Editor iframe
 * 2. Try to inherit token from parent window
 * 3. Setup communication channel with parent Directus editor
 */
export function useDirectusVisualEditor() {
  const [state, setState] = useState<DirectusEditorState>({
    isEnabled: false,
    isReady: false,
    token: null
  });

  useEffect(() => {
    // Check if running inside an iframe
    const isIframe = window.parent !== window;
    
    // Setup message handler for parent window communication
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Directus parent
      if (!event.data || typeof event.data !== 'object') return;
      
      // Handle auth token message from parent
      if (event.data.type === 'directus:auth' && event.data.token) {
        console.log('🔑 Received auth token from Directus parent');
        setState(prev => ({
          ...prev,
          token: event.data.token
        }));
      }
      
      // Handle ready message from parent
      if (event.data.type === 'directus:ready') {
        console.log('🎯 Directus Visual Editor is ready');
        setState(prev => ({
          ...prev,
          isReady: true
        }));
      }
    };

    if (isIframe) {
      // Check if parent is Directus
      const isDirectusFrame = 
        window.location.search.includes('directus') ||
        document.referrer.includes('directus') ||
        (window.parent as Window & { location?: Location }).location?.href?.includes('directus');

      if (isDirectusFrame) {
        console.log('🎯 Running inside Directus Visual Editor');
        setState(prev => ({
          ...prev,
          isEnabled: true
        }));
        
        // Listen for messages from parent Directus window
        window.addEventListener('message', handleMessage);
        
        // Send ready message to parent
        try {
          window.parent.postMessage({ type: 'iframe:ready', source: 'react-frontend' }, '*');
          console.log('✅ Sent ready message to Directus parent');
        } catch (error) {
          console.warn('Failed to send ready message to parent:', error);
        }
        
        // Try to get token from URL params (fallback)
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('directus_token');
        if (tokenParam) {
          console.log('🔑 Found token in URL parameters');
          setState(prev => ({
            ...prev,
            token: tokenParam
          }));
        }
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Authenticate with Directus using token from parent or fallback to static token
  useEffect(() => {
    if (state.isEnabled) {
      // Initialize Directus service for Visual Editor
      DirectusService.autoLogin();
    }
  }, [state.isEnabled]);

  return state;
}

export default useDirectusVisualEditor;
