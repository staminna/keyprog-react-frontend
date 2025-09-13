# Universal Editor Implementation Guide

This guide provides step-by-step instructions for implementing the Universal Content Editor system in your application.

## Prerequisites

Before implementing the Universal Editor, ensure you have:

1. A working React application
2. Directus CMS integration
3. React Router for navigation
4. Authentication system for user roles

## Step 1: Install Dependencies

Ensure you have all required dependencies:

```bash
npm install @remirror/react @remirror/extension-bold @remirror/extension-italic @remirror/extension-heading @remirror/extension-link @remirror/extension-list @remirror/extension-image @remirror/extension-text-color @remirror/extension-text-highlight @remirror/extension-history lucide-react
```

## Step 2: Set Up Directory Structure

Create the following directory structure:

```
src/
  components/
    universal/
      UniversalContentEditor.tsx
      UniversalPageEditor.tsx
      MenuEditor.tsx
      EditorActivator.tsx
      PageRouter.tsx
    remirror/
      InlineRichTextEditor.tsx
      ContentParser.tsx
      styles.css
  services/
    directusService.ts
    directusServiceExtension.ts
    schemaValidator.ts
  utils/
    contentParser.ts
  hooks/
    useDirectusEditorContext.ts
    useRolePermissions.ts
    useInlineEdit.ts
  docs/
    UNIVERSAL_EDITOR.md
    IMPLEMENTATION_GUIDE.md
```

## Step 3: Implement Core Components

### 1. ContentParser Utility

Create the content parser utility to handle `doc(paragraph(...))` syntax:

```typescript
// src/utils/contentParser.ts
export function parseDocParagraphSyntax(content: string): string {
  // Implementation details in the file
}

export function cleanContentForSaving(content: string): string {
  // Implementation details in the file
}

export function hasDocParagraphSyntax(content: string): boolean {
  // Implementation details in the file
}
```

### 2. DirectusServiceExtension

Extend the DirectusService to handle permissions and collection types:

```typescript
// src/services/directusServiceExtension.ts
export class DirectusServiceExtension {
  static collectionExists(collection: string): boolean {
    // Implementation details in the file
  }
  
  static isSingleton(collection: string): boolean {
    // Implementation details in the file
  }
  
  static async updateCollectionItemSafe(
    collection: string, 
    id: string | number, 
    data: Record<string, unknown>,
    fallbackCollection?: string
  ): Promise<Record<string, unknown>> {
    // Implementation details in the file
  }
  
  // Additional methods...
}
```

### 3. UniversalContentEditor Component

Create the UniversalContentEditor component:

```tsx
// src/components/universal/UniversalContentEditor.tsx
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
  // Implementation details in the file
}
```

## Step 4: Implement Editor Activation

### 1. EditorActivator Component

Create the EditorActivator component:

```tsx
// src/components/universal/EditorActivator.tsx
export const EditorActivator: React.FC = () => {
  // Implementation details in the file
}
```

### 2. PageRouter Component

Create the PageRouter component:

```tsx
// src/components/universal/PageRouter.tsx
export const PageRouter: React.FC = () => {
  // Implementation details in the file
}
```

## Step 5: Integrate with Main Application

Add the EditorActivator to your main layout:

```tsx
// src/App.tsx or your main layout component
import { EditorActivator } from '@/components/universal/EditorActivator';

// Inside your component's render method:
<>
  <Header />
  <main>
    {/* Your routes */}
    <EditorActivator />
  </main>
  <Footer />
</>
```

## Step 6: Configure Collection Mappings

Update the collection mappings in DirectusServiceExtension:

```typescript
// src/services/directusServiceExtension.ts
const COLLECTION_EXISTS: Record<string, boolean> = {
  'settings': false,  // Settings is a singleton
  'hero': false,      // Hero is a singleton
  'contact_info': false, // Contact info is a singleton
  'services': true,   // Regular collection
  'pages': true,      // Regular collection
  // Add your collections here
};

const MENU_COLLECTIONS = ['header_menu', 'footer_menu', 'sub_menu_content'];
```

## Step 7: Set Up Role Permissions

Configure role permissions in useRolePermissions hook:

```typescript
// src/hooks/useRolePermissions.ts
const DEFAULT_PERMISSIONS: RolePermissions = {
  admin: {
    collections: {
      '*': { read: true, create: true, update: true, delete: true }
    },
    fields: {
      '*': { read: true, create: true, update: true }
    }
  },
  editor: {
    collections: {
      'pages': { read: true, create: true, update: true, delete: false },
      'settings': { read: true, update: true },
      // Add your collections here
    },
    fields: {
      '*': { read: true, create: true, update: true }
    }
  },
  // Additional roles...
};
```

## Step 8: Add Schema Validation

Implement schema validation using the SchemaValidator:

```typescript
// src/services/schemaValidator.ts
export class SchemaValidator {
  static async validateField(collection: string, field: string, value: unknown): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    // Implementation details in the file
  }
  
  // Additional methods...
}
```

## Step 9: Use the Universal Content Editor

Replace static content with editable components:

```tsx
// Before
<h1>{pageTitle}</h1>
<div className="content">{pageContent}</div>

// After
<UniversalContentEditor
  collection="pages"
  itemId={pageId}
  field="title"
  value={pageTitle}
  className="text-3xl font-bold"
/>
<UniversalContentEditor
  collection="pages"
  itemId={pageId}
  field="content"
  value={pageContent}
  className="content"
/>
```

## Step 10: Test and Debug

Test the editor with different content types:

1. Regular pages
2. Menu items
3. Submenu content
4. Settings
5. Singleton collections

## Troubleshooting

### Editor Not Appearing

1. Check if the user is authenticated
2. Verify that the user has the correct role permissions
3. Check for console errors

### Content Not Updating

1. Verify API requests in the network tab
2. Check for permission errors in the console
3. Ensure the collection and field exist in Directus

### doc(paragraph(...)) Syntax Issues

1. Make sure ContentParser is being used
2. Verify that parseDocParagraphSyntax is working correctly

## Next Steps

1. Add custom validation rules
2. Implement more specialized editors for different content types
3. Add support for additional Directus features
4. Enhance the UI with animations and transitions

## Conclusion

By following this implementation guide, you should have a fully functional Universal Content Editor system that works across all pages, menus, and submenus in your application. The system handles special syntax, permissions, and different collection types, providing a seamless editing experience for users.
