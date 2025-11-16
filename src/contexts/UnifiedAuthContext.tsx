import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';
import { UnifiedAuthContext } from '@/types/unifiedAuth';
import { sessionDirectus } from '@/lib/directus';
import type { UnifiedUser, UnifiedAuthContextType, UnifiedAuthProviderProps, UserRole } from '@/types/unifiedAuth';
import { clearAuthSession } from './authUtils';

// Re-export the context so hooks can import it from here
export { UnifiedAuthContext };

// Role IDs from environment variables
const ADMIN_ROLE_ID = import.meta.env.VITE_DIRECTUS_ADMIN_ROLE_ID;
const EDITOR_ROLE_ID = import.meta.env.VITE_DIRECTUS_EDITOR_ROLE_ID;
const CLIENTE_ROLE_ID = import.meta.env.VITE_DIRECTUS_CLIENTE_ROLE_ID;

// Determine role type from role ID or role object
const getRoleType = (roleIdOrObject: string | { id: string; name: string; admin_access?: boolean }): UserRole => {
  // Handle if passed a role object
  if (typeof roleIdOrObject === 'object' && roleIdOrObject !== null) {
    const roleName = roleIdOrObject.name.toLowerCase();
    const hasAdminAccess = roleIdOrObject.admin_access;

    // Check by admin_access flag first (most reliable)
    if (hasAdminAccess === true) {
      return 'administrator';
    }

    // Check by name patterns
    if (roleName.includes('admin')) return 'administrator';
    if (roleName.includes('editor') || roleName.includes('edit')) return 'editor';
    if (roleName.includes('cliente') || roleName.includes('client') || roleName.includes('customer')) return 'cliente';

    console.warn('⚠️ Unknown role name:', roleName);
    return null;
  }

  // Handle if passed a role ID string
  const roleId = roleIdOrObject as string;

  // First check environment variable IDs
  if (roleId === ADMIN_ROLE_ID) return 'administrator';
  if (roleId === EDITOR_ROLE_ID) return 'editor';
  if (roleId === CLIENTE_ROLE_ID) return 'cliente';

  // If not found in env vars, check if we can infer from the user's role data
  // This is a fallback for when role IDs don't match environment variables
  console.warn('⚠️ Role ID not found in environment variables:', roleId);
  console.warn('💡 You may need to update your .env file with the correct role IDs from Directus');

  // Return null and let DirectusService.getCurrentUser handle the fallback
  return null;
};

// Check if we're in Directus Visual Editor
const isInDirectusVisualEditor = (): boolean => {
  try {
    const isInIframe = window.self !== window.top;
    const referrer = document.referrer;
    const isFromDirectus = referrer.includes('localhost:8065') || referrer.includes('/admin/');
    return isInIframe && isFromDirectus;
  } catch {
    return false;
  }
};

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UnifiedUser | null>(null);

  // Computed permissions based on role
  const canEdit = useMemo(() => {
    // ONLY Administrator and Editor roles can use inline editor
    const hasEditRole = user?.role === 'administrator' || user?.role === 'editor';
    // Logging disabled to reduce console noise
    return hasEditRole && isAuthenticated;
  }, [user?.role, isAuthenticated]);

  const canUpload = useMemo(() => {
    return user?.role === 'cliente' || user?.role === 'administrator';
  }, [user?.role]);

  const canAdmin = useMemo(() => {
    return user?.role === 'administrator';
  }, [user?.role]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // PRIORITY 1: Check for existing session token FIRST (for regular user login persistence)
      try {
        const token = await sessionDirectus.getToken();
        if (token) {
          console.log('🔍 Found existing session token, verifying...');
          const isValid = await DirectusService.verifyToken();
          if (isValid) {
            const userInfo = await DirectusService.getCurrentUser();
            console.log('📋 User info retrieved:', {
              hasUser: !!userInfo,
              hasRoleId: !!userInfo?.roleId,
              roleId: userInfo?.roleId
            });
            
            if (userInfo && userInfo.roleId) {
              const roleType = getRoleType(userInfo.roleId);
              
              setUser({
                id: userInfo.id || '',
                email: userInfo.email || '',
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                role: roleType,
                roleId: userInfo.roleId,
                authenticated: true,
              });
              setIsAuthenticated(true);
              console.log('✅ Session auth successful:', roleType);
              return true;
            } else {
              console.warn('⚠️ User info incomplete - missing roleId or user data');
            }
          } else {
            console.log('⚠️ Session token invalid, clearing...');
            await clearAuthSession();
          }
        }
      } catch (tokenError) {
        console.warn('Error checking session token:', tokenError);
        await clearAuthSession();
      }
      
      // PRIORITY 2: Auto-authenticate for Directus Visual Editor (only if no session exists)
      if (isInDirectusVisualEditor()) {
        console.log('🎯 Detected Directus Visual Editor - auto-authenticating...');
        const envEmail = import.meta.env.VITE_DIRECTUS_EMAIL;
        const envPassword = import.meta.env.VITE_DIRECTUS_PASSWORD;
        
        if (envEmail && envPassword) {
          const success = await DirectusService.authenticate(envEmail, envPassword);
          if (success) {
            const userInfo = await DirectusService.getCurrentUser();
            if (userInfo && userInfo.roleId) {
              const roleType = getRoleType(userInfo.roleId);
              
              // Only allow admin/editor in Visual Editor
              if (roleType === 'administrator' || roleType === 'editor') {
                setUser({
                  id: userInfo.id || '',
                  email: userInfo.email || '',
                  firstName: userInfo.firstName,
                  lastName: userInfo.lastName,
                  role: roleType,
                  roleId: userInfo.roleId,
                  authenticated: true,
                });
                setIsAuthenticated(true);
                console.log('✅ Visual Editor auto-auth successful:', roleType);
                return true;
              }
            }
          }
        }
      }
      
      // No authentication found
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const success = await DirectusService.authenticate(email, password);
      
      if (success) {
        const userInfo = await DirectusService.getCurrentUser();
        if (userInfo && userInfo.roleId) {
          const roleType = getRoleType(userInfo.roleId);
          
          setUser({
            id: userInfo.id || '',
            email: userInfo.email || '',
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            role: roleType,
            roleId: userInfo.roleId,
            authenticated: true,
          });
          setIsAuthenticated(true);
          console.log('✅ Login successful:', { role: roleType });
          return true;
        }
      }
      
      setIsAuthenticated(false);
      setUser(null);
      await clearAuthSession();
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      await DirectusService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const updateProfile = async (data: Partial<UnifiedUser>): Promise<boolean> => {
    if (!user || !user.id) {
      console.error('No user logged in');
      return false;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await sessionDirectus.getToken()}`
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          telefone: data.telefone,
          morada: data.morada,
          cidade: data.cidade,
          codigo_postal: data.codigo_postal,
          pais: data.pais,
          nif: data.nif,
          nome_empresa: data.nome_empresa,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setUser(prev => prev ? { ...prev, ...data } : null);
      console.log('✅ Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Logout synchronization with Directus Visual Editor
  useEffect(() => {
    // Only monitor logout in Directus Visual Editor
    if (!isInDirectusVisualEditor()) {
      return;
    }

    console.log('🔍 Monitoring Directus Visual Editor logout...');

    // Method 1: Poll for token validity every 5 seconds
    const tokenCheckInterval = setInterval(async () => {
      try {
        const token = await sessionDirectus.getToken();
        
        if (!token) {
          console.log('🚪 Directus logged out - no token found, logging out React app...');
          await logout();
          return;
        }

        // Verify token is still valid
        const isValid = await DirectusService.verifyToken();
        if (!isValid) {
          console.log('🚪 Directus logged out - token invalid, logging out React app...');
          await logout();
        }
      } catch (error) {
        console.error('Error checking token validity:', error);
        // If there's an error checking, assume logged out
        await logout();
      }
    }, 5000); // Check every 5 seconds

    // Method 2: Listen for storage events (when Directus clears auth)
    const handleStorageChange = (e: StorageEvent) => {
      // Check if Directus auth token was removed
      if (e.key === 'directus-token' && e.newValue === null) {
        console.log('🚪 Directus logged out - storage event detected, logging out React app...');
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      clearInterval(tokenCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);

  const value: UnifiedAuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    canEdit,
    canUpload,
    canAdmin,
    login,
    logout,
    checkAuth,
    updateProfile,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};
