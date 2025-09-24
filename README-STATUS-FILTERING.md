# Status Filtering for Directus Collections

This document explains how we've implemented status filtering for Directus collections to ensure that only published items are displayed in the React frontend.

## Implementation

We've updated the DirectusService methods to filter out archived and draft items, ensuring that only published items are displayed in the React frontend.

### 1. Updated DirectusService Methods

The following methods now include a status filter:

- `getServices()`: Only returns services with status = 'published'
- `getNews()`: Only returns news items with status = 'published'
- `getPages()`: Only returns pages with status = 'published'
- `getPage(slug)`: Only returns pages with status = 'published'
- `getSubMenuContentByCategory(category)`: Only returns submenu content with status = 'published' (this was already implemented)

### 2. Updated Interfaces

We've updated the following interfaces to include a properly typed status field:

- `DirectusServices`: status?: 'published' | 'draft' | 'archived'
- `DirectusPages`: status?: 'published' | 'draft' | 'archived'
- `DirectusNews`: status?: 'published' | 'draft' | 'archived'
- `DirectusSubMenuContent`: status: 'published' | 'draft' | 'archived'
- `DirectusProduct`: status: 'published' | 'draft' | 'archived'

### 3. Setup Script

We've created a script to set up the status field for collections that don't have it:

```javascript
// src/scripts/setup-directus-mcp.js
import { mcp2_create_field } from '../mcp-tools.js';

// Create status field for a collection
await mcp2_create_field({
  collection,
  field: 'status',
  type: 'string',
  interface: 'select-dropdown',
  options: {
    choices: [
      { text: 'Published', value: 'published' },
      { text: 'Draft', value: 'draft' },
      { text: 'Archived', value: 'archived' }
    ]
  },
  note: 'Publication status',
  default_value: 'published'
});
```

### 4. Badge Text Field

We've also implemented automatic creation of the badge_text field in the hero collection:

1. **UniversalContentEditor**: Now automatically creates fields when they don't exist
2. **DirectusServiceExtension**: Added a createField method to create fields in Directus
3. **Setup Script**: Creates the badge_text field in the hero collection if it doesn't exist

## Usage

### Filtering by Status in API Calls

```typescript
const items = await directus.request(
  readItems('collection_name', {
    filter: {
      status: {
        _eq: 'published'
      }
    }
  })
);
```

### Setting Status When Creating Items

```typescript
await DirectusService.createCollectionItem('collection_name', {
  title: 'Item Title',
  description: 'Item Description',
  status: 'published' // or 'draft' or 'archived'
});
```

### Updating Status

```typescript
await DirectusService.updateCollectionItem('collection_name', itemId, {
  status: 'published' // or 'draft' or 'archived'
});
```

## Benefits

1. **Content Management**: Content editors can create draft items without them appearing on the live site
2. **Archiving**: Items can be archived instead of deleted, preserving their data
3. **Publishing Workflow**: Supports a proper publishing workflow with draft, published, and archived states

## Conclusion

By implementing status filtering, we ensure that only published content is displayed on the frontend, while still allowing content editors to create draft items and archive old ones.