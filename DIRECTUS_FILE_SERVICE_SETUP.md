# Directus Configuration for File Service

## Required Configuration Steps

### 1. Add File_service Field to directus_users Collection

Navigate to: **Settings → Data Model → directus_users**

1. Click **"Create Field"**
2. Choose **"Many to Many"** or **"Files"** field type
3. Configure as follows:
   - **Field Name**: `File_service`
   - **Display Name**: File Service
   - **Related Collection**: directus_files
   - **Options**: 
     - ✅ Allow multiple files
     - ✅ Interface: Files

4. Save the field

### 2. Configure Cliente Role Permissions

Navigate to: **Settings → Roles & Permissions → Cliente**

#### On `directus_users` collection:
- **READ**: ✅ Custom (Own items only)
  - Rule: `{ "id": { "_eq": "$CURRENT_USER" } }`
- **UPDATE**: ✅ Custom (Own items only)
  - Rule: `{ "id": { "_eq": "$CURRENT_USER" } }`
  - Fields: Select **File_service** (and other fields users can update)

#### On `directus_files` collection:
- **CREATE**: ✅ All Access
- **READ**: ✅ Custom (Own files only)
  - Rule: `{ "uploaded_by": { "_eq": "$CURRENT_USER" } }`

### 3. Verify Cliente Role ID

Check that the Cliente role ID in your `.env` matches the actual role ID in Directus:

1. In Directus, go to **Settings → Roles & Permissions**
2. Click on **Cliente** role
3. Check the URL - the ID will be in the URL: `/admin/settings/roles/[ROLE_ID]`
4. Verify it matches: `VITE_DIRECTUS_CLIENTE_ROLE_ID=6c969db6-03d6-4240-b944-d0ba2bc56fc4`

### 4. Optional: Configure File Storage

If you want to customize where files are stored:

Navigate to: **Settings → Project Settings → Files & Thumbnails**

Configure:
- Storage adapter (Local, S3, etc.)
- Upload folder structure
- Allowed file types
- Maximum file size

## Testing the Configuration

### Test 1: User Can Upload Files
1. Create a test user with "Cliente" role
2. Login as that user
3. Navigate to File Service page
4. Upload a test file
5. Verify upload succeeds

### Test 2: Files Are Associated with User
1. In Directus admin panel, go to **User Directory**
2. Find the test user
3. Open their profile
4. Check **File_service** field shows the uploaded file(s)

### Test 3: Permissions Work Correctly
1. Try to access File Service as unauthenticated user → should see login prompt
2. Try to access as authenticated user without Cliente role → should see access denied
3. Try to access as Cliente user → should see upload interface

## Troubleshooting

### Issue: "No authentication token available"
**Solution**: User needs to login. Check that:
- Login functionality works
- Session token is being stored
- Token is being passed in API requests

### Issue: "Failed to update user File_service field"
**Solution**: Check permissions:
- Cliente role has UPDATE permission on directus_users
- Rule allows updating own user: `{ "id": { "_eq": "$CURRENT_USER" } }`
- File_service field is included in allowed update fields

### Issue: "Failed to upload file"
**Solution**: Check:
- Cliente role has CREATE permission on directus_files
- File size within limits
- Allowed file types configured correctly
- Storage is configured and accessible

### Issue: User sees "Access Denied" even though they have Cliente role
**Solution**: Verify:
- User's role ID matches `VITE_DIRECTUS_CLIENTE_ROLE_ID` in .env
- React app was restarted after changing .env
- User is properly authenticated (has valid session token)

## Security Notes

- ✅ Users can only update their own File_service field
- ✅ Users can only read their own uploaded files
- ✅ File uploads require authentication
- ✅ Role-based access control prevents unauthorized uploads
- ✅ Files are associated with the uploading user

## Database Schema (Reference)

```sql
-- The File_service field creates a junction table like:
-- directus_users_File_service
--   - id (primary key)
--   - directus_users_id (foreign key → directus_users.id)
--   - directus_files_id (foreign key → directus_files.id)

-- This allows many-to-many relationship:
-- - One user can have multiple files
-- - One file can belong to one user (in this implementation)
```
