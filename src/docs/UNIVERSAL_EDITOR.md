# Universal Content Editor Documentation

This document explains how to use the Universal Content Editor system, which enables editing content across all pages, menus, and submenus in the Keyprog application.

## Overview

The Universal Content Editor system provides a seamless way to edit content throughout the application, regardless of the page type or content structure. It handles special syntax like `doc(paragraph(...))` and works with both regular collections and singletons.

## Key Components

### 1. EditorActivator

The `EditorActivator` component adds a floating button to any page, allowing users to activate the editor interface. When clicked, it opens a sidebar with editing controls specific to the current page.

```tsx
// Add to your layout
<EditorActivator />
```

### 2. UniversalContentEditor

The `UniversalContentEditor` component is the core editing component that can be used anywhere in the application to make content editable:

```tsx
<UniversalContentEditor
  collection="pages"
  itemId="123"
  field="title"
  value="Page Title"
  className="text-2xl font-bold"
/>
```

### 3. ContentParser

The `ContentParser` component handles special syntax like `doc(paragraph(...))` and renders it properly:

```tsx
<ContentParser content={content} />
```

### 4. MenuEditor

The `MenuEditor` component provides specialized editing for menu items:

```tsx
<MenuEditor collection="header_menu" onUpdate={handleUpdate} />
```

## Content Types

The system supports various content types:

1. **Regular Pages**: Content from collections like `pages`, `services`, etc.
2. **Menus**: Header and footer menu items
3. **Submenus**: Submenu content items
4. **Settings**: Global settings and configuration

## Singleton Collections

Some collections are treated as singletons (having only one item):

- `settings`
- `hero`
- `contact_info`

These are handled differently from regular collections, using specific methods like `getSettings()` and `updateSettings()`.

## Schema Validation

The system includes schema validation using the MCP server:

```tsx
// Validate a field value
const validation = await SchemaValidator.validateField('pages', 'title', 'New Title');
if (!validation.valid) {
  console.error(validation.errors);
}
```

## Authentication and Permissions

Editing is only available to authenticated users with appropriate permissions:

1. **Authentication**: Users must be authenticated with Directus or in the Directus Visual Editor
2. **Role Permissions**: Users must have the correct role permissions for the collection and field

## Special Syntax Handling

The system automatically handles `doc(paragraph(...))` syntax:

1. When displaying content, it parses and removes this syntax
2. When saving content, it ensures the syntax is properly cleaned

## Integration with Directus

The system integrates with Directus in several ways:

1. **DirectusServiceExtension**: Handles permissions, collection mapping, and error recovery
2. **Collection Mapping**: Maps virtual collections to actual Directus collections
3. **Singleton Handling**: Special handling for singleton collections

## Error Handling

The system includes robust error handling:

1. **Permission Errors**: Falls back to alternative collections when permission errors occur
2. **404 Errors**: Handles missing collections by falling back to settings
3. **Validation Errors**: Validates content before saving

## Usage Examples

### Making a Page Section Editable

```tsx
<section>
  <UniversalContentEditor
    collection="pages"
    itemId={pageId}
    field="title"
    value={pageData.title}
    className="text-3xl font-bold"
  />
  
  <UniversalContentEditor
    collection="pages"
    itemId={pageId}
    field="content"
    value={pageData.content}
    className="prose mt-4"
  />
</section>
```

### Editing Menu Items

```tsx
<MenuEditor 
  collection="header_menu" 
  onUpdate={() => console.log('Menu updated')} 
/>
```

### Using the Universal Page Editor

```tsx
<UniversalPageEditor
  pageType="page"
  pageId="123"
  slug="about-us"
/>
```

## Troubleshooting

### Content Not Updating

1. Check if the user has the correct permissions
2. Verify that the collection and field exist in Directus
3. Check for console errors related to API requests

### doc(paragraph(...)) Syntax Still Visible

1. Make sure the ContentParser component is being used
2. Verify that the content is being passed through parseDocParagraphSyntax

### Menu Items Not Editable

1. Ensure the collection is properly defined in MENU_COLLECTIONS
2. Check that the user has permissions for the menu collection

## Best Practices

1. **Use UniversalContentEditor** for individual fields
2. **Use MenuEditor** for menu-specific editing
3. **Use UniversalPageEditor** for full page editing
4. **Always check permissions** before allowing edits
5. **Parse content** to handle special syntax

## Conclusion

The Universal Content Editor system provides a flexible and robust way to edit content throughout the application. By following the guidelines in this document, you can ensure a seamless editing experience for users while maintaining proper permissions and data integrity.
