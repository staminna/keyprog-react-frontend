import { useState, useEffect, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';
import { sessionDirectus } from '@/lib/directus';

export function useDirectusEditorContext() {
  const [isInDirectusEditor, setIsInDirectusEditor] = useState(false);
  const [parentToken, setParentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [directusUserId, setDirectusUserId] = useState<string | null>(null);
  const [directusUserRole, setDirectusUserRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const isRoleAllowed = useCallback((roleId: string | null | undefined) => {
    return !!roleId; // If user has a role, they can edit
  }, []);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        // Check Directus editor context first
        if (isInDirectusEditor && parentToken) {
          const currentUser = await DirectusService.getCurrentUser({ token: parentToken });
          setDirectusUserId(currentUser?.id ?? null);
          const userRoleId = currentUser?.roleId || currentUser?.role;
          setDirectusUserRole(userRoleId ?? null);
          setIsAuthenticated(!!userRoleId && isRoleAllowed(userRoleId));
          setAuthChecked(true);
          return;
        }
        
        // Check session token
        const token = await sessionDirectus.getToken();
        if (token) {
          const isValid = await DirectusService.verifyToken();
          if (isValid) {
            const currentUser = await DirectusService.getCurrentUser();
            setDirectusUserId(currentUser?.id ?? null);
            const userRoleId = currentUser?.roleId || currentUser?.role;
            setDirectusUserRole(userRoleId ?? null);
            setIsAuthenticated(!!userRoleId && isRoleAllowed(userRoleId));
            setAuthChecked(true);
            return;
          }
        }
        
        // Check localStorage credentials
        const storedEmail = localStorage.getItem('directus_auth_email');
        const storedPassword = localStorage.getItem('directus_auth_password');
        
        if (storedEmail && storedPassword) {
          const authenticated = await DirectusService.authenticate(storedEmail, storedPassword);
          if (authenticated) {
            const currentUser = await DirectusService.getCurrentUser();
            setDirectusUserId(currentUser?.id ?? null);
            const userRoleId = currentUser?.roleId || currentUser?.role;
            setDirectusUserRole(userRoleId ?? null);
            setIsAuthenticated(!!userRoleId && isRoleAllowed(userRoleId));
            setAuthChecked(true);
            return;
          }
        }
        
        // Try .env credentials
        const envEmail = import.meta.env.VITE_DIRECTUS_EMAIL;
        const envPassword = import.meta.env.VITE_DIRECTUS_PASSWORD;
        
        if (envEmail && envPassword) {
          const authenticated = await DirectusService.authenticate(envEmail, envPassword);
          if (authenticated) {
            const currentUser = await DirectusService.getCurrentUser();
            setDirectusUserId(currentUser?.id ?? null);
            const userRoleId = currentUser?.roleId || currentUser?.role;
            setDirectusUserRole(userRoleId ?? null);
            setIsAuthenticated(!!userRoleId && isRoleAllowed(userRoleId));
            setAuthChecked(true);
            return;
          }
        }
        
        setIsAuthenticated(false);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }
    
    if (!isLoading) {
      checkAuthentication();
    }
  }, [isInDirectusEditor, parentToken, isLoading, isRoleAllowed]);

  useEffect(() => {
    async function detectDirectusEditor() {
      try {
        if (window.parent !== window) {
          const isDirectusFrame = 
            window.location.search.includes('directus') ||
            document.referrer.includes('directus') ||
            (window.parent as Window & { location?: Location }).location?.href?.includes('directus');
          
          if (isDirectusFrame) {
            try {
              const parentDirectus = (window.parent as Window & { directus?: { getToken: () => string } }).directus;
              if (parentDirectus && typeof parentDirectus.getToken === 'function') {
                const token = await parentDirectus.getToken();
                if (token) setParentToken(token);
              }
              
              const parentLocalStorageToken = (window.parent as Window & { localStorage?: Storage }).localStorage?.getItem('directus_token');
              if (parentLocalStorageToken) setParentToken(parentLocalStorageToken);
            } catch (tokenError) {
              // Cross-origin - ignore
            }
            
            setIsInDirectusEditor(true);
          }
        }
      } catch (error) {
        // Likely in iframe but cross-origin
      } finally {
        setIsLoading(false);
      }
    }

    detectDirectusEditor();
  }, []);

  return {
    isInDirectusEditor,
    parentToken,
    isLoading,
    isAuthenticated,
    authChecked,
    directusUserId,
    directusUserRole
  };
}

export default useDirectusEditorContext;
