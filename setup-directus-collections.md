# Directus Collections Setup

The React app is trying to access collections that may not exist yet in your Directus instance. Here's how to set them up:

## 1. Create Hero Collection (Singleton)

In your Directus admin panel:

1. Go to **Settings > Data Model**
2. Click **Create Collection**
3. Collection Name: `hero`
4. Check **Treat as Singleton** ✓
5. Add these fields:

| Field Name | Type | Interface | Required |
|------------|------|-----------|----------|
| title | String | Input | No |
| subtitle | Text | Textarea | No |
| primary_button_text | String | Input | No |
| primary_button_link | String | Input | No |

## 2. Create/Verify Services Collection

1. Collection Name: `services`
2. Fields:

| Field Name | Type | Interface | Required |
|------------|------|-----------|----------|
| title | String | Input | Yes |
| description | Text | Textarea | No |
| slug | String | Input Slug | Yes |

## 3. Set Permissions

### For Public Role (if you want public read access):
1. Go to **Settings > Roles & Permissions**
2. Click on **Public**
3. For `hero` and `services` collections:
   - **Read**: ✓ All Access
   - **Create/Update/Delete**: ✗ No Access

### For Administrator Role:
1. Click on **Administrator**
2. For all collections:
   - **All permissions**: ✓ Full Access

## 4. Alternative: Use Schema Import

If you have the schema file, you can import it directly:

1. Go to **Settings > Data Model**
2. Click the **...** menu
3. Select **Import Schema**
4. Upload your `keyprog_schema_import.json` file

## 5. Test Collections

After setting up, test in Directus admin:
1. Go to **Content > Hero** (should show singleton editor)
2. Add some test content
3. Go to **Content > Services** 
4. Add a few test services

## 6. Verify API Access

Test the API endpoints directly:
- Hero: `GET http://localhost:8065/items/hero`
- Services: `GET http://localhost:8065/items/services`

If you get 403 errors, check the permissions settings above.