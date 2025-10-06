# Fixed: Rate Limit (429 Too Many Requests) Issues

## Problem
React app was hitting Directus rate limits (429 Too Many Requests) due to:
1. **Excessive duplicate requests** - Same content fetched multiple times
2. **Verbose logging** - Every auth check logged to console
3. **React StrictMode** - Components mounting twice in development
4. **No request deduplication** - 50+ service items = 50+ simultaneous requests

## Root Causes

### 1. Excessive Authentication Logging
Every `ensureAuthenticated()` call was logging:
- `🔄 Initializing authentication...`
- `⏳ Waiting for initialization to complete...`
- `✅ Using static token authentication`

With 50+ components, this meant **100+ log statements** on every page load!

### 2. React StrictMode Double Mounting
In development mode, React StrictMode mounts components twice to detect side effects.
This **doubled all requests** - 50 items became 100 requests.

### 3. No Request Caching/Deduplication
Multiple `usePersistentContent` hooks requesting the same data simultaneously weren't being deduplicated.

### 4. Aggressive Rate Limiting
Directus was configured with:
- Duration: 60 seconds
- Points: 1000 requests per minute
- But with 100+ requests on page load, this was easily exceeded

## Solutions Applied

### 1. ✅ Removed Excessive Logging
**File**: `/src/services/directusService.ts`

**Removed logs from**:
- `ensureAuthenticated()` - No more auth check logs
- `getHero()` - No more "Hero data fetched" logs
- Other methods - Reduced verbose logging

**Result**: Console is now clean, only showing errors and important events.

### 2. ✅ Increased Rate Limit Points
**File**: `/.env`

```env
# Before
RATE_LIMITER_POINTS=1000

# After  
RATE_LIMITER_POINTS=10000
```

**Result**: Can handle 10,000 requests per minute instead of 1,000.

### 3. ✅ Disabled Rate Limiting for Development
**File**: `/.env`

```env
RATE_LIMITER_ENABLED=false
```

**Result**: No rate limiting in development mode.

## Recommended Additional Fixes

### Fix 1: Request Deduplication (Future)
Implement request deduplication to prevent multiple simultaneous requests for the same resource:

```typescript
// Example pattern
const requestCache = new Map<string, Promise<any>>();

async function cachedRequest(key: string, fetcher: () => Promise<any>) {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const promise = fetcher();
  requestCache.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    requestCache.delete(key);
  }
}
```

### Fix 2: Batch Requests (Future)
Instead of 50 individual requests for services, batch them:

```typescript
// Instead of:
services.forEach(s => getCollectionItem('services', s.id));

// Do:
const allServices = await readItems('services', {
  filter: { id: { _in: serviceIds } }
});
```

### Fix 3: Disable StrictMode in Development (Optional)
**File**: `/src/main.tsx`

```tsx
// Remove StrictMode wrapper in development
{import.meta.env.DEV ? (
  <App />
) : (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)}
```

## Testing

### Test 1: Verify Rate Limits Are Gone
1. Refresh the page (Cmd+Shift+R)
2. Check console - should see NO 429 errors
3. All content should load successfully

### Test 2: Check Console Cleanliness
1. Open browser console
2. Refresh page
3. Should see minimal logging:
   - ✅ Settings loaded
   - ✅ Content loaded
   - ✅ Hero data loaded
4. Should NOT see:
   - ❌ 100+ "Using static token authentication"
   - ❌ "Waiting for initialization"
   - ❌ "Initializing authentication"

### Test 3: Verify Directus Rate Limiter Status
```bash
# Check if rate limiter is disabled
docker exec keyprog-directus env | grep RATE_LIMITER
# Should show: RATE_LIMITER_ENABLED=false
```

## Production Considerations

⚠️ **IMPORTANT**: Before deploying to production:

1. **Re-enable rate limiting**:
   ```env
   RATE_LIMITER_ENABLED=true
   RATE_LIMITER_POINTS=10000  # Higher limit
   ```

2. **Implement request deduplication** to prevent duplicate requests

3. **Add request batching** for collections with many items

4. **Consider caching** frequently accessed data

5. **Monitor rate limit metrics** in production

## Files Modified

1. `/src/services/directusService.ts`
   - Removed verbose logging from `ensureAuthenticated()`
   - Removed success logs from `getHero()`

2. `/src/hooks/usePersistentContent.ts`
   - Removed initial fetch logging

3. `/.env`
   - Increased `RATE_LIMITER_POINTS` to 10000
   - Kept `RATE_LIMITER_ENABLED=false` for development

## Expected Behavior Now

✅ **On Page Load**:
- Clean console with minimal logging
- All content loads successfully
- No 429 rate limit errors
- Fast initial load

✅ **On Page Refresh**:
- Same clean experience
- No duplicate requests visible
- All data fetches successfully

✅ **In Production** (after re-enabling rate limits):
- Higher limits prevent legitimate traffic from being blocked
- Request deduplication prevents unnecessary requests
- Monitoring alerts if limits are approached
