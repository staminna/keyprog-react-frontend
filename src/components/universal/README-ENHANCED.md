# Enhanced Universal Inline Editor

This enhanced version of the universal inline editor allows editing of all text content in the React frontend, including complex nested HTML structures.

## New Components

### EditableTextNode

Makes any text node editable, even within complex HTML structures:

```tsx
<EditableTextNode
  collection="services"
  field="description"
>
  This text will be editable
</EditableTextNode>
```

### RecursiveEditableWrapper

Recursively traverses the component tree and makes all text nodes editable:

```tsx
<RecursiveEditableWrapper
  collection="services"
  itemId="1"
>
  <div>
    <h1>This title will be editable</h1>
    <p>This paragraph will be editable</p>
    <div>
      <span>This span will be editable</span>
    </div>
  </div>
</RecursiveEditableWrapper>
```

### Editable Directive

Provides a directive-based approach for marking any HTML element as editable:

```tsx
<Editable
  field="title"
  collection="services"
  itemId="1"
>
  This content will be editable
</Editable>
```

### EditableSection

Wraps a section of content and makes all text nodes editable:

```tsx
<EditableSection
  sectionId="hero"
  collection="services"
  itemId="1"
>
  <div>
    <h1>This title will be editable</h1>
    <p>This paragraph will be editable</p>
  </div>
</EditableSection>
```

### DOMEditableScanner

Scans the DOM for text nodes and makes them editable:

```tsx
<DOMEditableScanner />
```

### EditableToolbar

Provides a floating toolbar for controlling the inline editor:

```tsx
<EditableToolbar />
```

## Usage

### Making Complex HTML Structures Editable

To make complex HTML structures editable, wrap them with the `RecursiveEditableWrapper` component:

```tsx
<RecursiveEditableWrapper
  collection="services"
  itemId={service.id}
>
  <div className="rounded-lg bg-card text-card-foreground shadow-sm border-2 border-primary/20">
    <div className="flex flex-col space-y-1.5 p-6 text-center">
      <h3 className="text-xl font-bold">Interessado neste serviço?</h3>
      <p className="text-muted-foreground">
        Entre em contacto connosco para mais informações sobre este serviço.
      </p>
    </div>
  </div>
</RecursiveEditableWrapper>
```

### Using the Editable Directive

For more control, use the `Editable` directive to mark specific elements as editable:

```tsx
<div className="rounded-lg bg-card text-card-foreground shadow-sm">
  <div className="flex flex-col space-y-1.5 p-6">
    <Editable
      field="cta_title"
      collection="services"
      itemId={service.id}
      tag="h3"
      className="text-xl font-bold"
    >
      Interessado neste serviço?
    </Editable>
    <Editable
      field="contact_info_text"
      collection="services"
      itemId={service.id}
      tag="p"
      className="text-muted-foreground"
    >
      Entre em contacto connosco para mais informações sobre este serviço.
    </Editable>
  </div>
</div>
```

### Using the DOM Scanner

For automatic scanning of all text nodes, add the `DOMEditableScanner` component to your app:

```tsx
<RouteContentScanner>
  <DOMEditableScanner />
</RouteContentScanner>
```

### Using the Editable Toolbar

Add the `EditableToolbar` component to your app to provide a floating toolbar for controlling the inline editor:

```tsx
<EditableToolbar />
```

## Styling

The enhanced universal inline editor includes CSS styles for editable elements. Import the styles in your app:

```tsx
import '@/components/universal/editable.css';
```

## Integration with Directus MCP Server

The enhanced universal inline editor integrates with the Directus MCP server for optimized content management. See the `mcpDirectusService.ts` file for more details.

## Deployment

To deploy the enhanced universal inline editor, use the existing deployment script:

```bash
cd /Users/jorgenunes/2026/keyprog-local/react-frontend
chmod +x deploy.sh
./deploy.sh
```

This will build and deploy the React frontend with the enhanced universal inline editor.

## Troubleshooting

If you encounter issues with the enhanced universal inline editor, check the following:

1. Make sure the Directus server is running and accessible
2. Check that the user is authenticated with Directus
3. Verify that the collection and field exist in Directus
4. Check the browser console for errors

## Conclusion

The enhanced universal inline editor provides a powerful way to make all content in your React frontend editable, including complex nested HTML structures. It integrates with Directus for content management and provides a user-friendly interface for editing content.