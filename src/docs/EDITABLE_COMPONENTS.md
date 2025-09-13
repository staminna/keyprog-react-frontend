# Editable Components Documentation

This document explains how to use the editable components across all pages in the Keyprog application.

## Overview

The editable components allow content to be edited directly on any page of the website. This is achieved through:

1. A global edit mode system that appears for authenticated users
2. Editable components that can be placed anywhere in the application
3. Integration with Directus for content storage and retrieval
4. Preview mode for reviewing changes before saving
5. Role-based permissions for controlling who can edit what content

## Available Components

### PageSection

Use `PageSection` to make any text content editable:

```tsx
<PageSection
  id="1"                           // Directus item ID
  collection="settings"            // Directus collection name
  field="page_title"               // Field name in the collection
  value="Default Value"            // Default value if not found in Directus
  tag="h1"                         // HTML tag to render (optional, default: div)
  className="text-4xl font-bold"   // CSS classes (optional)
  previewValue="Preview Value"     // Value to show in preview mode (optional)
/>
```

### PageImage

Use `PageImage` to make any image editable:

```tsx
<PageImage
  id="1"                           // Directus item ID
  collection="settings"            // Directus collection name
  field="hero_image"               // Field name in the collection
  value=""                         // Image URL or empty string
  alt="Hero Image"                 // Alt text (optional)
  className="my-4"                 // Container CSS classes (optional)
  imgClassName="w-full rounded-lg" // Image CSS classes (optional)
  previewValue="/path/to/image.jpg" // Image URL to show in preview mode (optional)
/>
```

### PageButton

Use `PageButton` to make button text editable:

```tsx
<PageButton
  id="1"                           // Directus item ID
  collection="settings"            // Directus collection name
  field="cta_button_text"          // Field name in the collection
  value="Learn More"               // Button text
  linkTo="/about"                  // Link destination (optional)
  variant="default"                // Button variant (optional)
  size="lg"                        // Button size (optional)
  previewValue="Preview Text"      // Button text to show in preview mode (optional)
/>
```

## How to Use

1. **Import the components**:
   ```tsx
   import { PageSection, PageImage, PageButton } from '@/components/editable';
   ```

2. **Replace static content with editable components**:
   ```tsx
   // Before
   <h1 className="text-4xl font-bold">Welcome to Keyprog</h1>
   
   // After
   <PageSection
     id="1"
     collection="settings"
     field="home_title"
     value="Welcome to Keyprog"
     tag="h1"
     className="text-4xl font-bold"
   />
   ```

3. **Set up Directus collections**:
   - Create a collection in Directus (e.g., "settings")
   - Add fields that match the `field` props in your components
   - Add at least one item with the ID that matches the `id` prop

## Role-Based Permissions

The editable components support role-based access control, allowing you to specify which user roles can edit which content:

```tsx
// Example of role-based permissions
const permissions = [
  { collection: 'settings', allowedRoles: ['admin', 'editor'] },
  { collection: 'blog_posts', allowedRoles: ['admin', 'editor', 'author'] },
  { collection: 'settings', field: 'site_title', allowedRoles: ['admin'] }
];
```

Each editable component automatically checks if the current user has permission to edit the specific collection and field.

For more details on role-based permissions, see [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md).

## Editing Modes

The application supports three editing modes:

### View Mode

Default mode for viewing content as it appears to regular users.

### Edit Mode

Edit mode is automatically available for:
- Users authenticated with Directus
- Users in the Directus Visual Editor

When in edit mode:
1. A blue banner appears at the top of the page
2. Editable content is highlighted with blue dashed borders
3. Clicking on editable content opens the editor
4. Changes are saved to Directus when confirmed

### Preview Mode

Preview mode allows users to see how their edits will look before saving:

1. A green banner appears at the top of the page
2. Editable content shows the preview value with green dashed borders
3. No changes are saved to Directus in this mode
4. Perfect for reviewing changes before committing them

### Switching Between Modes

There are two ways to switch between modes:

1. **Mode Buttons**: Click the View, Edit, or Preview buttons in the bottom-right corner
2. **Keyboard Shortcuts**:
   - `Ctrl/Cmd + 1`: Switch to View Mode
   - `Ctrl/Cmd + 2`: Switch to Edit Mode
   - `Ctrl/Cmd + 3`: Switch to Preview Mode

## Best Practices

1. **Use consistent IDs and collections**: Keep the same `id` and `collection` for related content
2. **Provide meaningful default values**: Always include a default value in case the Directus data is not available
3. **Use semantic HTML tags**: Specify appropriate tags for SEO and accessibility
4. **Group related content**: Use the same collection for content that should be edited together
5. **Test in all modes**: Verify that your page looks good in view, edit, and preview modes
6. **Use preview mode for testing**: Use preview mode to check how content will look before saving
7. **Provide preview values**: Add previewValue props when you want to demonstrate specific content states
8. **Set appropriate role permissions**: Define which user roles can edit which content
9. **Use field-level permissions**: For sensitive content, set permissions at the field level

## Troubleshooting

- **Content not updating**: Verify that the collection, field, and ID match in Directus
- **Edit mode not appearing**: Check that the user is authenticated or in the Directus Visual Editor
- **Styling issues**: Make sure CSS classes are applied correctly to both the editable component and its container
- **Preview not showing changes**: Ensure you've made edits in Edit Mode before switching to Preview Mode
- **Keyboard shortcuts not working**: Make sure no other application is capturing the same keyboard shortcuts

## Additional Resources

- [PREVIEW_MODE.md](./PREVIEW_MODE.md) - Detailed information about the preview mode feature
- [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md) - Documentation for the role-based permissions system
- [COLLECTION_MAPPING.md](./COLLECTION_MAPPING.md) - Information about mapping virtual collections to actual collections
