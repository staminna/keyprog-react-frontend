# Directus Schema Fixes

## 🚨 Critical Issues to Fix

### 1. Header Menu Sub-Menu Support

**Problem**: Cannot add sub-menu items in Directus admin interface  
**Solution**: Fix the `sub_menu` field configuration

#### Steps to Fix:
1. Go to **Settings > Data Model > header_menu** collection
2. Click on the **sub_menu** field to edit it
3. Change the interface configuration:
   - **Interface**: `List`
   - **Template**: `{{title}} - {{link}}`
   - **Add Label**: `Add Menu Item`

4. Configure the **Fields** section with these two fields:
   ```json
   [
     {
       "field": "title",
       "name": "Title", 
       "type": "string",
       "interface": "input",
       "width": "half",
       "required": true
     },
     {
       "field": "link",
       "name": "Link",
       "type": "string", 
       "interface": "input",
       "width": "half",
       "required": true
     }
   ]
   ```

5. Save the field configuration

### 2. Contacts Collection Call Stack Error

**Problem**: "Maximum call stack size exceeded" when saving contacts  
**Solution**: Simplify email field validation

#### Steps to Fix:
1. Go to **Settings > Data Model > contacts** collection
2. Click on the **email** field to edit it
3. In the **Validation** section, replace the current validation with:
   ```
   ^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$
   ```
4. Set **Validation Message**: `Please enter a valid email address`
5. Remove any other complex validation rules
6. Save the field configuration

### 3. Settings Logo Field (Missing)

**Problem**: Logo field doesn't exist in settings collection  
**Solution**: Add the logo field

#### Steps to Add:
1. Go to **Settings > Data Model > settings** collection
2. Click **Create Field** (+ button)
3. Configure the new field:
   - **Field Key**: `logo`
   - **Type**: `File`
   - **Interface**: `Image`
   - **Display Name**: `Logo` (EN) / `Logótipo` (PT)
   - **Width**: `Full`
   - **Required**: `No` (optional)
4. Save the field

## 🧪 Testing After Fixes

### Test Header Menu:
1. Go to **Content > Header Menu**
2. Edit an existing menu item (e.g., "Loja")
3. Try adding sub-menu items using the new interface
4. Add items like:
   - Title: `Emuladores`, Link: `/loja#emuladores`
   - Title: `Equipamentos`, Link: `/loja#equipamentos`

### Test Contacts:
1. Go to **Content > Contacts**
2. Try creating a new contact with an email
3. Verify it saves without the call stack error

### Test Settings Logo:
1. Go to **Content > Settings**
2. Upload a logo image using the new logo field
3. Save the settings

## 🔄 After Schema Fixes

Once you've applied these fixes:

1. **Refresh your Directus admin interface**
2. **Test each collection** to ensure they work properly
3. **Populate some test data**:
   - Add menu items with sub-menus
   - Add a contact entry
   - Upload a logo in settings
4. **Return to the React app** to test the dynamic functionality

## 📞 Let me know when ready!

After you've applied these schema fixes, let me know and we can:
1. Test the dynamic header menu with real Directus data
2. Continue with Phase 2 implementations
3. Fix any remaining issues that come up

The schema fixes are critical for the dynamic content system to work properly!
