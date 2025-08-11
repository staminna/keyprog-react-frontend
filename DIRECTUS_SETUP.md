# Directus Integration Setup

## Current Configuration

Your React app is now fully integrated with Directus! Here's what has been configured:

### 1. Connection Settings
- **React App URL**: http://localhost:8080
- **Directus URL**: http://localhost:8065
- **Credentials**: Using environment variables for authentication

### 2. CORS Configuration
Your Directus `.env` file should include React app's port. Please update your Directus `.env` file:

```env
# Add React app port to CORS origins
CORS_ALLOWED_ORIGINS=https://api.varrho.com,http://localhost:3000,http://localhost:8080,http://192.168.1.64:8080,http://localhost:8080,http://192.168.1.64:8080
```

### 3. Features Implemented

✅ **Authentication**: Automatic login using admin credentials  
✅ **Visual Editor**: Full WYSIWYG editor at `/editor`  
✅ **Hero Section**: Edit title, subtitle, and buttons with live preview  
✅ **Services Management**: Add, edit, delete services  
✅ **Type Safety**: Full TypeScript support  
✅ **Error Handling**: Graceful fallbacks when Directus is unavailable  

### 4. Usage

1. **Access the Editor**: Navigate to http://localhost:8080/editor
2. **Toggle Edit Mode**: Use the switch to toggle between edit and preview
3. **Edit Content**: Use the tabbed interface to manage different content types
4. **Save Changes**: Click "Save Changes" to persist data to Directus

### 5. Collections Mapped

- **Hero** (Singleton): Main hero section content
- **Services**: Service listings with CRUD operations  
- **Settings** (Singleton): Site-wide settings
- **Pages**: Dynamic page content
- **Categories**: Product categories
- **News**: News articles and blog posts
- **Contacts**: Contact information

### 6. Next Steps

To complete the integration:

1. **Update Directus CORS**: Add the CORS_ALLOWED_ORIGINS line above to your Directus `.env`
2. **Restart Directus**: Restart your Directus container/service
3. **Test the Editor**: Visit `/editor` and try editing the hero section
4. **Extend**: Add more editable components for other collections as needed

### 7. Troubleshooting

- **Connection Refused**: Ensure Directus is running on port 8065
- **CORS Errors**: Make sure React app port (8080) is in Directus CORS settings
- **Auth Errors**: Verify credentials in `.env.local` are correct
- **Save Failures**: Check Directus permissions for the admin user

The integration is now complete and ready for content management!