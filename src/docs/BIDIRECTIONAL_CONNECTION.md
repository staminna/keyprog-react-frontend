# Bidirectional Connection: React ↔ Directus

This document explains how to use the bidirectional connection system between React and Directus implemented in this project.

## Overview

The bidirectional connection allows data to flow seamlessly between React components and Directus CMS. Changes made in React are automatically synced to Directus, and changes in Directus are reflected in React components.

## Key Components

### 1. Custom Hooks

The system provides specialized hooks for different content types:

- `useContactInfo`: For managing contact information
- `usePage`: For managing page content

These hooks provide a consistent interface with the following features:

- Real-time data synchronization
- Error handling
- Loading states
- Bidirectional updates

### 2. DirectusServiceExtension

The `DirectusServiceExtension` class extends the base `DirectusService` with additional functionality:

- Collection mapping
- Permission handling
- Fallback mechanisms
- Field mapping between collections

### 3. UI Components

Ready-to-use components demonstrate the bidirectional connection:

- `ContactInfoManager`: For managing contact information
- `PageManager`: For managing page content
- `ContactBidirectionalExample`: Example showing real-time bidirectional sync

## How to Use

### Contact Information

```tsx
import { useContactInfo } from '@/hooks/useContactInfo';

function ContactSection() {
  const { 
    contactInfo, 
    isLoading, 
    error, 
    refresh, 
    updateContactInfo, 
    isSyncing 
  } = useContactInfo();
  
  // Display contact info
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>{contactInfo?.title}</h2>
      <p>Email: {contactInfo?.email}</p>
      <p>Phone: {contactInfo?.phone}</p>
      
      {/* Update contact info */}
      <button onClick={() => updateContactInfo({ 
        email: 'new@example.com',
        phone: '+351 123 456 789'
      })}>
        Update Contact
      </button>
    </div>
  );
}
```

### Page Content

```tsx
import { usePage } from '@/hooks/usePage';

function PageContent({ slug }) {
  const { 
    page, 
    isLoading, 
    error, 
    refresh, 
    updatePage, 
    isSyncing 
  } = usePage({ slug });
  
  // Display page content
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{page?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page?.content }} />
      
      {/* Update page content */}
      <button onClick={() => updatePage({ 
        title: 'Updated Title'
      })}>
        Update Title
      </button>
    </div>
  );
}
```

## Configuration Options

### useContactInfo Options

```tsx
const { contactInfo, ... } = useContactInfo({
  autoSync: true,       // Enable automatic synchronization
  syncInterval: 30000   // Sync every 30 seconds
});
```

### usePage Options

```tsx
const { page, ... } = usePage({
  slug: 'about-us',     // Fetch by slug
  id: 123,              // Or fetch by ID
  autoSync: true,       // Enable automatic synchronization
  syncInterval: 30000   // Sync every 30 seconds
});
```

## Collection Mapping

The system automatically maps between different collections based on field relationships:

- `contact_info` ↔ `settings`: Maps contact fields to settings fields
- `contacts` ↔ `contact_info`: Maps contact collection to contact info singleton
- `hero` ↔ `settings`: Maps hero fields to settings fields

## Error Handling

The system includes robust error handling:

- Fallback to default values when data can't be loaded
- Automatic retry mechanisms
- Clear error messages
- Graceful degradation

## Advanced Usage

### Direct API Access

For advanced use cases, you can access the DirectusServiceExtension directly:

```tsx
import { DirectusServiceExtension } from '@/services/directusServiceExtension';

// Get contact info with fallback mechanisms
const contactInfo = await DirectusServiceExtension.getContactInfo();

// Update contact info in multiple collections
await DirectusServiceExtension.updateContactInfo({
  title: 'Contact Us',
  email: 'contact@example.com'
});

// Update a specific field with collection mapping
await DirectusServiceExtension.updateField(
  'contact_info',
  '1',
  'email',
  'new@example.com'
);
```

## Best Practices

1. **Use the provided hooks** for most use cases
2. **Handle loading and error states** properly
3. **Implement optimistic updates** for better UX
4. **Set appropriate sync intervals** based on content update frequency
5. **Validate data** before sending to Directus

## Troubleshooting

### Common Issues

- **403 Forbidden errors**: Check permissions in Directus
- **Data not syncing**: Verify sync interval settings
- **Missing fields**: Check collection mapping in DirectusServiceExtension

### Debugging

Enable debug logging to see detailed information about sync operations:

```tsx
// In your .env file
VITE_DEBUG_DIRECTUS=true
```

## Example Implementation

See the `ContactBidirectionalExample` component for a complete working example of bidirectional synchronization between React and Directus.
