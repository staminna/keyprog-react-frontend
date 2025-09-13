# Role-Based Permissions Documentation

This document explains how the role-based permissions system works in the Keyprog application.

## Overview

The role-based permissions system allows you to control which users can edit specific content based on their role. This provides granular access control for content editing across your application.

## User Roles

The system supports the following user roles, in order of increasing permissions:

1. **public**: Unauthenticated users with no editing permissions
2. **Viewer**: Authenticated users with read-only access
3. **Author**: Can edit specific content like blog posts and news
4. **Editor**: Can edit most content including settings and pages
5. **Admin**: Has full access to edit all content

## How Permissions Work

Permissions are checked at two levels:

1. **Authentication Level**: Checks if the user is authenticated or in the Directus Visual Editor
2. **Role Level**: Checks if the user's role has permission to edit the specific collection and field

Both checks must pass for a user to be able to edit content.

## Permission Configuration

Permissions are defined in the `useRolePermissions` hook:

```typescript
const DEFAULT_PERMISSIONS: ContentPermission[] = [
  // Admin can edit everything
  { collection: '*', allowedRoles: ['admin'] },
  
  // Editors can edit most content
  { collection: 'settings', allowedRoles: ['admin', 'editor'] },
  { collection: 'pages', allowedRoles: ['admin', 'editor'] },
  
  // Authors can edit specific content
  { collection: 'blog_posts', allowedRoles: ['admin', 'editor', 'author'] },
  { collection: 'news', allowedRoles: ['admin', 'editor', 'author'] },
  
  // Field-level permissions
  { collection: 'settings', field: 'site_title', allowedRoles: ['admin'] },
];
```

## Using the Permissions Hook

You can use the `useRolePermissions` hook in your components to check if a user has permission to edit content:

```tsx
import useRolePermissions from '@/hooks/useRolePermissions';

const MyComponent = () => {
  const { canEditContent, isAdmin, isEditor } = useRolePermissions();
  
  // Check if user can edit a specific collection and field
  const canEditTitle = canEditContent('settings', 'site_title');
  
  // Check if user has a specific role
  if (isAdmin) {
    // Show admin-only features
  }
  
  // ...
};
```

## Integration with Editable Components

All editable components automatically check role permissions:

- `EditableContent`
- `EditableImage`
- `PageSection`
- `PageImage`
- `PageButton`

These components will only allow editing if the user has the appropriate role permissions.

## Role Determination

User roles are determined based on the following:

1. **Directus Editor**: Users in the Directus Visual Editor are automatically granted editing permissions
2. **Email Pattern**: For testing, roles are assigned based on email patterns (e.g., emails containing "admin" get admin role)
3. **Custom Logic**: You can implement custom logic to determine roles based on your authentication system

## Customizing Permissions

To customize permissions:

1. Update the `DEFAULT_PERMISSIONS` array in `useRolePermissions.ts`
2. Add new collections and fields with their allowed roles
3. For field-level permissions, specify both the collection and field
4. Use the wildcard `'*'` to grant access to all collections

## Best Practices

1. **Principle of Least Privilege**: Grant only the permissions necessary for each role
2. **Field-Level Control**: Use field-level permissions for sensitive content
3. **Role Hierarchy**: Maintain a clear hierarchy of roles (admin > editor > author > viewer > public)
4. **Test Thoroughly**: Test editing with different user roles to ensure permissions work as expected
5. **Document Role Requirements**: Clearly document which roles are needed for different editing tasks

## Troubleshooting

If users can't edit content they should have access to:

1. Check if they are properly authenticated
2. Verify their role assignment
3. Check if the collection and field have the appropriate permissions
4. Look for console errors related to permissions
5. Ensure the component is using the `useRolePermissions` hook correctly
