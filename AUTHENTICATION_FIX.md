# Authentication Fix - Role vs Policy-Based Permissions

## Problem Identified

The authentication was failing with "Email ou password inválidos" even though login was successful. This was caused by a mismatch between Directus 11+ policy-based permissions and the frontend's role-based authentication logic.

## Root Cause

In Directus 11+, users can have **EITHER**:
1. **Role-based permissions** (legacy): User has a `role` field with a role ID
2. **Policy-based permissions** (modern): User has `policies` array instead of a role

The frontend code was requiring a `roleId`, which would be `null` for policy-based users, causing authentication to fail.

## Changes Made

### 1. `/src/services/directusService.ts` (Line 306)

**Updated user data fetch to include policy information:**
```typescript
// OLD: Only fetched role data
?fields=id,email,first_name,last_name,role.id,role.name,status,policies

// NEW: Fetches both role and policy details
?fields=id,email,first_name,last_name,role.id,role.name,status,policies.id,policies.name
```

**Added comprehensive logging:**
- Logs whether user has role or policies
- Shows policy count and details
- Identifies policy-based users clearly

**Enhanced policy handling (Lines 333-340):**
- Detects users with policies but no role
- Assigns Editor role ID for backward compatibility
- Logs policy information for debugging

**Added validation (Lines 342-346):**
- Checks if user has NEITHER role NOR policies
- Returns null if user has no permissions
- Prevents authentication with invalid permission state

### 2. `/src/contexts/UnifiedAuthContext.tsx` (Line 82-88)

**Added detailed logging in checkAuth:**
```typescript
console.log('📋 User info retrieved:', { 
  hasUser: !!userInfo, 
  hasRoleId: !!userInfo?.roleId,
  roleId: userInfo?.roleId,
  email: userInfo?.email 
});
```

**Added warning for incomplete user data (Line 106):**
- Warns when user info is incomplete
- Helps identify permission configuration issues

### 3. `/src/pages/auth/LoginPage.tsx` (Line 85-96)

**Enhanced error handling:**
- Added detailed logging of user data after login
- Improved error message: "Contacte o administrador" for permission issues
- Helps distinguish between login failures and permission problems

## What to Check in Directus

### For the user `geral@keyprog.pt`:

1. **Check User Permissions:**
   - Go to Directus Admin → Settings → Users
   - Find `geral@keyprog.pt`
   - Check if user has:
     - ✅ A **Role** assigned (e.g., Editor, Administrator)
     - OR
     - ✅ **Access Policies** assigned

2. **If using Policies (Directus 11+):**
   - Ensure at least one policy is assigned
   - Policy should have appropriate permissions for:
     - Reading collections (hero, pages, etc.)
     - Accessing `/users/me` endpoint
     - Any other required operations

3. **If using Roles (Legacy):**
   - Ensure role is properly assigned
   - Role should have appropriate permissions

## Expected Console Output

### Successful Login with Role:
```
🔑 Using static token for authentication
Attempting login with provided credentials...
Authentication successful, token stored
📋 User data from Directus: {
  email: "geral@keyprog.pt",
  hasRole: true,
  roleId: "97ef35d8-3d16-458d-8c93-78e35b7105a4",
  roleName: "editor",
  hasPolicies: false,
  policiesCount: 0
}
✅ Session auth successful: editor
```

### Successful Login with Policies:
```
🔑 Using static token for authentication
Attempting login with provided credentials...
Authentication successful, token stored
📋 User data from Directus: {
  email: "geral@keyprog.pt",
  hasRole: false,
  roleId: null,
  roleName: null,
  hasPolicies: true,
  policiesCount: 1
}
✅ User has policies but no role (policy-based permissions)
📋 User policies: [{id: "...", name: "Editor Policy"}]
✅ Session auth successful: editor
```

### Failed Login (No Permissions):
```
📋 User data from Directus: {
  email: "geral@keyprog.pt",
  hasRole: false,
  roleId: null,
  roleName: null,
  hasPolicies: false,
  policiesCount: 0
}
❌ User has neither role nor policies - cannot authenticate
❌ Login failed - user data incomplete
```

## Additional Fix: Token Verification

Added immediate token verification after login to catch authentication issues early:

**In `performAuthentication` (Line 230-263):**
1. Added 100ms delay after login to ensure token is stored
2. Added token preview logging for debugging
3. **Added immediate token verification** - makes a test request to `/users/me` right after login
4. If verification fails, authentication is marked as failed immediately

This prevents the scenario where login appears successful but the token doesn't actually work.

## Testing Steps

1. **Clear browser cache and localStorage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Try logging in with `geral@keyprog.pt`**

3. **Check console for the new detailed logs**

4. **Look for these specific log messages:**
   - `🔑 Token preview:` - Shows the token was retrieved
   - `✅ Token verified successfully` - Confirms token works
   - OR `❌ Token verification failed` - Shows token doesn't work

5. **Verify the output matches one of the expected patterns above**

## Next Steps

If login still fails:

1. **Check the console logs** - they will now show exactly what's missing
2. **Verify in Directus** that the user has either a role OR policies
3. **If using policies**, ensure the policy has permissions for:
   - `directus_users` collection (read own user data)
   - Any collections the user needs to access
4. **Share the console logs** so we can identify the exact issue

## Answer to Your Question

> "Email ou password inválidos" do we need role id and access policy at the same time?

**Answer:** No, you need **EITHER** a role ID **OR** access policies, not both. The code now handles both scenarios:

- **Role-based** (legacy): User has a `role` field → uses that role ID
- **Policy-based** (modern): User has `policies` array → assigns Editor role ID for compatibility
- **Invalid**: User has neither role nor policies → authentication fails with clear error

The frontend now properly detects which permission system is being used and adapts accordingly.
