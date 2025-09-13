import { createContext } from 'react';

export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

export interface ContentPermission {
  collection: string;
  field?: string;
  roles: UserRole[];
}

export interface PermissionsContextType {
  userRole: UserRole;
  permissions: ContentPermission[];
  canEditContent: (collection: string, field?: string) => boolean;
  canEditCollection: (collection: string) => boolean;
  isAdmin: boolean;
}

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);
