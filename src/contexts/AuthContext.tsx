import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { AuthContext } from '@/contexts/auth-context';
import { sessionDirectus } from '@/lib/directus';
import type { User, AuthContextType, AuthProviderProps } from '@/types/auth';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First check if we have an active session token
      try {
        const token = await sessionDirectus.getToken();
        if (token) {
          console.log('Found active session token');
          // Verify the token is still valid by making a test request
          const isValid = await DirectusService.verifyToken();
          if (isValid) {
            console.log('Session token is valid');
            // Get user info if available
            const userInfo = await DirectusService.getCurrentUser();
            setUser(userInfo || { email: 'session-user', authenticated: true });
            setIsAuthenticated(true);
            return true;
          }
          console.log('Session token expired or invalid');
        }
      } catch (tokenError) {
        console.warn('Error checking session token:', tokenError);
      }
      
      // If no valid session token, assume logged out
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
        // Get user info after successful authentication
        const userInfo = await DirectusService.getCurrentUser();
        setUser(userInfo || { email, authenticated: true });
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
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
      // Clear authentication state
      setIsAuthenticated(false);
      setUser(null);
      
      // Perform logout if the service supports it
      if (DirectusService.logout) {
        await DirectusService.logout();
      }
      
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
