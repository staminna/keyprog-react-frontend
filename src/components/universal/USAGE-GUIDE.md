# Universal Inline Editor Usage Guide

This guide explains how to use the enhanced universal inline editor to make any content in your React frontend editable.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Making Complex HTML Structures Editable](#making-complex-html-structures-editable)
3. [Using the Editable Directive](#using-the-editable-directive)
4. [Using the DOM Scanner](#using-the-dom-scanner)
5. [Using the Editable Toolbar](#using-the-editable-toolbar)
6. [Styling Editable Elements](#styling-editable-elements)
7. [Integration with Directus](#integration-with-directus)
8. [Troubleshooting](#troubleshooting)

## Basic Usage

The simplest way to make content editable is to use the `UniversalContentEditor` component:

```tsx
import { UniversalContentEditor } from '@/components/universal';

<UniversalContentEditor
  collection="services"
  itemId={service.id}
  field="title"
  value={service.title}
  tag="h1"
  className="text-4xl font-bold"
/>
```

## Making Complex HTML Structures Editable

To make complex HTML structures editable, wrap them with the `RecursiveEditableWrapper` component:

```tsx
import { RecursiveEditableWrapper } from '@/components/universal';

<RecursiveEditableWrapper
  collection="services"
  itemId={service.id}
>
  <div className="rounded-lg bg-card text-card-foreground shadow-sm">
    <div className="flex flex-col space-y-1.5 p-6">
      <h3 className="text-xl font-bold">Interessado neste serviço?</h3>
      <p className="text-muted-foreground">
        Entre em contacto connosco para mais informações sobre este serviço.
      </p>
    </div>
  </div>
</RecursiveEditableWrapper>
```

## Using the Editable Directive

For more control, use the `Editable` directive to mark specific elements as editable:

```tsx
import { Editable } from '@/components/universal';

<Editable
  field="cta_title"
  collection="services"
  itemId={service.id}
  tag="h3"
  className="text-xl font-bold"
>
  Interessado neste serviço?
</Editable>
```

## Using the DOM Scanner

For automatic scanning of all text nodes, add the `DOMEditableScanner` component to your app:

```tsx
import { DOMEditableScanner } from '@/components/universal';

<DOMEditableScanner />
```

This is already included in the `RouteContentScanner` component, so you don't need to add it manually.

## Using the Editable Toolbar

The `EditableToolbar` component provides a floating toolbar for controlling the inline editor:

```tsx
import { EditableToolbar } from '@/components/universal';

<EditableToolbar />
```

This is already added to the `App.tsx` file, so you don't need to add it manually.

## Styling Editable Elements

The enhanced universal inline editor includes CSS styles for editable elements. These styles are automatically imported in the `main.tsx` file.

If you want to customize the styles, you can edit the `editable.css` file in the `universal` directory.

## Integration with Directus

The enhanced universal inline editor integrates with the Directus MCP server for optimized content management. 

When you edit content using the inline editor, it is automatically saved to the Directus backend.

## Troubleshooting

If you encounter issues with the enhanced universal inline editor, check the following:

1. Make sure the Directus server is running and accessible
2. Check that the user is authenticated with Directus
3. Verify that the collection and field exist in Directus
4. Check the browser console for errors

### Common Issues

#### Content not saving

If content is not saving, check the following:

1. The user is authenticated with Directus
2. The collection and field exist in Directus
3. The user has permission to edit the collection and field

#### Content not editable

If content is not editable, check the following:

1. The `isInlineEditingEnabled` flag is set to `true`
2. The user is authenticated with Directus
3. The component is wrapped with the `RecursiveEditableWrapper` component or uses the `Editable` directive

#### Toolbar not visible

If the toolbar is not visible, check the following:

1. The `EditableToolbar` component is added to the app
2. The user is authenticated with Directus

## Conclusion

The enhanced universal inline editor provides a powerful way to make all content in your React frontend editable, including complex nested HTML structures. It integrates with Directus for content management and provides a user-friendly interface for editing content.