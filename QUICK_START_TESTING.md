# Quick Start Guide - Testing File Service

## Prerequisites
- ✅ React frontend is running
- ✅ Directus backend is running at `http://localhost:8065`
- ⏳ Directus configuration (follow steps below)

## Step 1: Configure Directus (5 minutes)

### 1.1 Access Directus Admin Panel
Open: `http://localhost:8065/admin`

Login with admin credentials:
- Email: `stamina.nunes@gmail.com`
- Password: `Nov3abrilx95_`

### 1.2 Add File_service Field to Users

1. Go to **Settings** (gear icon in sidebar)
2. Click **Data Model**
3. Find and click **directus_users**
4. Click **"+ Create Field"** button
5. Choose **"Many to Many"** relationship type
6. Configure:
   - **Field Name**: `File_service`
   - **Related Collection**: `directus_files`
   - Click **Continue**
7. In the interface options:
   - Enable **"Allow Multiple"**
   - Click **Finish Setup**
8. Click **Save** (checkmark icon top right)

### 1.3 Configure Cliente Role Permissions

#### A. Files Collection Permissions
1. Go to **Settings** → **Roles & Permissions**
2. Click on **"Cliente"** role (or create it if it doesn't exist)
3. Find **directus_files** collection
4. Set permissions:
   - **Create**: Click to enable → Choose **"All Access"**
   - **Read**: Click to enable → Choose **"Custom Access"**
     - Add rule: `{ "uploaded_by": { "_eq": "$CURRENT_USER" } }`

#### B. Users Collection Permissions
1. Still in **Cliente** role settings
2. Find **directus_users** collection
3. Set permissions:
   - **Read**: Click to enable → Choose **"Custom Access"**
     - Add rule: `{ "id": { "_eq": "$CURRENT_USER" } }`
   - **Update**: Click to enable → Choose **"Custom Access"**
     - Add rule: `{ "id": { "_eq": "$CURRENT_USER" } }`
     - In **Field Permissions**, ensure **File_service** is checked

4. Click **Save** (checkmark icon top right)

### 1.4 Verify Cliente Role ID

1. In **Settings** → **Roles & Permissions**
2. Click on **Cliente** role
3. Look at the URL: `http://localhost:8065/admin/settings/roles/[ROLE_ID]`
4. Copy the ROLE_ID from the URL
5. Verify it matches your `.env` file:
   ```env
   VITE_DIRECTUS_CLIENTE_ROLE_ID=6c969db6-03d6-4240-b944-d0ba2bc56fc4
   ```
6. If different, update `.env` and restart React app

### 1.5 Create Test Cliente User (if needed)

1. Go to **User Directory** in Directus
2. Click **"+ Create Item"**
3. Fill in:
   - **Email**: `cliente@test.com`
   - **Password**: `TestCliente123!`
   - **First Name**: Cliente
   - **Last Name**: Test
   - **Role**: Cliente
   - **Status**: Active
4. Click **Save**

## Step 2: Test the Implementation

### Test 1: Unauthenticated Access
1. Open browser (incognito/private mode recommended)
2. Go to `http://localhost:3000/file-service`
3. **Expected**: See login prompt with "Fazer Login" and "Registar" buttons
4. **Verify**: Navigation header shows "Login" and "Registar" buttons

### Test 2: Cliente User Login and Upload
1. Click "Fazer Login" button
2. Login with:
   - Email: `cliente@test.com`
   - Password: `TestCliente123!`
3. **Expected**: Redirected back to `/file-service`
4. **Expected**: See welcome message: "Bem-vindo, cliente@test.com!"
5. **Expected**: See file upload interface
6. **Expected**: Header now shows user icon dropdown instead of login buttons

### Test 3: File Upload
1. Click **"Escolher Ficheiros"** button
2. Select one or more test files (any type, preferably .bin, .hex, etc.)
3. **Expected**: Selected files appear in list with names and sizes
4. Click **"Enviar Ficheiros"** button
5. **Expected**: 
   - Button shows "A enviar..." with spinner
   - After upload: Green success message appears
   - Selected files list is cleared
6. **Verify in Directus**:
   - Go to User Directory → Cliente Test user
   - Open user profile
   - Check File_service field shows the uploaded file(s)

### Test 4: Non-Cliente User Access
1. Logout (click user icon → Sair)
2. Login with an editor or admin user
3. Navigate to `/file-service`
4. **Expected**: See "Acesso Negado" message
5. **Expected**: Prompted to contact support

### Test 5: Mobile Responsive
1. Open browser dev tools (F12)
2. Toggle device toolbar (mobile view)
3. Click hamburger menu
4. **Expected**: Login/Registar buttons appear at bottom of mobile menu
5. Login as Cliente user
6. **Expected**: User email and logout button appear in mobile menu

## Step 3: Verify Files in Directus

1. Go to Directus Admin → **File Library**
2. **Expected**: See uploaded files
3. Click on a file
4. **Verify**:
   - **Uploaded By** shows the Cliente user
   - File details are correct
5. Go to **User Directory** → Cliente user
6. **Verify**: File_service field contains the uploaded files

## Common Issues & Solutions

### Issue: "No authentication token available"
**Solution**: 
- Clear browser cache and cookies
- Try logging out and back in
- Check browser console for errors

### Issue: "Failed to update user File_service field"
**Solution**: 
- Verify Cliente role has UPDATE permission on directus_users
- Check that File_service field is included in allowed update fields
- Verify custom access rule: `{ "id": { "_eq": "$CURRENT_USER" } }`

### Issue: "Failed to upload file"
**Solution**:
- Verify Cliente role has CREATE permission on directus_files
- Check Directus logs: `docker logs keyprog-directus` (if using Docker)
- Verify file size is within Directus limits

### Issue: Role ID mismatch
**Solution**:
- Get actual Cliente role ID from Directus URL
- Update `.env`: `VITE_DIRECTUS_CLIENTE_ROLE_ID=[actual-id]`
- Restart React dev server: `npm run dev`

### Issue: Can't see Login buttons in header
**Solution**:
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check React console for errors
- Verify SiteHeader.tsx changes were saved

## Success Checklist

After completing all tests, you should have:

- ✅ Cliente user can login
- ✅ File upload interface appears for Cliente users
- ✅ Files upload successfully
- ✅ Files appear in user's File_service field in Directus
- ✅ Non-Cliente users see access denied
- ✅ Login/Logout buttons work in header
- ✅ Mobile menu shows authentication controls
- ✅ Success messages appear after upload
- ✅ Form clears after successful upload

## Next Steps

Once everything works:

1. **Create real Cliente users** for your customers
2. **Configure email notifications** (optional - requires Directus Flow)
3. **Add file processing logic** (optional - server-side)
4. **Customize upload messages** in FileService.tsx
5. **Add file type validation** if needed
6. **Set maximum file size limits** in Directus settings

## Support

If you encounter issues not covered in this guide, check:
- Browser console for frontend errors
- Directus logs for backend errors
- Network tab in dev tools for API errors
- `DIRECTUS_FILE_SERVICE_SETUP.md` for detailed Directus configuration
- `FILE_SERVICE_IMPLEMENTATION.md` for technical details

---

**Ready to test!** Follow the steps above and the feature should work perfectly. 🚀
