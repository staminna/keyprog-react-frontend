# Auto Field Creation for Universal Inline Editor

The Universal Inline Editor now supports automatic field creation when editing content. This means that if you try to edit a field that doesn't exist in the Directus schema, the editor will automatically create it for you.

## How It Works

1. When you edit content using the Universal Inline Editor, it tries to save the content to Directus.
2. If the field doesn't exist in Directus, the editor will detect the 404 error.
3. The editor will then create the field in Directus with the appropriate type and default value.
4. After creating the field, it will retry saving the content.

## Benefits

- **No Schema Changes Required**: You can add new editable fields to your components without having to manually create them in Directus.
- **Faster Development**: You can focus on building the UI without worrying about the backend schema.
- **Better User Experience**: Content editors can edit any field without running into errors.

## Example

```tsx
<UniversalContentEditor
  collection="hero"
  itemId="1"
  field="badge_text"  // This field doesn't exist yet in Directus
  value="Especialistas em eletrónica automóvel"
  tag="p"
/>
```

When the user edits this field for the first time, the editor will:
1. Try to save the content to Directus
2. Detect that the `badge_text` field doesn't exist
3. Create the field in the `hero` collection
4. Save the content to the newly created field

## Field Creation Details

When creating a field, the editor:
- Sets the field type to `string` (varchar)
- Sets a default value based on the current content
- Sets the field as nullable
- Adds a note indicating that the field was created automatically

## Limitations

- Only supports creating string fields for now
- Requires appropriate permissions in Directus
- May not work with complex field types or relationships

## Troubleshooting

If you encounter issues with auto field creation:

1. Check that the user has permission to create fields in Directus
2. Verify that the collection exists in Directus
3. Check the browser console for error messages
4. Try creating the field manually in Directus

## Conclusion

Auto field creation makes the Universal Inline Editor even more powerful and user-friendly. It allows content editors to edit any field without worrying about the backend schema, and it allows developers to focus on building the UI without having to manually create fields in Directus.