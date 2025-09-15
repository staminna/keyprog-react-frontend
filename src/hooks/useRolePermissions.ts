import { useState, useEffect, useCallback } from 'react';
import { DirectusService } from '@/services/directusService';

export type UserRole = 'admin' | 'editor' | 'author' | 'viewer' | 'public';

export interface ContentPermission {
  collection: string;
  field?: string;
  allowedRoles: UserRole[];
}

/**
 * Default permissions configuration
 * This defines which roles can edit which collections and fields
 */
const DEFAULT_PERMISSIONS: ContentPermission[] = [
  // Admin can edit everything
  { collection: '*', allowedRoles: ['admin'] },
  
  // Editors can edit most content
  { collection: 'settings', allowedRoles: ['admin', 'editor'] },
  { collection: 'pages', allowedRoles: ['admin', 'editor'] },
  { collection: 'services', allowedRoles: ['admin', 'editor'] },
  
  // Authors can edit specific content
  { collection: 'blog_posts', allowedRoles: ['admin', 'editor', 'author'] },
  { collection: 'news', allowedRoles: ['admin', 'editor', 'author'] },
  
  // Field-level permissions
  { collection: 'settings', field: 'site_title', allowedRoles: ['admin'] },
  { collection: 'settings', field: 'site_description', allowedRoles: ['admin', 'editor'] },
  
  // Virtual collection permissions (mapped to settings)
  { collection: 'hero', allowedRoles: ['admin', 'editor'] },
  { collection: 'contact_info', allowedRoles: ['admin', 'editor'] },
];

/**
 * Hook for managing role-based permissions
 * This hook provides functions to check if a user has permission to edit specific content
 */
export const useRolePermissions = () => {
  const [userRole, setUserRole] = useState<UserRole>('public');
  const [permissions, setPermissions] = useState<ContentPermission[]>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user role from Directus
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        const user = await DirectusService.getCurrentUser();
        
        if (!user) {
          setUserRole('public');
          return;
        }
        
        // Map user to role based on Directus role
        // This is a simplified example - you would need to adapt this to your Directus roles
        if (user.email?.includes('admin')) {
          setUserRole('admin');
        } else if (user.email?.includes('editor')) {
          setUserRole('editor');
        } else if (user.email?.includes('author')) {
          setUserRole('author');
        } else if (user.authenticated) {
          setUserRole('viewer');
        } else {
          setUserRole('public');
        }
        
        // Optionally fetch custom permissions from Directus
        // const customPermissions = await fetchCustomPermissions();
        // if (customPermissions) {
        //   setPermissions([...DEFAULT_PERMISSIONS, ...customPermissions]);
        // }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('public');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, []);
  
  /**
   * Check if the current user can edit a specific collection and field
   * Memoized to prevent excessive re-computations
   */
  const canEditContent = useCallback((collection: string, field?: string): boolean => {
    // Admins can edit everything
    if (userRole === 'admin') return true;
    
    // publics can't edit anything
    if (userRole === 'public') return false;
    
    // Check for wildcard collection permission
    const wildcardPermission = permissions.find(p => p.collection === '*');
    if (wildcardPermission && wildcardPermission.allowedRoles.includes(userRole)) {
      return true;
    }
    
    // Check for field-specific permission
    if (field) {
      const fieldPermission = permissions.find(
        p => p.collection === collection && p.field === field
      );
      
      if (fieldPermission) {
        return fieldPermission.allowedRoles.includes(userRole);
      }
    }
    
    // Check for collection-level permission
    const collectionPermission = permissions.find(
      p => p.collection === collection && !p.field
    );
    
    return collectionPermission ? collectionPermission.allowedRoles.includes(userRole) : false;
  }, [userRole, permissions]);
  
  /**
   * Check if the current user can edit any field in a collection
   * Memoized to prevent excessive re-computations
   */
  const canEditCollection = useCallback((collection: string): boolean => {
    // Admins can edit everything
    if (userRole === 'admin') return true;
    
    // publics can't edit anything
    if (userRole === 'public') return false;
    
    // Check for wildcard collection permission
    const wildcardPermission = permissions.find(p => p.collection === '*');
    if (wildcardPermission && wildcardPermission.allowedRoles.includes(userRole)) {
      return true;
    }
    
    // Check for collection-level permission
    const collectionPermission = permissions.find(
      p => p.collection === collection && !p.field
    );
    
    return collectionPermission ? collectionPermission.allowedRoles.includes(userRole) : false;
  }, [userRole, permissions]);
  
  // Computed properties for convenience
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor' || isAdmin;
  const isAuthor = userRole === 'author' || isEditor;
  const isAuthenticated = userRole !== 'public';
  
  return {
    userRole,
    permissions,
    isLoading,
    canEditContent,
    canEditCollection,
    isAdmin,
    isEditor,
    isAuthor,
    isAuthenticated
  };
};

export default useRolePermissions;
