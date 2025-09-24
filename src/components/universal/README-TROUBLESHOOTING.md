# Troubleshooting the Universal Inline Editor

This guide provides solutions to common issues with the universal inline editor.

## Console Errors

### 403 Forbidden Errors

If you see errors like:
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
Error fetching settings item: Object
```

This indicates permission issues with Directus. The user doesn't have permission to access certain collections or fields.

**Solution:**
1. Log in to Directus as an admin
2. Go to Settings > Roles & Permissions
3. Find the role used by the editor (usually "Content Editor" or "directus-editor-user")
4. Grant read and update permissions for all collections used by the inline editor

### Missing Fields

If you see errors about missing fields like:
```
Hero badge field missing
```

This indicates that the field exists in the component but not in the Directus schema.

**Solution:**
1. Run the update-directus-schema.cjs script:
   ```bash
   node src/scripts/update-directus-schema.cjs
   ```
2. If the script fails, manually create the field in Directus:
   - Log in to Directus as an admin
   - Go to Settings > Data Model
   - Select the collection (e.g., "hero")
   - Add the missing field (e.g., "badge_text")

### Authentication Issues

If you see errors about authentication:
```
⚠️ Directus Visual Editor detected but no parent token available. Falling back to environment credentials.
```

This indicates that the application is running in the Directus Visual Editor iframe but can't inherit authentication.

**Solution:**
1. Make sure the static token is set in the .env file:
   ```
   DIRECTUS_STATIC_TOKEN=your_token_here
   ```
2. Verify that the autoLogin.ts file is correctly configured to use the static token

## UI Issues

### Editable Content Not Showing

If editable content is not showing the edit indicators or toolbar:

**Solution:**
1. Make sure the CSS is properly loaded:
   ```html
   <link rel="stylesheet" href="/src/components/universal/editable.css">
   ```
2. Verify that the user is authenticated with Directus
3. Check that the `isInlineEditingEnabled` flag is set to `true`

### Toolbar Not Visible

If the editable toolbar is not visible:

**Solution:**
1. Make sure the `EditableToolbar` component is added to the app
2. Check that the user is authenticated with Directus
3. Try pressing the Escape key to toggle the toolbar visibility

## Saving Issues

### Changes Not Saving

If changes are not saving to Directus:

**Solution:**
1. Verify that the user has update permissions for the collection
2. Check the browser console for any errors during save
3. Verify that the collection and field exist in Directus
4. Make sure the itemId is correct

### Unexpected Field Values

If field values are not what you expect:

**Solution:**
1. Check the default values in the components
2. Verify that the field names match between the component and Directus
3. Clear the browser cache and reload the page

## Integration Issues

### Directus Visual Editor Not Working

If the Directus Visual Editor is not working:

**Solution:**
1. Make sure the application is properly integrated with Directus
2. Verify that the postMessage handlers are set up correctly
3. Check that the application is running in an iframe within Directus

### Multiple Editors Conflict

If multiple editors are conflicting:

**Solution:**
1. Make sure each editor has a unique ID
2. Verify that the editors are not trying to edit the same field simultaneously
3. Use the `RecursiveEditableWrapper` to manage editor hierarchy

## Performance Issues

### Slow Editing Experience

If the editing experience is slow:

**Solution:**
1. Reduce the number of editable elements on the page
2. Use the `EditableSection` component to group editable elements
3. Optimize the DOM scanning by using more specific selectors

## Deployment Issues

### Editable Content Not Working in Production

If editable content is not working in production:

**Solution:**
1. Make sure the Directus URL is correctly set in the production environment
2. Verify that the static token is set in the production environment
3. Check that the CORS settings in Directus allow requests from the production domain
4. Verify that the application is properly built and deployed

## Advanced Troubleshooting

For more advanced issues, you can:

1. Enable debug logging:
   ```javascript
   localStorage.setItem('debug', 'directus:*');
   ```

2. Inspect the network requests to Directus to see what's happening

3. Use the browser's developer tools to debug the JavaScript code

4. Check the Directus logs for any server-side issues

If you're still having issues, please open an issue on the GitHub repository or contact the Directus community for help.