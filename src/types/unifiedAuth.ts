import { createContext } from 'react';

export type UserRole = 'administrator' | 'editor' | 'cliente' | null;

export interface UnifiedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  roleId: string;
  authenticated: boolean;
  
  // Additional fields for Cliente users
  telefone?: string;
  morada?: string;
  cidade?: string;
  codigo_postal?: string;
  pais?: string;
  nif?: string;
  nome_empresa?: string;
}

export interface UnifiedAuthContextType {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UnifiedUser | null;
  
  // Computed permissions
  canEdit: boolean;      // Can use inline editor (admin/editor only)
  canUpload: boolean;    // Can upload files (cliente only)
  canAdmin: boolean;     // Can access admin panel (admin only)
  
  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateProfile: (data: Partial<UnifiedUser>) => Promise<boolean>;
}

export interface UnifiedAuthProviderProps {
  children: React.ReactNode;
}

export const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);
