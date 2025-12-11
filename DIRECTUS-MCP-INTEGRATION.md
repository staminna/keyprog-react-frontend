# Directus + MCP Integration Guide

This guide explains how to integrate your Directus schema with your React frontend using the MCP (Model Context Protocol) server for enhanced type safety and real-time schema awareness.

## 🚀 Quick Start

### 1. Schema Synchronization

Your Directus schema is automatically synchronized to TypeScript types:

```typescript
import { DirectusSchema, DirectusServices, DirectusHeaderMenu } from '@/types/directus-schema';

// Type-safe interfaces generated from your Directus schema
const services: DirectusServices[] = [];
const headerMenu: DirectusHeaderMenu[] = [];
```

### 2. Basic Data Fetching

Use the provided React hooks for type-safe data fetching:

```typescript
import { useServices, useHeaderMenu } from '@/hooks/useDirectusData';

function MyComponent() {
  const { data: services, loading, error } = useServices(true);
  const { data: headerMenu } = useHeaderMenu();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {services?.map(service => (
        <div key={service.id}>{service.title}</div>
      ))}
    </div>
  );
}
```

### 3. MCP Server Integration

The MCP server provides enhanced features beyond the basic Directus SDK:

```typescript
import { createMCPDirectusClient } from '@/lib/mcp-directus';

async function enhancedDataFetch() {
  const mcpClient = await createMCPDirectusClient();
  
  // Access enhanced query methods
  const services = await mcpClient.queriesInstance.getServices(true);
  const schema = await mcpClient.schemaAwarenessInstance.getCurrentSchema();
  
  // Get available MCP tools
  const tools = await mcpClient.listAvailableTools();
  
  mcpClient.close();
}
```

## 📋 Available Hooks

### Data Fetching Hooks

| Hook | Description | Usage |
|------|-------------|-------|
| `useHeaderMenu()` | Fetch header navigation menu | `const { data } = useHeaderMenu();` |
| `useFooterMenu()` | Fetch footer navigation menu | `const { data } = useFooterMenu();` |
| `useHero()` | Fetch hero section data | `const { data } = useHero();` |
| `useServices(publishedOnly?)` | Fetch services list | `const { data } = useServices(true);` |
| `useServiceBySlug(slug)` | Fetch single service by slug | `const { data } = useServiceBySlug('ecu-programming');` |
| `useCategories()` | Fetch product categories | `const { data } = useCategories();` |
| `useSubMenuContent(category?, publishedOnly?)` | Fetch submenu content | `const { data } = useSubMenuContent('loja');` |
| `usePages(publishedOnly?)` | Fetch pages | `const { data } = usePages(true);` |
| `useNews(limit?)` | Fetch news articles | `const { data } = useNews(5);` |
| `useSettings()` | Fetch site settings | `const { data } = useSettings();` |

### Schema Awareness Hook

| Hook | Description | Usage |
|------|-------------|-------|
| `useSchemaAwareness()` | Monitor schema changes in real-time | `const { schema, hasChanges } = useSchemaAwareness();` |

### Batch Operations

| Hook | Description | Usage |
|------|-------------|-------|
| `useBatchDirectusData()` | Fetch multiple collections at once | `const { data, loading } = useBatchDirectusData();` |

## 🔧 MCP Server Features

### 1. Enhanced Data Access

The MCP server provides additional capabilities beyond the standard Directus SDK:

- **Schema-aware queries**: Automatic type validation
- **Bulk operations**: Efficient batch data fetching
- **Real-time subscriptions**: WebSocket-based live updates
- **Resource management**: Intelligent caching and optimization

### 2. Schema Monitoring

Real-time schema awareness allows your application to:

- **Detect schema changes**: Automatically update when Directus schema changes
- **Type safety**: Ensure frontend types match the database schema
- **Validation**: Validate data against current schema
- **Migration assistance**: Help with schema evolution

### 3. Available MCP Tools

The Directus MCP server exposes these tools:

- `read_items`: Read items from a collection with filtering, sorting, and pagination
- `read_item`: Read a single item by ID
- `read_singleton`: Read singleton collections (settings, hero, etc.)
- `create_item`: Create new items
- `update_item`: Update existing items
- `delete_item`: Delete items
- `get_schema`: Get current schema information
- `validate_data`: Validate data against schema

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │────│  TypeScript      │────│  Directus API   │
│                 │    │  Types           │    │                 │
│ • useServices() │    │ • Auto-generated │    │ • REST API      │
│ • useHeader()   │    │ • Type-safe      │    │ • WebSocket     │
│ • useSchema()   │    │ • Schema sync    │    │ • File uploads  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │    │  Schema Cache    │    │  PostgreSQL     │
│                 │    │                  │    │                 │
│ • Fallback SDK  │    │ • Local storage  │    │ • Data storage  │
│ • Real-time     │    │ • Invalidation   │    │ • Relationships │
│ • Tool calling  │    │ • Sync status    │    │ • Constraints   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔄 Development Workflow

### 1. Schema Changes

When you modify your Directus schema:

1. **Automatic detection**: The MCP server detects schema changes
2. **Type regeneration**: Update TypeScript types automatically
3. **Validation**: Ensure frontend code is compatible
4. **Migration**: Handle breaking changes gracefully

### 2. Adding New Collections

To add a new collection to your frontend:

1. **Update Directus**: Create the collection in Directus admin
2. **Generate types**: Run the type generator script
3. **Add hooks**: Create new React hooks for the collection
4. **Update components**: Use the new hooks in your components

### 3. Example: Adding a New Collection

```typescript
// 1. Update types (auto-generated)
export interface DirectusTestimonials {
  id?: string;
  name: string;
  content: string;
  rating: number;
  date_created?: string;
  date_updated?: string;
}

// 2. Add to main schema
export interface DirectusSchema {
  // ... existing collections
  testimonials: DirectusTestimonials[];
}

// 3. Create hook
export function useTestimonials() {
  return useDirectusData(
    (queries) => queries.getTestimonials(),
    []
  );
}

// 4. Add to MCP queries
class MCPDirectusQueries implements DirectusQueries {
  async getTestimonials() {
    return await this.mcpClient.call_tool('read_items', {
      collection: 'testimonials'
    });
  }
}
```

## 🛠️ Configuration

### Environment Variables

```env
# Directus Configuration
VITE_DIRECTUS_URL=http://localhost:8065
VITE_DIRECTUS_TOKEN=your_token_here

# MCP Server Configuration
DIRECTUS_URL=http://localhost:8065
DIRECTUS_TOKEN=your_token_here
MCP_SYSTEM_PROMPT_ENABLED=true
DIRECTUS_PROMPTS_COLLECTION_ENABLED=true
```

### MCP Server Setup

The MCP server is configured to run at:

```bash
cd keyprog-directus/mcp-server
npm start
```

Configuration is in `mcp_config.json`:

```json
{
  "mcpServers": {
    "directus": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "DIRECTUS_URL": "http://localhost:8065",
        "DIRECTUS_TOKEN": "your_token"
      }
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MCP Server Not Connecting**
   - Ensure the Directus instance is running
   - Check the token is valid and has proper permissions
   - Verify the MCP server is built: `npm run build`

2. **Type Errors**
   - Regenerate types: `npm run generate-types`
   - Check the schema synchronization
   - Update your interfaces to match new schema

3. **Data Not Loading**
   - Check network connectivity to Directus
   - Verify API permissions for your token
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```typescript
import { createMCPDirectusClient } from '@/lib/mcp-directus';

const mcpClient = await createMCPDirectusClient();
console.log('Available tools:', await mcpClient.listAvailableTools());
console.log('Available resources:', await mcpClient.listAvailableResources());
```

## 📚 Best Practices

### 1. Type Safety

- Always use the generated TypeScript types
- Validate data before using it in components
- Handle loading and error states properly

### 2. Performance

- Use specific hooks instead of generic ones when possible
- Implement proper caching strategies
- Use batch operations for multiple collections

### 3. Error Handling

- Provide fallback mechanisms (MCP → Directus SDK)
- Show meaningful error messages to users
- Log errors for debugging

### 4. Schema Evolution

- Monitor schema changes with `useSchemaAwareness()`
- Plan for backward compatibility
- Use migration scripts for breaking changes

## 🚀 Advanced Features

### Real-time Updates

```typescript
import { useRealTimeDirectus } from '@/hooks/useDirectusData';

function LiveServices() {
  const { items: services } = useRealTimeDirectus('services');
  
  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
```

### Schema Validation

```typescript
import { SchemaAwareness } from '@/lib/mcp-directus';

const schema = await schemaAwareness.getCurrentSchema();
const validation = await schemaAwareness.validateDataAgainstSchema(
  'services', 
  { title: 'New Service', description: 'Description' }
);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Custom Queries

```typescript
import { createMCPDirectusClient } from '@/lib/mcp-directus';

const mcpClient = await createMCPDirectusClient();

// Custom query with complex filtering
const services = await mcpClient.queriesInstance.getServices();
const filteredServices = services.filter(service => 
  service.title?.toLowerCase().includes('programming')
);
```

This integration provides a robust, type-safe, and real-time aware way to work with your Directus data in React, ensuring your frontend always stays in sync with your backend schema.