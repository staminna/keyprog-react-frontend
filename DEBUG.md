# Debug Steps for Editor Login Issue

## Issue
User with "Editor-user" role (roleId: `97ef35d8-3d16-458d-8c93-78e35b7105a4`) cannot access `/editor` route at localhost:3000.

## Added Debug Logging

### 1. LoginPage.tsx
- Added role comparison logging before redirect logic
- Shows roleId, roleId type, and comparison results
- Shows requestedReturnUrl

### 2. ProtectedRoute.tsx
- Added authorization check logging
- Shows user object, roleId, roleName, and requiredRoles
- Shows detailed role matching logic for each required role
- Shows final authorization result

## Testing Steps

1. **Clear browser storage**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Navigate to login page**: http://localhost:3000/login

3. **Login with Editor credentials**: geral@keyprog.pt

4. **Check console logs** for:
   - `🔍 Role comparison:` in LoginPage
   - `🎯 Redirecting Editor user to:` in LoginPage  
   - `🔒 ProtectedRoute authorization check:` in ProtectedRoute
   - `✅ Role matched by...` or `❌ No match` in ProtectedRoute
   - `🎯 Authorization result:` in ProtectedRoute

5. **If redirected to login**, the issue is in ProtectedRoute authorization
6. **If stuck on login page**, the issue is in LoginPage redirect logic

## Expected Flow

1. User logs in → LoginPage.handleSubmit
2. User roleId matches EDITOR_ROLE_ID → should redirect to `/editor`
3. Navigate to `/editor` → ProtectedRoute checks authorization
4. User role "Editor-user" should match required role "editor-user"
5. EditorPage renders

## Common Issues

1. **roleId type mismatch**: String vs Number
2. **Role name casing**: "Editor-user" vs "editor-user"  
3. **Token not persisted**: Session lost between login and route check
4. **Race condition**: checkAuth() not completing before navigation
