// Script to create the badge_text field in the hero collection using MCP
import { mcp2_create_field, mcp2_get_collection_schema } from '../mcp-tools.js';

async function createBadgeField() {
  try {
    console.log('🔍 Checking if hero collection exists...');
    const heroSchema = await mcp2_get_collection_schema({ collection: 'hero' });
    
    if (heroSchema.error) {
      console.error('❌ Error getting hero collection schema:', heroSchema.error);
      return;
    }
    
    console.log('✅ Hero collection exists');
    
    // Check if badge_text field exists
    const hasField = heroSchema.fields && 
      Object.values(heroSchema.fields).some(field => field.field === 'badge_text');
    
    if (hasField) {
      console.log('✅ badge_text field already exists');
      return;
    }
    
    console.log('❌ badge_text field does not exist. Creating it...');
    
    // Create the badge_text field
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
      return;
    }
    
    console.log('✅ badge_text field created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createBadgeField();