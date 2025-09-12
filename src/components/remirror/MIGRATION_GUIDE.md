# Migration Guide: Inline Editor to Remirror

This guide explains how to migrate from the old inline editor implementation to the new Remirror-based editor.

## Overview

We've replaced the previous inline editor with a more powerful and flexible solution based on [Remirror](https://remirror.io/), a ProseMirror toolkit for React. This change brings several benefits:

- Better rich text editing capabilities
- Improved accessibility
- More consistent editing experience
- Better support for collaborative editing
- Enhanced customization options

## Compatibility Layer

To ensure a smooth transition, we've created a compatibility layer that allows existing components to continue working with minimal changes. The old imports and component names will continue to work, but they now use the new Remirror implementation under the hood.

## Migration Steps

### Step 1: Update Dependencies

Make sure your project has the required Remirror dependencies:

```json
{
  "dependencies": {
    "remirror": "^3.0.6",
    "@remirror/pm": "^3.0.6",
    "@remirror/react": "^3.0.6",
    "@remirror/react-editors": "^3.0.6",
    "@remirror/extension-bold": "^3.0.6",
    "@remirror/extension-italic": "^3.0.6",
    "@remirror/extension-heading": "^3.0.6",
    "@remirror/extension-link": "^3.0.6",
    "@remirror/extension-list": "^3.0.6",
    "@remirror/extension-image": "^3.0.6",
    "@remirror/extension-text-color": "^3.0.6",
    "@remirror/extension-text-highlight": "^3.0.6",
    "@remirror/extension-history": "^3.0.6",
    "@remirror/extension-yjs": "^3.0.6"
  }
}
```

### Step 2: Update Imports (Optional)

While the compatibility layer allows you to continue using the old imports, we recommend gradually migrating to the new imports for better type checking and to access new features:

**Old imports:**
```tsx
import { InlineText, InlineRichText, InlineEditProvider } from '@/components/inline';
```

**New imports:**
```tsx
import { 
  InlineTextEditor, 
  InlineRichTextEditor, 
  RemirrorEditorProvider 
} from '@/components/remirror';
```

### Step 3: Update Component Usage

#### Basic Editor

**Old:**
```tsx
<InlineText
  field="title"
  value={content.title}
  collection="posts"
  itemId="123"
  canEdit={isAuthenticated}
>
  {content.title}
</InlineText>
```

**New:**
```tsx
<InlineTextEditor
  value={content.title}
  collection="posts"
  itemId="123"
  field="title"
  canEdit={isAuthenticated}
  onSave={(value) => console.log('Saved:', value)}
>
  {content.title}
</InlineTextEditor>
```

#### Rich Text Editor

**Old:**
```tsx
<InlineRichText
  field="content"
  value={content.content}
  collection="posts"
  itemId="123"
  canEdit={isAuthenticated}
  richText
>
  <div dangerouslySetInnerHTML={{ __html: content.content }} />
</InlineRichText>
```

**New:**
```tsx
<InlineRichTextEditor
  value={content.content}
  collection="posts"
  itemId="123"
  field="content"
  canEdit={isAuthenticated}
  onSave={(value) => console.log('Saved:', value)}
/>
```

### Step 4: Update Provider Usage

**Old:**
```tsx
<InlineEditProvider initialEditMode={false}>
  <InlineEditToolbar />
  {/* Your content here */}
</InlineEditProvider>
```

**New:**
```tsx
<RemirrorEditorProvider initialEditMode={false}>
  <RemirrorEditorToolbar />
  {/* Your content here */}
</RemirrorEditorProvider>
```

## Advanced Usage

### Custom Editor Configuration

The new Remirror implementation allows for more advanced customization:

```tsx
import { RemirrorEditor } from '@/components/remirror';
import { BoldExtension, ItalicExtension } from 'remirror/extensions';

function MyCustomEditor() {
  return (
    <RemirrorEditor
      initialContent="<p>Hello world!</p>"
      onChange={(html) => console.log(html)}
      extensions={[new BoldExtension(), new ItalicExtension()]}
    />
  );
}
```

### Accessing the Remirror Context

```tsx
import { useRemirrorEditorContext } from '@/components/remirror';

function MyComponent() {
  const { showEditMode, setShowEditMode } = useRemirrorEditorContext();
  
  return (
    <button onClick={() => setShowEditMode(!showEditMode)}>
      Toggle Edit Mode
    </button>
  );
}
```

## Example Component

We've created an example component that demonstrates the new Remirror editor capabilities:

```tsx
import { RemirrorEditorExample } from '@/components/remirror/RemirrorEditorExample';

function MyPage() {
  return (
    <div>
      <h1>Editor Example</h1>
      <RemirrorEditorExample />
    </div>
  );
}
```

## Known Issues and Limitations

- The `InlineImage` and `InlineSelect` components are currently stubs and will be implemented in a future update.
- Collaborative editing requires additional setup with YJS.
- Some advanced formatting options may require additional extensions.

## Getting Help

If you encounter any issues during migration, please refer to the [Remirror documentation](https://remirror.io/docs) or contact the development team.
