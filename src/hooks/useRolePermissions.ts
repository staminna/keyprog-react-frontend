import { useState, useEffect, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';
import { sessionDirectus } from '@/lib/directus';

export const useRolePermissions = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoleId, setUserRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        // First check if we have a session token
        const token = await sessionDirectus.getToken();
        console.log('🔑 useRolePermissions: Session token exists:', !!token);
        
        if (!token) {
          console.log('❌ useRolePermissions: No session token found');
          setIsAuthenticated(false);
          setUserRole(null);
          setUserRoleId(null);
          setIsLoading(false);
          return;
        }
        
        // Verify token is valid
        const isValid = await DirectusService.verifyToken();
        console.log('🔐 useRolePermissions: Token valid:', isValid);
        
        if (!isValid) {
          console.log('❌ useRolePermissions: Token invalid');
          setIsAuthenticated(false);
          setUserRole(null);
          setUserRoleId(null);
          setIsLoading(false);
          return;
        }
        
        // Get user info
        const user = await DirectusService.getCurrentUser();
        console.log('👤 useRolePermissions: User data:', user);
        
        if (user) {
          const authenticated = !!user;
          setIsAuthenticated(authenticated);
          setUserRole(user?.role || null);
          setUserRoleId(user?.roleId || null);
          console.log('✅ useRolePermissions: Auth successful', {
            authenticated,
            role: user?.role,
            roleId: user?.roleId
          });
        } else {
          console.log('❌ useRolePermissions: No user data returned');
          setIsAuthenticated(false);
          setUserRole(null);
          setUserRoleId(null);
        }
      } catch (error) {
        console.error('❌ useRolePermissions: Error during auth check:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserRoleId(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  // Check if user has editor or admin role
  const isEditorOrAdmin = useCallback(() => {
    if (!isAuthenticated || !userRoleId) {
      console.log('❌ isEditorOrAdmin: Not authenticated or no roleId', { isAuthenticated, userRoleId });
      return false;
    }
    
    // Allowed role IDs from .env
    const editorRoleId = import.meta.env.VITE_DIRECTUS_ALLOWED_EDITOR_ROLES;
    const allowedRoles = editorRoleId ? editorRoleId.split(',').map((id: string) => id.trim()) : [];
    
    console.log('🔐 Role Check:', {
      userRoleId,
      allowedRoles,
      editorRoleEnv: editorRoleId
    });
    
    // SECURITY: Block Cliente role explicitly
    const clienteRoleId = import.meta.env.VITE_DIRECTUS_CLIENTE_ROLE_ID;
    if (userRoleId === clienteRoleId) {
      console.log('🚫 Blocked: User has Cliente role');
      return false;
    }
    
    // Check if user's role ID is in allowed list
    const hasPermission = allowedRoles.includes(userRoleId);
    console.log('✅ Permission result:', hasPermission);
    return hasPermission;
  }, [isAuthenticated, userRoleId]);
  
  const canEditContent = useCallback(() => isEditorOrAdmin(), [isEditorOrAdmin]);
  const canEditCollection = useCallback(() => isEditorOrAdmin(), [isEditorOrAdmin]);
  
  return {
    userRole: userRole || 'public',
    isLoading,
    canEditContent,
    canEditCollection,
    isAdmin: userRole === 'Administrator',
    isEditor: isAuthenticated,
    isAuthenticated
  };
};

export default useRolePermissions;
