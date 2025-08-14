import { ReactNode } from 'react';

export interface User {
  email?: string;
  firstName?: string;
  lastName?: string;
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
