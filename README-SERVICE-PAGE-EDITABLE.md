# Service Page Editable Content

This document explains the editable content in the Service Page Template.

## Changes Made

1. **Edit Button Control**
   - The edit button can now be hidden by adding `?hideEditButton=true` to the URL
   - This allows for cleaner screenshots and presentations

2. **Improved Button Spacing**
   - Fixed spacing between buttons in the price card using `flex flex-col gap-3`
   - Provides consistent spacing between buttons

3. **Made Service Details Editable**
   - All service details sections are now editable:
     - Guarantee of Quality section
     - Fast Service section
     - Experience section
     - Help section
     - Contact information
     - Related services

## How to Use

### Hiding the Edit Button

Add `?hideEditButton=true` to the URL to hide the edit button:

```
http://localhost:3000/servicos/reprogramacao?hideEditButton=true
```

### Editing Content

1. Click the "Edit Content" button in the bottom right corner
2. Hover over any editable content to see the edit indicator
3. Click on the content you want to edit
4. Make your changes and click the save button

### Editable Fields

The following fields are now editable in the service page:

| Section | Field | Description |
|---------|-------|-------------|
| Header | title | Service title |
| Header | description | Service description |
| Details | quality_guarantee_title | Quality guarantee title |
| Details | quality_guarantee_text | Quality guarantee text |
| Details | fast_service_title | Fast service title |
| Details | fast_service_text | Fast service text |
| Details | experience_title | Experience title |
| Details | experience_text | Experience text |
| Help | help_section_title | Help section title |
| Help | help_section_text | Help section text |
| Contact | contact_email | Contact email |
| Contact | contact_phone | Contact phone |
| Related | other_services_title | Other services title |
| Related | related_service_1 | First related service |
| Related | related_service_2 | Second related service |
| Related | related_service_3 | Third related service |

## Technical Implementation

All editable content uses the `SimpleEditableText` component which wraps the `UniversalContentEditor`. This component:

1. Checks if the user has permission to edit the content
2. Shows edit indicators on hover
3. Handles saving content to Directus
4. Automatically creates fields if they don't exist

The edit button visibility is controlled by the `EditableContentWrapper` component which:

1. Checks URL parameters for `hideEditButton=true`
2. Conditionally renders the edit button based on this parameter
3. Still allows keyboard shortcuts (Ctrl/Cmd+E) to toggle editing mode even when the button is hidden