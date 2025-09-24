# Universal Inline Editor Components

This directory contains components that enable universal inline editing for all content in the React frontend.

## Components

### UniversalContentEditor

The base component for inline editing. It handles the actual editing of content and saving to Directus.

```tsx
<UniversalContentEditor
  collection="hero"
  itemId="1"
  field="title"
  value="Hello World"
  tag="h1"
  className="text-4xl font-bold"
  placeholder="Enter title..."
/>
```

### ContentMapper

Automatically maps content from Directus to React components based on the current route.

```tsx
<ContentMapper
  collection="services"
  field="title"
  tag="h1"
  className="text-4xl font-bold"
  placeholder="Enter title..."
  fallback="Default Title"
/>
```

### AutoEditableContent

Makes any content editable with minimal configuration. It automatically detects the content type.

```tsx
<AutoEditableContent
  collection="services"
  field="title"
  itemId="1"
  tag="h1"
  className="text-4xl font-bold"
>
  This content will be editable
</AutoEditableContent>
```

### RouteContentScanner

Scans the current route and makes all content editable. It automatically detects the content type based on the route.

```tsx
<RouteContentScanner />
```

## Hooks

### useRouteContent

Hook to get content mapping for the current route. This helps components know which collection and item ID to use for editing.

```tsx
const { collection, itemId, slug, isLoading } = useRouteContent();
```

## Integration with MCP Server

The `mcpDirectusService.ts` file provides integration with the Directus MCP server for optimized content management.

```tsx
import { MCPDirectusService } from '@/services/mcpDirectusService';

// Initialize the MCP service
await MCPDirectusService.initialize();

// Get all collections
const collections = await MCPDirectusService.getCollections();

// Get schema for a collection
const schema = await MCPDirectusService.getCollectionSchema('services');

// Get editable fields for a collection
const fields = await MCPDirectusService.getEditableFields('services');

// Scan all collections for editable fields
const mapping = await MCPDirectusService.scanAllCollections();
```

## Usage

To make any content editable, wrap it with one of the universal components:

```tsx
// Simple text
<UniversalContentEditor
  collection="services"
  itemId={service.id}
  field="title"
  value={service.title}
  tag="h1"
  className="text-4xl font-bold"
/>

// Rich text
<UniversalContentEditor
  collection="services"
  itemId={service.id}
  field="description"
  value={service.description}
  tag="div"
  className="prose prose-lg"
/>

// Badge content
<Badge variant="default">
  <UniversalContentEditor
    collection="services"
    itemId={service.id}
    field="category"
    value={service.category}
    tag="span"
  />
</Badge>
```

For automatic content mapping based on the current route:

```tsx
<ContentMapper
  collection="services"
  field="title"
  tag="h1"
  className="text-4xl font-bold"
/>
```

## Adding New Editable Sections

1. Identify the section you want to make editable
2. Determine the collection and field it belongs to
3. Replace the static content with a `UniversalContentEditor` component
4. If the collection or field doesn't exist, create it using the MCP server

Example:

```tsx
// Before
<p className="mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide text-primary">
  Especialistas em eletrónica automóvel
</p>

// After
<div className="mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide text-primary">
  <UniversalContentEditor
    collection="hero"
    itemId="1"
    field="badge_text"
    value="Especialistas em eletrónica automóvel"
    tag="p"
  />
</div>
```