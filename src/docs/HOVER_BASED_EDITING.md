# Hover-Based Editing

Hover-Based Editing is a powerful feature that allows content editors to edit content directly on the page without switching between different modes. This document explains how to use this intuitive editing approach effectively.

## Overview

Hover-Based Editing provides a streamlined way to edit content directly where it appears on the page. This approach is particularly useful for:

- Making quick content updates without disrupting the workflow
- Seeing changes in context as you edit
- Providing a more intuitive editing experience
- Working efficiently on both desktop and mobile devices

## What is Hover-Based Editing?

Hover-Based Editing provides an intuitive interaction model. You can simply hover over editable content and click the edit icon to start editing directly with Remirror.

## How to Use Hover-Based Editing

### Workflow

1. **Hover** over any editable content to see a dashed outline
2. **Click** the edit icon (pencil) that appears
3. **Edit** the content directly using Remirror
4. **Save** by clicking outside or pressing the save button

This approach is more intuitive and works well on both desktop and mobile devices.

## Features

### Visual Feedback

The hover-based editing system provides clear visual feedback:

- **Dashed Outline**: Appears when hovering over editable content
- **Edit Icon**: A pencil icon appears in the top-right corner
- **Editor Highlighting**: The Remirror editor is visually distinct when active

### Remirror Integration

The editing experience is powered by Remirror, which provides:

- Rich text formatting options
- Inline styling controls
- Media embedding capabilities
- Consistent editing experience across content types

### Mobile Support

On touch devices (where hover isn't available):

- Edit icons are always visible but with reduced opacity
- Tapping the icon activates the editor
- Touch-friendly controls for editing content

## Technical Implementation

The hover-based editing system is implemented using:

- React state to track hover and edit states
- CSS transitions for smooth visual feedback
- Event handlers for mouse/touch interactions
- Integration with Remirror for rich text editing

## Benefits Over Previous Approach

- **Contextual Editing**: Edit content exactly where it appears on the page
- **Improved Workflow**: More natural editing experience with fewer clicks
- **Better Mobile Experience**: Works well on touch devices
- Overall layout and spacing

### Non-Destructive Testing

Hover-based editing is non-destructive, meaning:

- Changes are only visible to you until saved
- You can freely experiment with different content options
- You can discard changes by canceling the edit

### Cross-Page Consistency

Hover-based editing works across all pages of your site, allowing you to:

- Edit global elements (headers, footers, etc.)
- Ensure consistent styling across different page types
- Test navigation and user flows with new content

## Best Practices

1. **Edit Content In-Context**: Edit content directly where it appears to see changes immediately
2. **Check Responsive Behavior**: Resize your browser to ensure content looks good at all screen sizes
3. **Review All Editable Elements**: Check each element you've modified to ensure everything looks correct
4. **Get Feedback**: Share your screen with colleagues to get feedback before saving
5. **Use Keyboard Shortcuts**: Learn the keyboard shortcut (Ctrl/Cmd+E) to toggle editing quickly

## Troubleshooting

If hover-based editing isn't working as expected:

- Ensure you're logged in with appropriate permissions
- Try refreshing the page if hover effects aren't appearing
- Verify that the content you're trying to edit is editable
- Check if you're using a touch device (hover behavior is different)

## Technical Details

Hover-based editing stores content changes in local state, which means:

- Changes persist only during your current session
- Changes are not visible to other users
- Changes are lost if you refresh the page without saving
- API calls are made only when you save your changes
