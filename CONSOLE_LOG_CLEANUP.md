# Console Log Cleanup Guide

## Problem
The console is flooded with excessive logging from:
1. `useRolePermissions` - checking permissions on every render
2. `UniversalContentEditor` - permission checks for every editable element
3. Multiple authentication checks happening simultaneously

## Solutions Implemented

### 1. Reduced Logging in AuthContext
- Removed verbose "Found active session token" logs
- Removed "Session token is valid" logs  
- Removed "Session token expired or invalid" logs
- Silent fail for token checks (still logs actual errors)

### 2. Created Logger Utility (`/src/utils/logger.ts`)
A centralized logging system that can be toggled per namespace:
- Suppresses `useRolePermissions` logs in development
- Suppresses `UniversalContentEditor` logs in development
- Keeps authentication and critical logs always visible

## Additional Fixes Needed

### Fix 1: Reduce useRolePermissions Logging
**File**: `/src/hooks/useRolePermissions.ts`

Replace console.log statements with the logger:

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('useRolePermissions');

// Replace console.log with:
logger.log('Session token exists:', !!token);

// Keep errors as:
logger.error('Error:', error);
```

### Fix 2: Reduce UniversalContentEditor Logging  
**File**: `/src/components/universal/UniversalContentEditor.tsx`

Same approach - use the logger instead of console.log for permission checks.

### Fix 3: Add Logout Method to DirectusService
**File**: `/src/services/directusService.ts`

Add this method to the DirectusService class:

```typescript
static async logout(): Promise<void> {
  try {
    // Clear session token
    await sessionDirectus.logout();
    
    // Reset authentication state
    this.isAuthenticated = false;
    this.useStaticToken = false;
    this.parentToken = null;
    this.editorDirectusClient = null;
    
    console.log('✅ Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

### Fix 4: Prevent Auth Loops

The issue where refreshing logs you out is because the session token isn't persisting. The Directus SDK should handle this automatically, but we need to ensure the auth flow is correct.

**Check**: Does `sessionDirectus` from `@/lib/directus` have proper storage configuration?

## Quick Wins

### Option A: Disable All Debug Logs (Quick Fix)
Add to your `.env`:
```
VITE_DEBUG_AUTH=false
VITE_DEBUG_PERMISSIONS=false
```

Then wrap all debug logs:
```typescript
if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
  console.log('Debug info...');
}
```

### Option B: Use Console Filters in Browser
1. Open DevTools Console
2. Click the filter icon
3. Add negative filters:
   - `-useRolePermissions`
   - `-UniversalContentEditor`
   - `-🔑`
   - `-❌`

This hides those logs without code changes.

## Root Cause: Dual Auth Systems

You have two separate authentication contexts:
1. **DirectusEditorContext** - for inline editing (admin/editor roles)
2. **AuthContext** - for Cliente file uploads

They don't share state, causing:
- Double permission checks
- Confusion about who's authenticated
- Logout issues (one system logs out, other doesn't know)

### Recommended Solution: Unify Auth

Create a single auth provider that handles both:

```typescript
// Unified Auth Context
{
  isAuthenticated: boolean,
  user: User | null,
  role: 'admin' | 'editor' | 'cliente' | null,
  canEdit: boolean, // computed from role
  canUpload: boolean, // computed from role
  login: (email, password) => Promise<boolean>,
  logout: () => Promise<void>
}
```

This way:
- One source of truth for auth state
- No duplicate checks
- Proper session persistence
- Clean logout for both systems

## Testing

After implementing fixes, you should see:
- ✅ Far fewer console logs
- ✅ Session persists on refresh
- ✅ Logout works correctly
- ✅ No authentication loops

## Priority Order

1. **Immediate**: Use browser console filters (Option B above)
2. **Quick**: Add logout method to DirectusService
3. **Important**: Reduce logging in useRolePermissions
4. **Long-term**: Consider unifying auth systems
