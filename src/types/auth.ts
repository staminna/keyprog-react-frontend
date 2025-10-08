import { ReactNode } from 'react';

export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roleId?: string;
  status?: 'active' | 'draft' | 'suspended' | 'archived';
  authenticated: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
