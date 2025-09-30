# File Service Implementation

## Overview
This document describes the implementation of the File Service feature for authenticated "Cliente" users to upload files to Directus.

## Changes Made

### 1. FileService Page (`src/pages/FileService.tsx`)
**Complete rewrite** with the following features:

#### Authentication & Authorization
- Checks if user is authenticated using `useAuth()` hook
- Verifies user has the "Cliente" role using `VITE_DIRECTUS_CLIENTE_ROLE_ID` from environment
- Shows different UI states:
  - Loading state while checking authentication
  - Login/Register prompt for unauthenticated users
  - Access denied message for authenticated users without "Cliente" role
  - Full upload interface for authenticated "Cliente" users

#### File Upload Features
- Multiple file selection support
- File preview list showing name and size
- Upload progress indicator
- Success/error message display
- File types accepted: `.bin`, `.hex`, `.fls`, `.kess`, `.ori`, `.mod`
- Automatic cleanup of file input after successful upload

#### User Experience
- Welcome message with user email
- Clear instructions and information about the service
- Responsive card-based layout
- Integration with existing UI components (Button, Card, etc.)

### 2. Site Header (`src/components/layout/SiteHeader.tsx`)
Added authentication UI for "Cliente" users:

#### Desktop Navigation
- Login/Register buttons for unauthenticated users
- User dropdown menu for authenticated users showing:
  - User email
  - Logout button

#### Mobile Navigation
- Login/Register buttons in mobile sheet menu
- User info and logout button for authenticated users
- Separated from editor authentication (kept existing inline editing functionality)

#### Implementation Details
- Uses `useAuth()` hook for client authentication
- Uses `useDirectusEditorContext()` for editor authentication (existing)
- Proper separation of concerns between client and editor auth
- Added imports for `UserCircle` and `LogOut` icons from lucide-react
- Added dropdown menu component imports

### 3. DirectusService (`src/services/directusService.ts`)
Added two new methods:

#### `uploadFiles(files: File[]): Promise<string[]>`
- Uploads multiple files to Directus `/files` endpoint
- Uses session authentication token
- Returns array of uploaded file IDs
- Proper error handling with descriptive messages

#### `updateUserFileService(userId: string, fileIds: string[]): Promise<void>`
- Fetches current user data to get existing files
- Appends new file IDs to existing `File_service` field
- Updates user record in Directus
- Maintains file history (doesn't overwrite existing files)

## Directus Configuration Required

### 1. User Collection - File_service Field
The `directus_users` collection must have a `File_service` field configured as:
- **Type**: Many-to-Many (M2M) or Files
- **Interface**: File(s)
- **Options**: Allow multiple files
- **Permissions**: Cliente role must have UPDATE permission on their own user record

### 2. Files Collection Permissions
The "Cliente" role must have:
- **CREATE** permission on `directus_files` collection
- **READ** permission on their own uploaded files

### 3. Role Configuration
The "Cliente" role ID must be set in `.env`:
```env
VITE_DIRECTUS_CLIENTE_ROLE_ID=6c969db6-03d6-4240-b944-d0ba2bc56fc4
```

## User Flow

### For Unauthenticated Users
1. Navigate to `/file-service`
2. See prompt to login or register
3. Click "Fazer Login" → redirected to `/login?return=/file-service`
4. After login, automatically redirected back to file service

### For Authenticated Cliente Users
1. Navigate to `/file-service`
2. See welcome message with their email
3. Click "Escolher Ficheiros" to select files
4. Review selected files (name and size displayed)
5. Click "Enviar Ficheiros" to upload
6. See success message when complete
7. Files are associated with their user account in `File_service` field

### For Authenticated Non-Cliente Users
1. Navigate to `/file-service`
2. See access denied message
3. Prompted to contact support for access

## Navigation Updates

### Main Menu
The existing navigation already includes "File Service" link to `/file-service`

### User Authentication Links
- **Desktop**: Top-right corner shows Login/Register buttons or user dropdown
- **Mobile**: Bottom of mobile menu shows Login/Register or user info with logout

## Technical Notes

### File Upload Process
1. User selects files → stored in React state
2. User clicks upload → validates authentication and role
3. `DirectusService.uploadFiles()` called → uploads to Directus `/files`
4. Returns array of file IDs
5. `DirectusService.updateUserFileService()` called → updates user's `File_service` field
6. Success message displayed, form reset

### Security Considerations
- All uploads require valid session token
- Role validation happens both client-side (UX) and server-side (Directus permissions)
- File IDs are stored in user record, establishing ownership
- Only authenticated users with "Cliente" role can access upload functionality

### Error Handling
- Network errors are caught and displayed to user
- Invalid authentication shows appropriate message
- Failed uploads show error message with details
- Missing files validation before upload

## Testing Checklist

- [ ] Unauthenticated user sees login prompt
- [ ] Login redirects back to file service
- [ ] Authenticated Cliente can select files
- [ ] File preview shows correct name and size
- [ ] Upload succeeds and shows success message
- [ ] Files are added to user's File_service field in Directus
- [ ] Non-Cliente users see access denied
- [ ] Login/Register links appear in header
- [ ] User dropdown shows email and logout
- [ ] Logout clears session and redirects home
- [ ] Mobile menu shows auth controls

## Future Enhancements

Consider adding:
- File upload progress bar for large files
- Maximum file size validation
- File type validation with detailed error messages
- View uploaded files history
- Download previously uploaded files
- Delete uploaded files
- Admin interface to view all uploaded files
- Email notifications when files are processed
- File processing status tracking
