# Remirror Editor Implementation

This directory contains the implementation of rich text editing using Remirror, a ProseMirror toolkit for React.

## Components

- `RemirrorEditor`: Base editor component with full functionality
- `InlineRichTextEditor`: Rich text editor with formatting options (replaces both simple and rich text editing)
- `InlineImage`: Image upload and editing component
- `InlineSelect`: Dropdown selection component
- `RemirrorEditorProvider`: Context provider for managing editor state
- `RemirrorEditorToolbar`: UI toolbar for controlling edit mode

## Usage

To use these components, you need to install the Remirror dependencies:

```bash
npm install remirror @remirror/pm @remirror/react @remirror/react-editors
```

### Basic Usage

```tsx
import { RemirrorEditor } from '@/components/remirror';

function MyComponent() {
  const handleChange = (html: string) => {
    console.log('Content changed:', html);
  };

  return (
    <RemirrorEditor
      initialContent="<p>Hello world!</p>"
      onChange={handleChange}
    />
  );
}
```

### Inline Editing

```tsx
import { InlineRichTextEditor, RemirrorEditorProvider } from '@/components/remirror';

function MyComponent() {
  return (
    <RemirrorEditorProvider>
      <InlineRichTextEditor
        value="Edit me"
        collection="my_collection"
        itemId="123"
        field="title"
        canEdit={true}
      />
    </RemirrorEditorProvider>
  );
}
```

## Note

This implementation replaces the previous inline editor with a more powerful and flexible solution based on Remirror. The `InlineTextEditor` component has been removed in favor of using `InlineRichTextEditor` for all text editing needs, providing a more consistent editing experience.
