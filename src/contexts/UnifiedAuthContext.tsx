import React, { useState, useEffect, useMemo } from 'react';
import { DirectusService } from '@/services/directusService';
import { UnifiedAuthContext } from '@/types/unifiedAuth';
import { sessionDirectus } from '@/lib/directus';
import type { UnifiedUser, UnifiedAuthContextType, UnifiedAuthProviderProps, UserRole } from '@/types/unifiedAuth';

// Helper function to clear session
export const clearAuthSession = async () => {
  try {
    await sessionDirectus.setToken(null);
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
};

// Re-export the context so hooks can import it from here
export { UnifiedAuthContext };

// Role IDs from .env
const ADMIN_ROLE_ID = '0582d74b-a83f-4076-849f-b588e627c868';
const EDITOR_ROLE_ID = '97ef35d8-3d16-458d-8c93-78e35b7105a4';
const CLIENTE_ROLE_ID = import.meta.env.VITE_DIRECTUS_CLIENTE_ROLE_ID || '6c969db6-03d6-4240-b944-d0ba2bc56fc4';

// Determine role type from role ID
const getRoleType = (roleId: string): UserRole => {
  if (roleId === ADMIN_ROLE_ID) return 'administrator';
  if (roleId === EDITOR_ROLE_ID) return 'editor';
  if (roleId === CLIENTE_ROLE_ID) return 'cliente';
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
    return user?.role === 'administrator' || user?.role === 'editor';
  }, [user?.role]);

  const canUpload = useMemo(() => {
    return user?.role === 'cliente';
  }, [user?.role]);

  const canAdmin = useMemo(() => {
    return user?.role === 'administrator';
  }, [user?.role]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // PRIORITY 1: Auto-authenticate for Directus Visual Editor
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
      
      // PRIORITY 2: Check for existing session token (normal user login)
      try {
        const token = await sessionDirectus.getToken();
        if (token) {
          const isValid = await DirectusService.verifyToken();
          if (isValid) {
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
              console.log('✅ Session auth successful:', roleType);
              return true;
            }
          } else {
            await clearAuthSession();
          }
        }
      } catch (tokenError) {
        await clearAuthSession();
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
          console.log('✅ Login successful:', { email, role: roleType });
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

  const logout = async (): Promise<void> => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      await DirectusService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

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
