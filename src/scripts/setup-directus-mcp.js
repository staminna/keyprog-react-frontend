// Script to set up Directus fields and permissions using MCP server
import { mcp2_create_field, mcp2_get_collection_schema, mcp2_get_users, mcp2_bulk_operations } from '../mcp-tools.js';

async function setupDirectus() {
  try {
    console.log('🔍 Setting up Directus with MCP server...');
    
    // 1. Create badge_text field in hero collection if it doesn't exist
    console.log('🔍 Checking if badge_text field exists in hero collection...');
    const heroSchema = await mcp2_get_collection_schema({ collection: 'hero' });
    
    if (heroSchema.error) {
      console.error('❌ Error getting hero collection schema:', heroSchema.error);
    } else {
      const hasField = heroSchema.fields && 
        Object.values(heroSchema.fields).some(field => field.field === 'badge_text');
      
      if (hasField) {
        console.log('✅ badge_text field already exists in hero collection');
      } else {
        console.log('❌ badge_text field does not exist in hero collection. Creating it...');
        
        const result = await mcp2_create_field({
          collection: 'hero',
          field: 'badge_text',
          type: 'string',
          interface: 'input',
          options: {
            placeholder: 'Enter badge text'
          },
          note: 'Text displayed in the badge at the top of the hero section',
          default_value: 'Especialistas em eletrónica automóvel'
        });
        
        if (result.error) {
          console.error('❌ Error creating badge_text field:', result.error);
        } else {
          console.log('✅ badge_text field created successfully in hero collection');
        }
      }
    }
    
    // 2. Set up status field filter for all collections to only show published items
    console.log('📋 Setting up status field filters for collections...');
    
    // List of collections that have a status field
    const collectionsWithStatus = ['services', 'products', 'news', 'pages', 'sub_menu_content'];
    
    for (const collection of collectionsWithStatus) {
      console.log(`🔍 Checking schema for ${collection} collection...`);
      const schema = await mcp2_get_collection_schema({ collection });
      
      if (schema.error) {
        console.error(`❌ Error getting ${collection} collection schema:`, schema.error);
        continue;
      }
      
      // Check if the collection has a status field
      const hasStatusField = schema.fields && 
        Object.values(schema.fields).some(field => field.field === 'status');
      
      if (hasStatusField) {
        console.log(`✅ ${collection} collection has a status field`);
      } else {
        console.log(`⚠️ ${collection} collection does not have a status field. Creating it...`);
        
        const result = await mcp2_create_field({
          collection,
          field: 'status',
          type: 'string',
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Published', value: 'published' },
              { text: 'Draft', value: 'draft' },
              { text: 'Archived', value: 'archived' }
            ]
          },
          note: 'Publication status',
          default_value: 'published'
        });
        
        if (result.error) {
          console.error(`❌ Error creating status field for ${collection}:`, result.error);
        } else {
          console.log(`✅ status field created successfully for ${collection}`);
        }
      }
    }
    
    console.log('✅ All setup tasks completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up Directus:', error);
  }
}

setupDirectus();