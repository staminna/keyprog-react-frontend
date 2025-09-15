import { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { sessionDirectus } from '@/lib/directus';

/**
 * Hook to detect if the application is running inside Directus Visual Editor or is authenticated
 * 
 * This hook provides two main authentication paths for enabling editing capabilities:
 * 
 * 1. Directus Visual Editor Detection:
 *    - Checks if the application is running within an iframe from Directus
 *    - Looks for Directus-specific URL parameters and referrer information
 *    - Attempts to retrieve the parent Directus token for API operations
 * 
 * 2. Direct Directus Authentication:
 *    - Checks for an existing session token
 *    - Verifies the token is valid by making a test request
 *    - Falls back to stored credentials if no valid token exists
 * 
 * The hook returns authentication state that components can use to determine
 * if editing features should be enabled. Editing is allowed when either:
 * - The application is running in Directus Visual Editor mode, OR
 * - The user is authenticated directly with Directus
 * 
 * @returns Authentication state including isInDirectusEditor, isAuthenticated, and loading states
 */
export function useDirectusEditorContext() {
  const [isInDirectusEditor, setIsInDirectusEditor] = useState(false);
  const [parentToken, setParentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if the user is authenticated with Directus
  useEffect(() => {
    async function checkAuthentication() {
      try {
        // First check if we're in Directus Editor context
        if (isInDirectusEditor && parentToken) {
          // If we have a parent token from Directus Editor, we're authenticated
          setIsAuthenticated(true);
          setAuthChecked(true);
          return;
        }
        
        // Check for session token
        const token = await sessionDirectus.getToken();
        if (token) {
          // Verify the token is valid
          const isValid = await DirectusService.verifyToken();
          if (isValid) {
            setIsAuthenticated(true);
            setAuthChecked(true);
            return;
          }
        }
        
        // Check for stored credentials
        const storedEmail = localStorage.getItem('directus_auth_email');
        const storedPassword = localStorage.getItem('directus_auth_password');
        
        if (storedEmail && storedPassword) {
          const authenticated = await DirectusService.authenticate(storedEmail, storedPassword);
          setIsAuthenticated(authenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }
    
    // Only check authentication after we've determined if we're in Directus Editor
    if (!isLoading) {
      checkAuthentication();
    }
  }, [isInDirectusEditor, parentToken, isLoading]);

  useEffect(() => {
    async function detectDirectusEditor() {
      try {
        // Check if we're in an iframe and the parent has Directus context
        if (window.parent !== window) {
          // Check for Directus-specific indicators
          const isDirectusFrame = 
            window.location.search.includes('directus') ||
            document.referrer.includes('directus') ||
            (window.parent as Window & { location?: Location }).location?.href?.includes('directus');
          
          if (isDirectusFrame) {
            console.log('🎯 Detected Directus Visual Editor context');
            
            // Try to get the parent Directus token
            try {
              // Check if parent has Directus API or token available
              const parentDirectus = (window.parent as Window & { directus?: { getToken: () => string } }).directus;
              if (parentDirectus && typeof parentDirectus.getToken === 'function') {
                const token = await parentDirectus.getToken();
                if (token) {
                  console.log('🔑 Retrieved parent Directus token for write operations');
                  setParentToken(token);
                }
              }
              
              // Alternative: check for token in parent localStorage
              const parentLocalStorageToken = (window.parent as Window & { localStorage?: Storage }).localStorage?.getItem('directus_token');
              if (parentLocalStorageToken) {
                console.log('🔑 Retrieved parent Directus token from localStorage');
                setParentToken(parentLocalStorageToken);
              }
            } catch (tokenError) {
              console.warn('Could not retrieve parent Directus token:', tokenError);
            }
            
            setIsInDirectusEditor(true);
          }
        }
      } catch (error) {
        // Cross-origin restrictions - likely in iframe but can't access parent
        // This often happens in Directus Visual Editor
        if (window.parent !== window) {
          console.log('🎯 Detected iframe context - likely Directus Visual Editor');
        }
      } finally {
        setIsLoading(false);
      }
    }

    detectDirectusEditor();
  }, []); // Empty dependency array as this should only run once on mount

  return {
    isInDirectusEditor,
    parentToken,
    isLoading,
    isAuthenticated,
    authChecked
  };
}

export default useDirectusEditorContext;
