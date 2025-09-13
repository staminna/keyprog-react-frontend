# Collection Mapping Documentation

This document explains how the collection mapping system works to handle permissions, virtual collections, and singletons in the Keyprog application.

## Overview

The collection mapping system allows you to map virtual collections (like `hero` and `contact_info`) to actual Directus collections (like `settings`) that have the proper permissions. This is particularly useful when:

1. You need to edit content that doesn't have a dedicated collection in Directus
2. You're experiencing permission issues with certain collections
3. You want to organize related content fields under virtual collections for better UX

## Collection Types

The system handles two main types of collections:

### Regular Collections

These are standard Directus collections with multiple items, each having a unique ID. Examples include:
- `services`
- `pages`
- `blog_posts`
- `news`

### Singleton Collections

These are special collections that contain only a single item and don't use IDs. Examples include:
- `settings`
- `hero`
- `contact_info`

Singleton collections are handled differently by the system, using specific Directus methods like `readSingleton` and `updateSingleton` instead of `readItem` and `updateItem`.

## How It Works

### Collection Mapper Component

The `CollectionMapper` component intercepts requests to virtual collections and redirects them to the actual collections with proper permissions:

```tsx
<CollectionMapper
  collection="hero"        // Virtual collection
  itemId="1"               // Item ID
  field="title"            // Virtual field
  value="Welcome"          // Content value
  canEdit={true}           // Whether editing is allowed
/>
```

In this example, `hero` might be mapped to the `settings` collection, and `title` might be mapped to `site_title`.

### DirectusServiceExtension

The `DirectusServiceExtension` class provides methods to handle permissions and collection types properly:

- `updateField`: Maps fields to the correct collection before updating
- `getCollectionItemSafe`: Tries to get items from multiple collections if needed
- `updateCollectionItemSafe`: Tries to update items in multiple collections if needed
- `isSingleton`: Checks if a collection is a singleton
- `collectionExists`: Checks if a collection exists and is a regular collection

## Configuration

### Collection Mappings

Collection mappings are defined in the `CollectionMapper.tsx` file:

```tsx
const COLLECTION_MAPPINGS: CollectionMapping = {
  // Map hero collection to settings
  'hero': {
    collection: 'settings',
    fieldMappings: {
      'title': 'site_title',
      'subtitle': 'site_description',
      'primary_button_text': 'primary_button_text',
      'primary_button_link': 'primary_button_link',
      'image': 'hero_image'
    }
  },
  // Map contact_info collection to settings
  'contact_info': {
    collection: 'settings',
    fieldMappings: {
      'title': 'contact_title',
      'email': 'contact_email',
      'phone': 'contact_phone',
      'chat_hours': 'contact_hours',
      'contact_form_text': 'contact_form_text',
      'contact_form_link': 'contact_form_link',
      'image': 'contact_image'
    }
  }
};
```

## Directus Permissions Setup

To ensure this system works properly, you need to set up permissions in Directus:

1. **Settings Collection**: Ensure the Directus editor role has read/write permissions for the `settings` collection
2. **Virtual Collections**: If you're using actual collections for `hero` or `contact_info`, you may need to adjust permissions or rely on the mapping

### Singleton Collection Configuration

Singleton collections are defined in the `COLLECTION_EXISTS` object in `DirectusServiceExtension.ts`:

```typescript
const COLLECTION_EXISTS: Record<string, boolean> = {
  'settings': false,  // Settings is a singleton, not a collection with IDs
  'hero': false,      // Hero is a singleton
  'contact_info': false, // Contact info is a singleton
  'services': true,   // Services is a regular collection
  'pages': true,      // Pages is a regular collection
  // ...
};
```

When a collection is marked as `false`, it's treated as a singleton. When marked as `true` or not listed, it's treated as a regular collection.

### Troubleshooting Permission Issues

If you're seeing 403 Forbidden errors:

1. Check the Directus logs to see which collection is causing the permission issue
2. Verify that the mapped collection (e.g., `settings`) has proper permissions
3. Update the collection mappings to point to collections with appropriate permissions
4. Make sure the fields exist in the target collection

### Troubleshooting

If you're seeing errors when updating content:

### 403 Forbidden Errors

1. Check the Directus logs to see which collection is causing the permission issue
2. Verify that the mapped collection (e.g., `settings`) has proper permissions
3. Update the collection mappings to point to collections with appropriate permissions
4. Make sure the fields exist in the target collection

### 404 Not Found Errors

1. Check if the collection exists in Directus
2. If it's a singleton, make sure it's properly defined in `COLLECTION_EXISTS`
3. For regular collections, verify that the item with the specified ID exists
4. Check if the collection should be accessed as a singleton instead

## Adding New Mappings

To add a new virtual collection mapping:

1. Update the `COLLECTION_MAPPINGS` object in `CollectionMapper.tsx`
2. Add the new collection and its field mappings
3. Make sure the target collection has the necessary fields
4. Set up proper permissions in Directus

Example:

```tsx
'products': {
  collection: 'items',
  fieldMappings: {
    'name': 'product_name',
    'price': 'product_price',
    'description': 'product_description'
  }
}
```

## Best Practices

1. **Use Consistent Mappings**: Keep mappings consistent across your application
2. **Document Field Mappings**: Keep track of which virtual fields map to which actual fields
3. **Check Permissions**: Ensure the target collections have proper permissions
4. **Use Meaningful Field Names**: Use descriptive field names in both virtual and actual collections
5. **Test After Changes**: Always test editing functionality after updating mappings
