# Browser Console Filter - Immediate Solution

## Problem
Your console is flooded with repetitive logs making it hard to debug.

## Solution: Use Browser Console Filters

### Chrome/Edge DevTools

1. **Open DevTools**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

2. **Go to Console Tab**

3. **Add Filters**:
   - Look for the filter text box at the top
   - Click the dropdown next to it
   - Choose "Hide messages matching"
   - Add these patterns (one per line):

```
useRolePermissions
UniversalContentEditor
🔑 useRolePermissions
❌ isEditorOrAdmin
🔐 UniversalContentEditor
Session token exists
No session token found
```

### Alternative: Use Regex Filter

In the filter box, enable "Regex" and use:
```regex
(useRolePermissions|UniversalContentEditor|Session token)
```

Then check "Invert" to hide matching logs.

## Result

After applying filters:
- ✅ Console shows only important logs
- ✅ Authentication flows visible
- ✅ Errors still show up
- ✅ Much easier to debug

## Keep These Logs

You WANT to see:
- ✅ Authentication successful
- ✅ Authenticated as: [email]
- ✅ Error messages
- ✅ File upload status
- ✅ API errors

## Settings Persist

Browser filters are saved, so you only need to set this up once per browser/profile.

---

**Pro Tip**: Create a browser profile specifically for development with these filters pre-configured.
