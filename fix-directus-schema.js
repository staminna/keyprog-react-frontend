/**
 * Directus Schema Fix Script
 * Run this script to fix the schema issues with header_menu sub-menus and contacts collection
 * 
 * Usage: node fix-directus-schema.js
 */

const { createDirectus, rest, updateField, createField, authentication } = require('@directus/sdk');

// Configuration
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const DIRECTUS_EMAIL = process.env.VITE_DIRECTUS_EMAIL;
const DIRECTUS_PASSWORD = process.env.VITE_DIRECTUS_PASSWORD;

const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

async function fixDirectusSchema() {
  try {
    console.log('🔧 Starting Directus schema fixes...');
    
    // Authenticate
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('✅ Authenticated with Directus');

    // Fix 1: Update header_menu sub_menu field
    console.log('🔄 Fixing header_menu sub_menu field...');
    await client.request(updateField('header_menu', 'sub_menu', {
      meta: {
        interface: 'list',
        options: {
          template: '{{title}} - {{link}}',
          addLabel: 'Add Menu Item',
          fields: [
            {
              field: 'title',
              name: 'Title',
              type: 'string',
              meta: {
                interface: 'input',
                width: 'half',
                required: true
              }
            },
            {
              field: 'link',
              name: 'Link', 
              type: 'string',
              meta: {
                interface: 'input',
                width: 'half',
                required: true
              }
            }
          ]
        }
      }
    }));
    console.log('✅ Fixed header_menu sub_menu field');

    // Fix 2: Simplify contacts email field validation
    console.log('🔄 Fixing contacts email field validation...');
    await client.request(updateField('contacts', 'email', {
      meta: {
        validation: {
          _regex: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$'
        },
        validation_message: 'Please enter a valid email address'
      }
    }));
    console.log('✅ Fixed contacts email field');

    // Fix 3: Add logo field to settings (if it doesn't exist)
    console.log('🔄 Adding logo field to settings...');
    try {
      await client.request(createField('settings', {
        field: 'logo',
        type: 'uuid',
        schema: {
          is_nullable: true,
          foreign_key_table: 'directus_files',
          foreign_key_column: 'id'
        },
        meta: {
          interface: 'file-image',
          special: ['file'],
          width: 'full',
          translations: [
            {
              language: 'pt-PT',
              translation: 'Logótipo'
            },
            {
              language: 'en-GB', 
              translation: 'Logo'
            }
          ]
        }
      }));
      console.log('✅ Added logo field to settings');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Logo field already exists in settings');
      } else {
        throw error;
      }
    }

    console.log('🎉 All schema fixes completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Refresh your Directus admin interface');
    console.log('2. Try adding sub-menu items to header_menu collection');
    console.log('3. Test saving contacts without the call stack error');
    console.log('4. Upload a logo in the settings collection');

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  }
}

// Run the fixes
fixDirectusSchema();
