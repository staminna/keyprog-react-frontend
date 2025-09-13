# Technical Report: Universal Content Editing System

## Problem Statement

The Keyprog project faced two critical issues:

1. **doc(paragraph(...)) Syntax**: Content was being displayed with raw `doc(paragraph(...))` syntax in the UI, making it unreadable and unprofessional.
2. **Limited Editing Capabilities**: The editor only worked on specific pages and didn't support menus, submenus, or certain content types.

## Solution Architecture

We implemented a comprehensive solution with multiple layers:

### 1. Content Parsing Layer

**Key Components:**
- `contentParserV2.ts`: Core utility functions for handling content syntax
- `ContentParser.tsx`: React component for rendering parsed content

**Key Functions:**
- `parseDocParagraphSyntax()`: Removes `doc(paragraph(...))` syntax from content
- `cleanContentForSaving()`: Ensures content is clean before saving to Directus
- `formatContentForDisplay()`: Prepares content for display in the UI

### 2. Middleware Layer

**Key Components:**
- `ContentFormatter.ts`: Middleware that intercepts API responses and requests

**Key Functions:**
- `processResponse()`: Formats all API responses to remove syntax
- `processRequest()`: Cleans all API requests before sending to Directus
- `processItem()`: Processes individual content items recursively

### 3. Service Layer

**Key Components:**
- `DirectusServiceWrapper.ts`: Wrapper around DirectusService that applies content formatting
- `DirectusServiceExtension.ts`: Extended service with improved error handling and collection type support

**Key Features:**
- Collection type detection (regular, singleton, menu)
- Fallback mechanisms for permission errors and 404 errors
- Automatic content formatting for all API interactions

### 4. UI Layer

**Key Components:**
- `UniversalContentEditor.tsx`: Flexible component for editing any content type
- `MenuEditor.tsx`: Specialized component for editing menu items
- `UniversalPageEditor.tsx`: Component for editing entire pages

**Key Features:**
- Works with any content type
- Supports all pages, menus, and submenus
- Integrates with permission system

## Implementation Details

### 1. Content Parser Implementation

```typescript
// contentParserV2.ts
export function parseDocParagraphSyntax(content: string): string {
  if (!content) return '';

  // Check if content matches doc(paragraph(...)) pattern
  const docParagraphRegex = /doc\(paragraph\("([^"]*)"\)\)/g;
  
  // If it matches, extract the content inside the quotes
  if (docParagraphRegex.test(content)) {
    return content.replace(docParagraphRegex, (_, text) => {
      // Unescape any escaped quotes
      const unescapedText = text.replace(/\\"/g, '"');
      return unescapedText;
    });
  }

  // Additional parsing logic...
  
  return content;
}
```

### 2. Content Formatter Middleware

```typescript
// ContentFormatter.ts
static processResponse<T>(response: T): T {
  if (!response) return response;
  
  // Handle array responses
  if (Array.isArray(response)) {
    return response.map(item => this.processItem(item)) as unknown as T;
  }
  
  // Handle single item responses
  return this.processItem(response);
}

static processItem<T>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  
  const processedItem = { ...item };
  
  // Process each field in the item
  Object.keys(processedItem).forEach(key => {
    const value = processedItem[key];
    
    // Process string values that might contain doc(paragraph(...)) syntax
    if (typeof value === 'string' && (value.includes('doc(') || value.includes('paragraph('))) {
      processedItem[key] = formatContentForDisplay(value);
    }
    
    // Recursively process nested objects
    if (typeof value === 'object' && value !== null) {
      processedItem[key] = this.processResponse(value);
    }
  });
  
  return processedItem;
}
```

### 3. Collection Type Handling

```typescript
// DirectusServiceExtension.ts
// Define collection existence mapping
const COLLECTION_EXISTS: Record<string, boolean> = {
  'settings': false,  // Settings is a singleton, not a collection with IDs
  'hero': false,      // Hero is a singleton
  'contact_info': false, // Contact info is a singleton
  'services': true,   // Services is a regular collection
  'pages': true,      // Pages is a regular collection
  // ...
};

static isSingleton(collection: string): boolean {
  return COLLECTION_EXISTS[collection] === false;
}

static async updateCollectionItemSafe(
  collection: string, 
  id: string | number, 
  data: Record<string, unknown>,
  fallbackCollection?: string
): Promise<Record<string, unknown>> {
  try {
    // Check if this is a singleton collection
    if (this.isSingleton(collection)) {
      // For singletons, use updateSettings instead of updateItem
      // ...
    }
    
    // For regular collections, use updateItem
    // ...
  } catch (error: unknown) {
    // Error handling and fallback mechanisms
    // ...
  }
}
```

### 4. Universal Content Editor

```typescript
// UniversalContentEditor.tsx
export const UniversalContentEditor: React.FC<UniversalContentEditorProps> = ({
  collection,
  itemId,
  field,
  value = '',
  className = '',
  placeholder = 'Click to edit...',
  tag: Tag = 'div',
  showEditIcon = true,
  onContentChange,
}) => {
  // State and permission checks
  // ...

  // Parse content on mount and when it changes
  useEffect(() => {
    // Always format content for display
    const parsed = formatContentForDisplay(value || '');
    setParsedContent(parsed);
    setContent(value || '');
  }, [value]);

  // Handle save
  const handleSave = async (newContent: string) => {
    // Update content in Directus
    await DirectusServiceExtension.updateField(collection, itemId, field, newContent);
    
    // Update local state with clean content
    setContent(newContent);
    setParsedContent(formatContentForDisplay(newContent));
    
    // ...
  };

  // Render content or editor
  // ...
}
```

## Testing and Verification

We created several tools to test and verify our solution:

1. **page-checker.js**: Comprehensive tool that checks all pages for `doc(paragraph(...))` syntax
2. **quick-check.js**: Simplified tool for quick verification of key pages
3. **doc-syntax-finder.js**: Specialized tool that focuses specifically on finding any remaining syntax

These tools use Puppeteer to render pages and check for the syntax, generating detailed reports with screenshots highlighting any problematic elements.

## Results

The implementation successfully:

1. **Removed doc(paragraph(...)) Syntax**: All content is now displayed properly without the syntax
2. **Enabled Universal Editing**: The editor now works across all pages, menus, and submenus
3. **Improved Error Handling**: The system gracefully handles permission errors and 404 errors
4. **Enhanced User Experience**: Editors can now seamlessly edit content throughout the application

## Conclusion

The universal content editing system provides a robust solution to the `doc(paragraph(...))` syntax issue and limited editing capabilities. By implementing multiple layers of content handling, we've created a flexible, maintainable system that works across all pages and content types.

The solution is designed to be extensible, allowing for future enhancements such as additional content types, more advanced editing features, and improved performance optimizations.
