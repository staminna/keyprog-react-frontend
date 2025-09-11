# Content Editing with Two-Way Binding Guide

This guide shows you how to use the existing inline editing system for content editing with real-time two-way binding between React and Directus.

## Overview

Your application already has a complete inline editing system with:
- ✅ **InlineText** - Edit text fields inline
- ✅ **InlineRichText** - Rich text editor with formatting
- ✅ **InlineImage** - Image upload and editing
- ✅ **InlineSelect** - Dropdown selection editing
- ✅ **Real-time synchronization** - Changes sync across users
- ✅ **Auto-save** - Debounced automatic saving
- ✅ **Optimistic updates** - Immediate UI feedback
- ✅ **Error handling** - Graceful error recovery

## Basic Usage

### 1. Wrap your component with InlineEditProvider

```tsx
import { InlineEditProvider } from '@/components/inline/InlineEditProvider';
import { InlineEditToolbar } from '@/components/inline/InlineEditToolbar';

function MyPage() {
  return (
    <InlineEditProvider initialEditMode={false}>
      <InlineEditToolbar />
      {/* Your content here */}
    </InlineEditProvider>
  );
}
```

### 2. Use inline editing components

```tsx
import { InlineText } from '@/components/inline/InlineText';

// Edit a service title
<InlineText
  collection="services"
  itemId="1"
  field="title"
  placeholder="Enter service title..."
  className="text-2xl font-bold"
/>

// Edit multi-line description
<InlineText
  collection="services"
  itemId="1"
  field="description"
  placeholder="Enter description..."
  multiline
  className="text-gray-600"
/>
```

### 3. Rich text editing

```tsx
import { InlineRichText } from '@/components/inline/InlineRichText';

<InlineRichText
  collection="news"
  itemId="1"
  field="content"
  placeholder="Write your article..."
  className="min-h-[200px] prose max-w-none"
/>
```

### 4. Image editing

```tsx
import { InlineImage } from '@/components/inline/InlineImage';

<InlineImage
  collection="services"
  itemId="1"
  field="image"
  className="w-full h-48 object-cover rounded-lg"
  placeholder="Click to upload image..."
/>
```

### 5. Select/dropdown editing

```tsx
import { InlineSelect } from '@/components/inline/InlineSelect';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

<InlineSelect
  collection="services"
  itemId="1"
  field="status"
  options={statusOptions}
  renderValue={(value) => (
    <Badge variant={value === 'published' ? 'default' : 'secondary'}>
      {statusOptions.find(opt => opt.value === value)?.label || value}
    </Badge>
  )}
/>
```

## Two-Way Binding Features

### Automatic Synchronization
- Changes are automatically saved to Directus after a debounce period (default 800ms)
- Real-time updates from other users are received via WebSocket
- Optimistic updates provide immediate UI feedback

### Real-Time Collaboration
- Multiple users can edit the same content simultaneously
- Changes from other users appear in real-time
- Conflict resolution handles concurrent edits gracefully

### Data Flow
```
User Input → React State → Debounced Save → Directus API → WebSocket → Other Users
     ↑                                                           ↓
     ←─────────────── Real-time Updates ←─────────────────────────
```

## Advanced Usage

### Custom Error Handling

```tsx
<InlineText
  collection="services"
  itemId="1"
  field="title"
  onError={(error) => {
    console.error('Save failed:', error);
    toast.error('Failed to save changes');
  }}
  onSuccess={(value) => {
    console.log('Saved successfully:', value);
    toast.success('Changes saved');
  }}
/>
```

### Custom Debouncing

```tsx
// Faster saves for critical fields
<InlineText
  collection="orders"
  itemId="1"
  field="status"
  debounceMs={200}
/>

// Slower saves for large content
<InlineRichText
  collection="news"
  itemId="1"
  field="content"
  debounceMs={2000}
/>
```

### Non-optimistic Updates

```tsx
// Wait for server confirmation before showing changes
<InlineText
  collection="critical_data"
  itemId="1"
  field="value"
  optimistic={false}
/>
```

## Editing Different Content Types

### Hero Section (Singleton)
```tsx
<InlineText
  collection="hero"
  itemId="hero"  // Singleton uses collection name as ID
  field="title"
  className="text-4xl font-bold"
/>
```

### Services
```tsx
<InlineText
  collection="services"
  itemId={serviceId}
  field="title"
  className="text-xl font-semibold"
/>
```

### News Articles
```tsx
<InlineRichText
  collection="news"
  itemId={newsId}
  field="content"
  className="prose max-w-none"
/>
```

### Settings
```tsx
<InlineText
  collection="settings"
  itemId="settings"
  field="site_title"
  className="text-lg font-medium"
/>
```

## Keyboard Shortcuts

- **Enter** - Save single-line text field
- **Ctrl/Cmd + Enter** - Save multi-line text field
- **Escape** - Cancel editing and revert changes

## Edit Mode Controls

The `InlineEditToolbar` provides:
- **Enable/Disable Edit Mode** - Toggle editing capability
- **Save All** - Save all pending changes
- **Revert All** - Cancel all unsaved changes
- **Edit Status** - Shows if any fields are currently being edited

## Best Practices

### 1. Use Appropriate Components
- `InlineText` for short text fields
- `InlineRichText` for formatted content
- `InlineImage` for image uploads
- `InlineSelect` for predefined options

### 2. Provide Good UX
- Always include meaningful placeholders
- Use appropriate CSS classes for styling
- Handle errors gracefully
- Show loading states

### 3. Performance
- Use debouncing for frequent updates
- Consider optimistic updates for better UX
- Implement proper error boundaries

### 4. Security
- Validate data on the server side
- Use proper authentication (already implemented)
- Sanitize rich text content

## Integration with Existing Components

You can easily add inline editing to existing components:

```tsx
// Before
<h1 className="text-2xl font-bold">{service.title}</h1>

// After
<InlineText
  collection="services"
  itemId={service.id}
  field="title"
  value={service.title}  // Optional: provide initial value
  className="text-2xl font-bold"
/>
```

## Real-Time Service

The `RealTimeService` handles WebSocket connections and provides:
- Automatic reconnection
- Authentication with Directus
- Collection-specific subscriptions
- Global event handling

## Error Recovery

The system handles various error scenarios:
- Network failures (automatic retry)
- Authentication errors (re-authentication)
- Validation errors (user feedback)
- Concurrent edit conflicts (last-write-wins)

## Testing

To test the inline editing system:
1. Enable edit mode using the toolbar
2. Click on any editable field
3. Make changes and observe auto-save
4. Open the same page in another browser/tab
5. Make changes in one tab and see them appear in the other

This demonstrates the complete two-way binding between React and Directus with real-time synchronization.
