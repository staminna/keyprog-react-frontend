# Fixed: React Using Fallback Data Instead of Fetching from Directus

## Problem
React was using hardcoded fallback data instead of fetching from Directus first. The app should **only use fallback when Directus is completely down** (network error, server error 500+), not for authentication issues or other errors.

## Root Cause
The `getHero()` method in `directusService.ts` was catching **all errors** and returning fallback data, including:
- Authentication failures (401, 403)
- Configuration errors
- Token issues
- Any other errors

This masked real problems and made it impossible to debug why Directus wasn't being queried.

## Solution

### 1. Fixed `getHero()` Method
**File**: `/src/services/directusService.ts`

**Before**:
```typescript
try {
  // ... fetch logic
  if (!response.ok) {
    console.error('Failed to fetch hero data, using fallback.');
    return fallback; // ❌ Always returns fallback on any error
  }
} catch (error) {
  console.error('Error in getHero, using fallback:', error);
  return fallback; // ❌ Silently returns fallback, hiding the real error
}
```

**After**:
```typescript
try {
  // ... fetch logic
  if (!response.ok) {
    // Only use fallback for server errors (500+)
    if (response.status >= 500) {
      console.error(`Server error ${response.status}, using fallback`);
      return fallback;
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`); // ✅ Throw auth errors
  }
  console.log('✅ Hero data fetched from Directus:', result.data);
  return result.data;
} catch (error) {
  // Only use fallback for network errors (Directus down)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    console.error('❌ Network error - Directus appears to be down, using fallback:', error);
    return fallback;
  }
  throw error; // ✅ Re-throw so errors are visible
}
```

### 2. Fixed `EditableHero` Component
**File**: `/src/components/editor/EditableHero.tsx`

**Before**:
```typescript
catch (error) {
  console.error("Error loading hero data:", error);
  // Use fallback data
  setHeroData({
    title: "Performance...",
    // ... hardcoded fallback
  }); // ❌ Always uses fallback on any error
}
```

**After**:
```typescript
catch (error) {
  console.error("❌ Error loading hero data:", error);
  // getHero() now only returns fallback for network errors
  // For other errors (auth, etc.), it throws, so we see them here
  console.error("Failed to load hero data from Directus. Check authentication and network.");
  // ✅ No fallback here - let the error be visible
}
```

## Error Handling Strategy

### ✅ When to Use Fallback
1. **Network errors** - Directus server is completely unreachable
2. **Server errors (500+)** - Directus is having internal issues

### ❌ When NOT to Use Fallback (Throw Error Instead)
1. **Authentication errors (401, 403)** - Token is invalid or missing
2. **Not found errors (404)** - Resource doesn't exist
3. **Bad request (400)** - Invalid request format
4. **Any other client errors (4xx)** - Configuration or request issues

## Expected Behavior Now

### ✅ On Page Load (Directus Running):
1. Authentication initializes with static token
2. `getHero()` fetches data from Directus
3. Console shows: `✅ Hero data fetched from Directus: {...}`
4. Hero section displays with Directus data

### ✅ On Page Load (Directus Down):
1. Authentication initializes
2. `getHero()` attempts fetch
3. Network error occurs
4. Console shows: `❌ Network error - Directus appears to be down, using fallback`
5. Hero section displays with fallback data

### ✅ On Page Load (Auth Error):
1. Authentication fails
2. `getHero()` gets 401/403 response
3. Error is thrown with message: `HTTP 401: Unauthorized`
4. Console shows: `❌ Error loading hero data: HTTP 401: Unauthorized`
5. Error is visible for debugging

## Testing

### Test 1: Normal Operation (Directus Running)
```bash
# Ensure Directus is running
curl http://localhost:8065/server/health
# Should return: {"status":"ok"}

# Refresh browser
# Console should show:
# ✅ Hero data fetched from Directus: {...}
```

### Test 2: Directus Down
```bash
# Stop Directus
docker stop keyprog-directus

# Refresh browser
# Console should show:
# ❌ Network error - Directus appears to be down, using fallback
```

### Test 3: Invalid Token
```bash
# Edit .env and change token to invalid value
VITE_DIRECTUS_TOKEN=invalid_token

# Refresh browser
# Console should show:
# ❌ Error loading hero data: HTTP 401: Unauthorized
# (No fallback data shown - error is visible)
```

## Files Modified

1. `/src/services/directusService.ts`
   - `getHero()` method - Improved error handling
   - Only returns fallback for network/server errors
   - Throws errors for auth and client issues

2. `/src/components/editor/EditableHero.tsx`
   - Removed automatic fallback in catch block
   - Errors are now logged and visible
   - Relies on `getHero()` for fallback logic

## Benefits

✅ **Errors are visible** - No more silent failures  
✅ **Easier debugging** - Know exactly what's wrong  
✅ **Correct fallback usage** - Only when Directus is truly down  
✅ **Better user experience** - Show real errors instead of hiding them  
✅ **Proper data flow** - Always fetch from Directus first  

## Next Steps

Apply the same pattern to other methods:
- `getServices()`
- `getCategories()`
- `getNews()`
- Any other methods that have fallback logic

The pattern:
1. Only return fallback for network errors (TypeError with 'fetch')
2. Only return fallback for server errors (500+)
3. Throw all other errors so they're visible
