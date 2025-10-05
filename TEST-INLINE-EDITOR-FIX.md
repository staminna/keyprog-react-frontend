# Inline Editor Cache Fix - Test Plan

## Problem Fixed
When editing content via the inline editor:
1. ✅ Save to Directus succeeds (200 OK)
2. ✅ Local state updates correctly
3. ❌ **Page refresh shows OLD cached version instead of latest Directus content**

## Root Causes
### Issue 1: Fallback Logic (FIXED)
The `usePersistentContent` hook was using this logic:
```typescript
const finalContent = serverContent || initialValue;
```

This meant:
- If Directus returns empty string → fallback to hardcoded `initialValue`
- If user deletes content → fallback to hardcoded `initialValue`
- **Directus content was never the source of truth after refresh**

### Issue 2: Browser/Directus Cache (FIXED)
API requests were being cached by the browser or Directus, causing:
- Save shows version 3 ✅
- Refresh loads version 2 ❌
- **Stale cached responses returned instead of latest data**

## Fixes Applied

### Fix 1: Fallback Logic
Changed logic in `/src/hooks/usePersistentContent.ts` (lines 124-175):

```typescript
// NEW LOGIC:
if (serverContent !== null) {
  // Field exists in Directus - use it (even if empty)
  finalContent = serverContent;
} else if (hasField === false && item) {
  // Field never set - use empty string
  finalContent = '';
} else {
  // Item doesn't exist - use initialValue as TRUE fallback
  finalContent = initialValue;
}
```

**Key Change**: Only fallback to `initialValue` when:
- Directus API fails (network error)
- Item doesn't exist at all

**Never fallback** when:
- API succeeds but content is empty
- Field exists but has empty value
- User deleted content

### Fix 2: Cache Busting
Added cache-busting headers to API requests in `/src/services/directusService.ts`:

**`getHero()` method (line 512):**
```typescript
const response = await fetch(`${DIRECTUS_URL}/items/hero?_=${Date.now()}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});
```

**`getCollectionItem()` method (line 956):**
```typescript
const response = await fetch(
  `${DIRECTUS_URL}/items/${collection}/${id}?_=${Date.now()}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
);
```

**Key Changes**:
- Added `?_=${Date.now()}` query parameter for cache busting
- Added `Cache-Control`, `Pragma`, and `Expires` headers
- Prevents browser and Directus from serving stale cached responses

## Test Steps

### Test 1: Edit and Refresh
1. Navigate to homepage (`/`)
2. Enable inline editing (if not already enabled)
3. Edit "Categorias Principais" title to "TEST CONTENT"
4. Save changes
5. **Refresh the page (F5 or Cmd+R)**
6. ✅ **Expected**: "TEST CONTENT" should still be visible
7. ❌ **Before fix**: Would show "Categorias Principais" (hardcoded fallback)

### Test 2: Delete Content
1. Edit "Categorias Principais" title
2. Delete all content (make it empty)
3. Save changes
4. **Refresh the page**
5. ✅ **Expected**: Empty field (or placeholder)
6. ❌ **Before fix**: Would show "Categorias Principais" (hardcoded fallback)

### Test 3: Directus API Down
1. Stop Directus backend
2. Refresh the page
3. ✅ **Expected**: Shows hardcoded fallback "Categorias Principais"
4. ✅ **This is correct behavior** - fallback only when API fails

### Test 4: Multiple Fields
Test on different pages:
- `/` - Hero section titles
- `/loja` - Category titles  
- `/contactos` - Contact information

## Verification Commands

```bash
# Check if Directus is running
curl http://localhost:8065/server/health

# View React app
open http://localhost:5173

# Check browser console for logs
# Should see: "✅ Content loaded from Directus" with correct content
```

## Expected Console Logs

**After fix:**
```
✅ Content loaded from Directus: {
  collection: "hero",
  field: "categories_section_title",
  hasField: true,
  serverContent: "TEST CONTENT",
  initialValue: "Categorias Principais"
}
```

**Content used**: "TEST CONTENT" (from Directus) ✅

**Before fix:**
```
✅ Content loaded from Directus: {
  collection: "hero",
  field: "categories_section_title",
  content: "",
  fallback: "Categorias Principais"
}
```

**Content used**: "Categorias Principais" (hardcoded fallback) ❌

## Success Criteria
- [x] Code changes applied to `usePersistentContent.ts`
- [ ] Test 1 passes: Edited content persists after refresh
- [ ] Test 2 passes: Deleted content stays deleted after refresh
- [ ] Test 3 passes: Fallback works when API is down
- [ ] No console errors
- [ ] All existing functionality still works

## Rollback Plan
If issues occur, revert the change:
```bash
git diff src/hooks/usePersistentContent.ts
git checkout src/hooks/usePersistentContent.ts
```
