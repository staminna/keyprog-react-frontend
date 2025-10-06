# CORS Issue Fix - React Frontend & Directus

## Problem
React frontend was unable to fetch data from Directus CMS collections due to CORS errors:
```
Access to fetch at 'http://localhost:8065/items/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Request header field cache-control is not allowed by 
Access-Control-Allow-Headers in preflight response.
```

## Root Cause
The React app was sending `Cache-Control`, `Pragma`, and `Expires` headers in fetch requests, but Directus CORS configuration wasn't allowing these headers in the preflight response.

## Solution
Removed the unnecessary cache-control headers from fetch requests in `directusService.ts`:

### Before:
```typescript
const response = await fetch(`${url}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});
```

### After:
```typescript
const response = await fetch(`${url}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Why This Works
1. **Cache-busting is already handled** by the `?_=${Date.now()}` query parameter in the URL
2. **Fewer headers = fewer CORS restrictions** - only Authorization header is needed
3. **Standard CORS configs** typically allow Authorization by default

## Files Modified
- `/react-frontend/src/services/directusService.ts`
  - Line ~512-516: `getHero()` method
  - Line ~952-958: `getCollectionItem()` method

## Testing
After this fix, the React app should successfully:
- ✅ Fetch hero data from Directus
- ✅ Load category titles and descriptions
- ✅ Retrieve service information
- ✅ Access all CMS collections without CORS errors

## Alternative Solution (Not Used)
We could have updated Directus CORS configuration to allow cache-control headers:
```env
CORS_ALLOWED_HEADERS=Content-Type,Authorization,Cache-Control,Pragma,Expires
```
However, removing unnecessary headers is cleaner and more secure.
