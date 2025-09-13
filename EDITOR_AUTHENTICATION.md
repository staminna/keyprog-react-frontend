# Editor Authentication & Directus Visual Editor Integration

## 🔐 Overview

The `/editor` route now supports two authentication methods:

1. **Directus Visual Editor Mode** - Edit content directly through the Directus Visual Editor iframe
2. **Direct Authentication** - Authenticate directly with Directus credentials in the React application

## 🏗️ Implementation Components

### 1. **useDirectusEditorContext** (`src/hooks/useDirectusEditorContext.ts`)
- Detects if running in Directus Visual Editor iframe
- Checks for direct Directus authentication
- Provides authentication state for components
- Handles token retrieval from parent iframe

### 2. **AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides login/logout functionality
- Handles authentication persistence
- Integrates with DirectusService

### 3. **InlineRichText** (`src/components/inline/InlineRichText.tsx`)
- Rich text editing component
- Supports both simple and formatted text
- Works in both Directus Visual Editor and standalone mode
- Shows visual indicators for edit mode

### 4. **VisualEditor** (`src/pages/VisualEditor.tsx`)
- New editor page with dual authentication support
- Shows authentication status indicators
- Provides editing capabilities based on authentication
- Works seamlessly in both environments

## 🚀 How It Works

### Dual Authentication Flow:

#### Directus Visual Editor Mode:
1. **User opens page in Directus Visual Editor** (`http://localhost:8065/admin/visual/http://localhost:3000/editor`)
2. **useDirectusEditorContext detects iframe environment**
3. **Parent token is retrieved** from Directus iframe
4. **Editing is automatically enabled** with visual indicators

#### Direct Authentication Mode:
1. **User visits `/editor` directly**
2. **Authentication state is checked** with Directus
3. **If authenticated**: Editing is enabled
4. **If not authenticated**: View-only mode is shown
5. **Authentication status** is clearly displayed

## 🧪 Testing the Integration

### Test Cases:

1. **Directus Visual Editor Mode**: Visit `http://localhost:8065/admin/visual/http://localhost:3000/editor`
   - Should automatically enable editing
   - Should show "Directus Visual Editor" indicator
   - Should allow content modifications

2. **Direct Authentication**: Visit `http://localhost:3000/editor`
   - Should check authentication status
   - Should enable editing if authenticated
   - Should show "Authenticated" indicator when logged in

3. **View-Only Mode**: Visit without authentication
   - Should show content in view-only mode
   - Should show "View Only" indicator
   - Should not allow content modifications

## 🔧 Configuration

### Environment Variables:
```env
VITE_DIRECTUS_URL=http://localhost:8065
VITE_DIRECTUS_EMAIL=your-admin@email.com
VITE_DIRECTUS_PASSWORD=your-password
```

### Directus Requirements:
- Directus instance running on configured URL
- Valid user account with appropriate permissions
- Collections access for content editing

## 🛡️ Security Features

### Authentication Methods:
- **Directus Visual Editor**: Secure token passing from parent iframe
- **Direct Authentication**: Standard Directus authentication flow
- **Session Management**: Authentication state persists appropriately
- **Visual Indicators**: Clear display of current authentication status

### Security Considerations:
- Tokens are securely retrieved from parent iframe
- No sensitive information is exposed in the UI
- Authentication state is properly managed
- Clear visual feedback on editing permissions

## 🎯 Usage Instructions

### For Content Editors:

#### Option 1: Directus Visual Editor (Recommended)
1. Login to Directus Admin (`http://localhost:8065/admin`)
2. Navigate to Content > Pages
3. Click the Visual Editor icon next to a page
4. Edit content directly in the visual interface

#### Option 2: Direct Access
1. Navigate to `http://localhost:3000/editor`
2. If already authenticated with Directus, editing is enabled
3. Edit content directly in the page

### For Developers:
- Use `useDirectusEditorContext()` hook to access authentication state
- Implement `InlineRichText` and `InlineImage` components for editable content
- Authentication detection is handled automatically
- Visual indicators show current editing status

## 🔄 Integration with Directus MCP Server

### Enhanced Capabilities:
- **Unified API**: Consistent interface for all content operations
- **Type Safety**: Strong typing for API responses
- **Error Handling**: Centralized error management with retry capabilities
- **Authentication Flexibility**: Multiple authentication paths

### Future Enhancements:
- Offline editing capabilities
- Collaborative editing features
- Content versioning and history
- Advanced permission management
- Multi-CMS support

## ✅ Status

- ✅ **Directus Visual Editor Integration** - Implemented
- ✅ **Direct Authentication Support** - Implemented  
- ✅ **InlineRichText Component** - Implemented
- ✅ **InlineImage Component** - Implemented
- ✅ **Visual Editor Page** - Implemented
- ✅ **MCP Server Integration** - Implemented
- 🧪 **Ready for Testing** - All components functional

The `/editor` route now supports both Directus Visual Editor and direct authentication for a seamless editing experience!
