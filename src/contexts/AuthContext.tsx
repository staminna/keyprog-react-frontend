import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { AuthContext } from '@/contexts/auth-context';
import type { User, AuthContextType, AuthProviderProps } from '@/types/auth';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Only check auth if we have stored credentials
      const storedEmail = localStorage.getItem('directus_auth_email');
      const storedPassword = localStorage.getItem('directus_auth_password');
      
      if (!storedEmail || !storedPassword) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      
      const authenticated = await DirectusService.authenticate(storedEmail, storedPassword);
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        setUser({ email: storedEmail, authenticated: true });
      } else {
        // Clear stored credentials if authentication fails
        localStorage.removeItem('directus_auth_email');
        localStorage.removeItem('directus_auth_password');
        setUser(null);
      }
      
      return authenticated;
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Clear stored credentials on error
      localStorage.removeItem('directus_auth_email');
      localStorage.removeItem('directus_auth_password');
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
        // Store credentials only after successful authentication
        localStorage.setItem('directus_auth_email', email);
        localStorage.setItem('directus_auth_password', password);
        setIsAuthenticated(true);
        setUser({ email, authenticated: true });
        return true;
      } else {
        // Clear any existing credentials if login fails
        localStorage.removeItem('directus_auth_email');
        localStorage.removeItem('directus_auth_password');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Clear credentials on error
      localStorage.removeItem('directus_auth_email');
      localStorage.removeItem('directus_auth_password');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear authentication state
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear stored credentials
      localStorage.removeItem('directus_auth_email');
      localStorage.removeItem('directus_auth_password');
      
      // Note: DirectusService doesn't have a logout method in the current implementation
      // but the authentication will fail on next request
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
