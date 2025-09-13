import React, { ReactNode, useState, useEffect } from 'react';
import { PermissionsContext, UserRole, ContentPermission } from './PermissionsTypes';
import { DirectusService } from '@/services/directusService';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

// Default permissions configuration
const DEFAULT_PERMISSIONS: ContentPermission[] = [
  // Admin can edit everything
  { collection: '*', roles: ['admin'] },
  
  // Editors can edit most content
  { collection: 'settings', roles: ['admin', 'editor'] },
  { collection: 'pages', roles: ['admin', 'editor'] },
  { collection: 'services', roles: ['admin', 'editor'] },
  
  // Authors can edit specific content
  { collection: 'blog_posts', roles: ['admin', 'editor', 'author'] },
  { collection: 'news', roles: ['admin', 'editor', 'author'] },
  
  // Field-level permissions
  { collection: 'settings', field: 'site_title', roles: ['admin'] },
  { collection: 'settings', field: 'site_description', roles: ['admin', 'editor'] },
];

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [permissions, setPermissions] = useState<ContentPermission[]>(DEFAULT_PERMISSIONS);
  const { isAuthenticated } = useDirectusEditorContext();
  
  // Fetch user role from Directus when authenticated
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isAuthenticated) {
        try {
          // This is a placeholder - you would need to implement this in DirectusService
          const userData = await DirectusService.getCurrentUser();
          
          // Map Directus role to our application roles
          if (userData?.role === 'admin') {
            setUserRole('admin');
          } else if (userData?.role === 'editor') {
            setUserRole('editor');
          } else if (userData?.role === 'author') {
            setUserRole('author');
          } else {
            setUserRole('viewer');
          }
          
          // Optionally fetch custom permissions from Directus
          // const customPermissions = await DirectusService.getPermissions();
          // if (customPermissions) {
          //   setPermissions([...DEFAULT_PERMISSIONS, ...customPermissions]);
          // }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
          setUserRole('viewer'); // Default to viewer on error
        }
      } else {
        setUserRole('viewer');
      }
    };
    
    fetchUserRole();
  }, [isAuthenticated]);
  
  // Check if user can edit a specific collection and field
  const canEditContent = (collection: string, field?: string): boolean => {
    // Admins can edit everything
    if (userRole === 'admin') return true;
    
    // Check for wildcard collection permission
    const wildcardPermission = permissions.find(p => p.collection === '*');
    if (wildcardPermission && wildcardPermission.roles.includes(userRole)) {
      return true;
    }
    
    // Check for field-specific permission
    if (field) {
      const fieldPermission = permissions.find(
        p => p.collection === collection && p.field === field
      );
      
      if (fieldPermission) {
        return fieldPermission.roles.includes(userRole);
      }
    }
    
    // Check for collection-level permission
    const collectionPermission = permissions.find(
      p => p.collection === collection && !p.field
    );
    
    return collectionPermission ? collectionPermission.roles.includes(userRole) : false;
  };
  
  // Check if user can edit any field in a collection
  const canEditCollection = (collection: string): boolean => {
    // Admins can edit everything
    if (userRole === 'admin') return true;
    
    // Check for wildcard collection permission
    const wildcardPermission = permissions.find(p => p.collection === '*');
    if (wildcardPermission && wildcardPermission.roles.includes(userRole)) {
      return true;
    }
    
    // Check for collection-level permission
    const collectionPermission = permissions.find(
      p => p.collection === collection && !p.field
    );
    
    return collectionPermission ? collectionPermission.roles.includes(userRole) : false;
  };
  
  // Computed property for convenience
  const isAdmin = userRole === 'admin';
  
  return (
    <PermissionsContext.Provider 
      value={{ 
        userRole, 
        permissions, 
        canEditContent, 
        canEditCollection,
        isAdmin
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsProvider;
