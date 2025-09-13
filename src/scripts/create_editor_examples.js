/**
 * Script to create the editor_examples collection in Directus using MCP server
 * This will create the necessary schema for the Visual Editor examples
 */

const axios = require('axios');

// Configuration
const MCP_SERVER_URL = process.env.VITE_MCP_SERVER_URL || 'http://localhost:3001';
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

// Collection schema definition
const editorExamplesSchema = {
  collection: 'editor_examples',
  fields: [
    {
      field: 'id',
      type: 'integer',
      meta: {
        interface: 'input',
        special: ['uuid'],
        primary_key: true
      },
      schema: {
        is_primary_key: true,
        has_auto_increment: true
      }
    },
    {
      field: 'title',
      type: 'string',
      meta: {
        interface: 'input',
        display: 'formatted-value'
      },
      schema: {
        default_value: 'This is an editable title'
      }
    },
    {
      field: 'description',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        display: 'formatted-value'
      },
      schema: {
        default_value: "This is an editable description. You can modify this content if you're authenticated or using Directus Visual Editor."
      }
    },
    {
      field: 'image',
      type: 'uuid',
      meta: {
        interface: 'file-image',
        special: ['file'],
        display: 'image'
      }
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Published', value: 'published' },
            { text: 'Draft', value: 'draft' },
            { text: 'Archived', value: 'archived' }
          ]
        }
      },
      schema: {
        default_value: 'published'
      }
    }
  ]
};

// Sample data to create after schema is set up
const sampleData = {
  title: 'This is an editable title',
  description: "This is an editable description. You can modify this content if you're authenticated or using Directus Visual Editor.",
  status: 'published'
};

// Create the collection schema
async function createSchema() {
  try {
    console.log('Creating editor_examples collection schema...');
    
    // Check if collection exists first
    const checkResponse = await axios.get(`${DIRECTUS_URL}/items/directus_collections?filter[collection][_eq]=editor_examples`, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    if (checkResponse.data.data && checkResponse.data.data.length > 0) {
      console.log('Collection already exists. Skipping schema creation.');
      return true;
    }
    
    // Create collection using Directus API
    await axios.post(`${DIRECTUS_URL}/collections`, {
      collection: 'editor_examples',
      meta: {
        display_template: '{{title}}',
        icon: 'edit',
        note: 'Collection for Visual Editor examples'
      },
      schema: {
        name: 'editor_examples'
      }
    }, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log('Collection created successfully');
    
    // Create fields
    for (const field of editorExamplesSchema.fields) {
      console.log(`Creating field: ${field.field}`);
      
      // Skip id field as it's created automatically
      if (field.field === 'id') continue;
      
      await axios.post(`${DIRECTUS_URL}/fields/editor_examples`, field, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
    }
    
    console.log('Fields created successfully');
    return true;
  } catch (error) {
    console.error('Error creating schema:', error.response?.data || error.message);
    return false;
  }
}

// Create sample data
async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Check if data already exists
    const checkResponse = await axios.get(`${DIRECTUS_URL}/items/editor_examples`, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    if (checkResponse.data.data && checkResponse.data.data.length > 0) {
      console.log('Sample data already exists. Skipping data creation.');
      return true;
    }
    
    // Create sample item
    await axios.post(`${DIRECTUS_URL}/items/editor_examples`, sampleData, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log('Sample data created successfully');
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error.response?.data || error.message);
    return false;
  }
}

// Set up permissions
async function setupPermissions() {
  try {
    console.log('Setting up permissions...');
    
    // Get the public role ID
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles?filter[name][_eq]=Public`, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    if (!rolesResponse.data.data || rolesResponse.data.data.length === 0) {
      console.log('Public role not found. Skipping permissions setup.');
      return false;
    }
    
    const publicRoleId = rolesResponse.data.data[0].id;
    
    // Create permissions for the public role
    const permissions = {
      collection: 'editor_examples',
      action: 'read',
      role: publicRoleId,
      fields: ['*']
    };
    
    await axios.post(`${DIRECTUS_URL}/permissions`, permissions, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    // Create permissions for authenticated users
    const authenticatedPermissions = [
      {
        collection: 'editor_examples',
        action: 'create',
        role: null,
        fields: ['*']
      },
      {
        collection: 'editor_examples',
        action: 'update',
        role: null,
        fields: ['*']
      },
      {
        collection: 'editor_examples',
        action: 'read',
        role: null,
        fields: ['*']
      }
    ];
    
    for (const perm of authenticatedPermissions) {
      await axios.post(`${DIRECTUS_URL}/permissions`, perm, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
    }
    
    console.log('Permissions set up successfully');
    return true;
  } catch (error) {
    console.error('Error setting up permissions:', error.response?.data || error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting setup of editor_examples collection...');
  
  // Create schema
  const schemaCreated = await createSchema();
  if (!schemaCreated) {
    console.log('Failed to create schema. Exiting.');
    return;
  }
  
  // Create sample data
  const dataCreated = await createSampleData();
  if (!dataCreated) {
    console.log('Failed to create sample data. Exiting.');
    return;
  }
  
  // Setup permissions
  const permissionsSet = await setupPermissions();
  if (!permissionsSet) {
    console.log('Failed to set up permissions. Exiting.');
    return;
  }
  
  console.log('Setup completed successfully!');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
});
