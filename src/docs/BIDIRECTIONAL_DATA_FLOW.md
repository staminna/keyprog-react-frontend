# Bidirectional Data Flow: React ↔ Directus

This document explains the bidirectional data flow implementation between React and Directus CMS in our application.

## Overview

The bidirectional data flow system enables seamless synchronization of content between the React frontend and Directus CMS backend. This allows content editors to make changes directly in the frontend interface, with those changes automatically reflected in Directus, and vice versa.

## Key Components

### 1. useDirectusContent Hook

The core of the bidirectional data flow is the `useDirectusContent` hook, which provides a simple interface for components to interact with Directus data:

```typescript
const {
  data,           // The content data
  isLoading,      // Loading state
  error,          // Error state
  refresh,        // Function to refresh data
  updateField,    // Function to update a specific field
  updateFields,   // Function to update multiple fields
  canEdit,        // Whether the user can edit this content
  isSyncing       // Whether data is currently being synchronized
} = useDirectusContent({
  collection,     // Directus collection name
  itemId,         // Item ID (for regular collections)
  slug,           // Slug (alternative to itemId)
  autoSync,       // Enable automatic synchronization
  syncInterval,   // Interval for automatic synchronization
  fallbackCollection, // Fallback collection to try if primary fails
  transform       // Transform function for data
});
```

### 2. ContactService

The `ContactService` provides specialized methods for handling contact information with bidirectional synchronization across multiple collections:

- `getContactInfo()`: Gets contact information with fallbacks
- `updateContactInfo()`: Updates contact information in multiple collections
- `updateContactField()`: Updates a specific contact field with bidirectional sync

### 3. DirectusServiceExtension

The `DirectusServiceExtension` extends the base `DirectusService` with improved error handling and permission management:

- `getCollectionItemSafe()`: Gets a collection item with fallbacks
- `updateCollectionItemSafe()`: Updates a collection item with fallbacks
- `updateField()`: Updates a specific field with proper mapping

### 4. UI Components

Several UI components demonstrate the bidirectional data flow:

- `ContactInfoEditor`: Specialized editor for contact information
- `DirectusContentExample`: Generic component for editing any Directus content
- `BidirectionalDemoPage`: Demo page showcasing all bidirectional components

## How to Use

### Basic Usage

```tsx
import { useDirectusContent } from '@/hooks/useDirectusContent';

function MyComponent() {
  const { data, isLoading, error, updateField } = useDirectusContent({
    collection: 'pages',
    slug: 'about'
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data?.title}</h1>
      <p>{data?.content}</p>
      
      <button onClick={() => updateField('title', 'New Title')}>
        Update Title
      </button>
    </div>
  );
}
```

### Contact Information

For contact information, use the specialized `ContactInfoEditor` component:

```tsx
import { ContactInfoEditor } from '@/components/contacts/ContactInfoEditor';

function ContactPage() {
  return (
    <div>
      <h1>Contact Us</h1>
      <ContactInfoEditor />
    </div>
  );
}
```

### Generic Content Editing

For any Directus collection, use the `DirectusContentExample` component:

```tsx
import { DirectusContentExample } from '@/components/examples/DirectusContentExample';

function ServicesPage() {
  return (
    <div>
      <h1>Our Services</h1>
      <DirectusContentExample
        collection="services"
        fields={['title', 'description', 'price']}
        title="Service Editor"
      />
    </div>
  );
}
```

## Error Handling

The bidirectional data flow system includes robust error handling:

1. **Multiple Fallbacks**: If a primary collection fails, the system tries fallback collections
2. **Default Values**: If all data fetching fails, default values are provided
3. **Error States**: Components display appropriate error messages with retry options
4. **Console Logging**: Detailed error information is logged to the console

## Synchronization

Data synchronization happens in several ways:

1. **Initial Load**: Data is fetched when components mount
2. **Auto-Sync**: Optional automatic synchronization at specified intervals
3. **Manual Refresh**: Users can manually refresh data
4. **Update Events**: Data is refreshed after successful updates

## Authentication and Permissions

The system respects Directus authentication and permissions:

1. **Authentication Check**: Components check if the user is authenticated
2. **Permission Check**: Components check if the user has permission to edit
3. **Visual Indicators**: UI shows when editing is allowed
4. **Directus Editor Integration**: Special handling for Directus Visual Editor context

## Best Practices

1. **Use Specialized Components**: Use specialized components like `ContactInfoEditor` for specific content types
2. **Handle Loading States**: Always handle loading states in your components
3. **Provide Error Feedback**: Display error messages and retry options
4. **Set Appropriate Sync Intervals**: Choose sync intervals based on content update frequency
5. **Use Fallback Collections**: Specify fallback collections for critical data

## Troubleshooting

### Common Issues

- **403 Forbidden**: Check user permissions in Directus
- **404 Not Found**: Verify collection and item exist
- **Sync Failures**: Check network connectivity and API endpoints
- **Stale Data**: Try manual refresh or adjust sync interval

### Debugging

Enable debug logging in development:

```tsx
// In your .env.development file
VITE_DEBUG_DIRECTUS=true
```

## Demo

Visit the `/bidirectional-demo` page to see all bidirectional components in action.
