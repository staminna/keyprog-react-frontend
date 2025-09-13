/**
 * Script to set up real data collections using the MCP server
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// MCP Server configuration
const MCP_SERVER_URL = process.env.VITE_MCP_SERVER_URL || 'http://localhost:3001';
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN environment variable is required');
  process.exit(1);
}

// Collection definitions for real data
const collections = [
  {
    name: 'hero',
    singleton: true,
    fields: [
      {
        field: 'title',
        type: 'string',
        interface: 'input',
        required: true,
        note: 'Main hero title'
      },
      {
        field: 'subtitle',
        type: 'text',
        interface: 'input-multiline',
        note: 'Hero subtitle text'
      },
      {
        field: 'primary_button_text',
        type: 'string',
        interface: 'input',
        note: 'Text for the primary button'
      },
      {
        field: 'primary_button_link',
        type: 'string',
        interface: 'input',
        note: 'Link for the primary button'
      }
    ]
  },
  {
    name: 'contact_info',
    singleton: true,
    fields: [
      {
        field: 'title',
        type: 'string',
        interface: 'input',
        required: true,
        note: 'Contact section title'
      },
      {
        field: 'email',
        type: 'string',
        interface: 'input',
        note: 'Contact email address'
      },
      {
        field: 'phone',
        type: 'string',
        interface: 'input',
        note: 'Contact phone number'
      },
      {
        field: 'chat_hours',
        type: 'string',
        interface: 'input',
        note: 'Chat availability hours'
      },
      {
        field: 'contact_form_text',
        type: 'string',
        interface: 'input',
        note: 'Text for the contact form button'
      },
      {
        field: 'contact_form_link',
        type: 'string',
        interface: 'input',
        note: 'Link to the contact form'
      }
    ]
  },
  {
    name: 'services',
    fields: [
      {
        field: 'title',
        type: 'string',
        interface: 'input',
        required: true,
        note: 'Service title'
      },
      {
        field: 'description',
        type: 'text',
        interface: 'input-rich-text-html',
        note: 'Service description'
      },
      {
        field: 'slug',
        type: 'string',
        interface: 'input',
        required: true,
        note: 'URL-friendly identifier'
      },
      {
        field: 'image',
        type: 'uuid',
        interface: 'file-image',
        special: ['file'],
        note: 'Service image'
      },
      {
        field: 'price',
        type: 'float',
        interface: 'input',
        note: 'Service price'
      },
      {
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
        default_value: 'published',
        note: 'Publication status'
      }
    ]
  }
];

/**
 * Create a collection using the MCP server
 */
async function createCollection(collection) {
  try {
    console.log(`Creating collection: ${collection.name}`);
    
    // Check if collection exists
    const checkResponse = await axios.post(MCP_SERVER_URL, {
      request_type: 'list_tools_request',
      server_name: 'directus',
      model_name: 'directus'
    });
    
    const listCollectionsResponse = await axios.post(MCP_SERVER_URL, {
      request_type: 'call_tool_request',
      server_name: 'directus',
      tool_name: 'list_collections',
      tool_args: {}
    });
    
    const responseText = listCollectionsResponse.data.response.content[0].text;
    if (responseText.includes(`**${collection.name}**`)) {
      console.log(`Collection ${collection.name} already exists. Skipping creation.`);
      return;
    }
    
    // Create collection
    const createResponse = await axios.post(MCP_SERVER_URL, {
      request_type: 'call_tool_request',
      server_name: 'directus',
      tool_name: 'create_collection',
      tool_args: {
        collection: collection.name,
        singleton: collection.singleton || false,
        note: `Collection for ${collection.name}`
      }
    });
    
    console.log(`Collection ${collection.name} created successfully`);
    
    // Create fields
    for (const field of collection.fields) {
      console.log(`Creating field: ${field.field}`);
      
      const createFieldResponse = await axios.post(MCP_SERVER_URL, {
        request_type: 'call_tool_request',
        server_name: 'directus',
        tool_name: 'create_field',
        tool_args: {
          collection: collection.name,
          field: field.field,
          type: field.type,
          interface: field.interface,
          required: field.required || false,
          note: field.note || '',
          special: field.special || [],
          options: field.options || {},
          default_value: field.default_value || null
        }
      });
      
      console.log(`Field ${field.field} created successfully`);
    }
    
    // Set up permissions
    await setupPermissions(collection.name);
    
    return true;
  } catch (error) {
    console.error(`Error creating collection ${collection.name}:`, error.response?.data || error.message);
    return false;
  }
}

/**
 * Set up permissions for a collection
 */
async function setupPermissions(collectionName) {
  try {
    console.log(`Setting up permissions for collection: ${collectionName}`);
    
    // Set read permissions for public role
    const publicPermissionResponse = await axios.post(DIRECTUS_URL + '/permissions', {
      collection: collectionName,
      action: 'read',
      role: null, // Public role
      fields: ['*']
    }, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    // Set create, read, update permissions for authenticated users
    const actions = ['create', 'read', 'update'];
    for (const action of actions) {
      await axios.post(DIRECTUS_URL + '/permissions', {
        collection: collectionName,
        action,
        role: null, // Authenticated users
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
    }
    
    console.log(`Permissions set up successfully for ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`Error setting up permissions for ${collectionName}:`, error.response?.data || error.message);
    return false;
  }
}

/**
 * Create sample data for a collection
 */
async function createSampleData(collection, data) {
  try {
    console.log(`Creating sample data for collection: ${collection}`);
    
    // Check if data already exists for singleton
    if (collection === 'hero' || collection === 'contact_info') {
      const checkResponse = await axios.get(`${DIRECTUS_URL}/items/${collection}`, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
      
      if (checkResponse.data && Object.keys(checkResponse.data).length > 0) {
        console.log(`Data already exists for ${collection}. Updating instead.`);
        
        // Update existing data
        await axios.patch(`${DIRECTUS_URL}/items/${collection}`, data, {
          headers: {
            Authorization: `Bearer ${DIRECTUS_TOKEN}`
          }
        });
        
        console.log(`Data updated for ${collection}`);
        return true;
      }
    }
    
    // Create new data
    await axios.post(`${DIRECTUS_URL}/items/${collection}`, data, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log(`Sample data created for ${collection}`);
    return true;
  } catch (error) {
    console.error(`Error creating sample data for ${collection}:`, error.response?.data || error.message);
    return false;
  }
}

/**
 * Main function to set up all collections
 */
async function main() {
  console.log('Setting up collections using MCP server...');
  
  // Create collections
  for (const collection of collections) {
    await createCollection(collection);
  }
  
  // Create sample data for hero
  await createSampleData('hero', {
    title: 'Performance, diagnóstico e soluções para a sua centralina',
    subtitle: 'Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.',
    primary_button_text: 'Ver Serviços',
    primary_button_link: '/servicos'
  });
  
  // Create sample data for contact_info
  await createSampleData('contact_info', {
    title: 'Como Podemos Ajudar?',
    email: 'suporte@keyprog.pt',
    phone: '+351 XXX XXX XXX',
    chat_hours: 'Seg-Sex: 9h-18h',
    contact_form_text: 'Formulário de Contacto',
    contact_form_link: '/contactos'
  });
  
  // Create sample service
  await createSampleData('services', {
    title: 'Reprogramação de Centralinas',
    description: '<p>Otimização e personalização do desempenho do seu veículo</p>',
    slug: 'reprogramacao-centralinas',
    status: 'published'
  });
  
  console.log('Setup completed successfully!');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
});
