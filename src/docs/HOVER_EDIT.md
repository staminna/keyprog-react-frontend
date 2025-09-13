# Hover-Based Editing with Remirror

This document explains how to use the hover-based editing feature with Remirror in the Keyprog application.

## Overview

The hover-based editing approach provides a more intuitive and streamlined way to edit content directly on the page. Instead of switching between different modes (view, edit, preview), users can simply hover over editable content and click the edit icon to start editing.

## How It Works

1. **Hover Over Content**: When you hover over editable content, a subtle dashed outline appears to indicate that the content is editable.

2. **Click Edit Icon**: An edit icon (pencil) appears in the top-right corner of the editable content. Click this icon to start editing.

3. **Edit with Remirror**: The content becomes editable using the Remirror editor, which provides rich text editing capabilities.

4. **Save Changes**: After making your changes, click outside the editor or press the save button to save your changes.

## Benefits

- **Intuitive Interaction**: No need to switch between different modes
- **Contextual Editing**: Edit content directly where it appears on the page
- **Mobile-Friendly**: Works well on touch devices with tap-to-edit functionality
- **Visual Feedback**: Clear visual indicators show which content is editable

## Keyboard Shortcuts

While the hover-based approach is the primary way to edit content, keyboard shortcuts are still available:

- **Ctrl/Cmd + 1**: Switch to View mode
- **Ctrl/Cmd + 2**: Switch to Edit mode

## Implementation Details

The hover-based editing is implemented using:

- React state to track hover state
- CSS transitions for smooth visual feedback
- Event handlers for mouse enter/leave and click events
- Conditional rendering of the edit icon
- Integration with Remirror for rich text editing

## Example Usage

```tsx
<PageSection
  id="hero-title"
  collection="hero"
  field="title"
  value="Welcome to Keyprog"
  tag="h1"
  className="text-4xl font-bold"
/>
```

This creates an editable h1 heading that can be edited by hovering and clicking the edit icon.

## Mobile Support

On touch devices (where hover is not available), the edit icon is always visible but with reduced opacity to avoid cluttering the interface. Tapping the icon will activate the editor.

## Styling

The hover effect and edit icon are styled using the `hover-edit.css` file, which provides:

- Subtle dashed outline on hover
- Slight background color change for visual feedback
- Positioned edit icon with hover effects
- Responsive styling for different screen sizes
- Special handling for different HTML elements
