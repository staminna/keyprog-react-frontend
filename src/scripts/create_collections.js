/**
 * Script to create hero and contact_info collections in Directus
 */

const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

// Configuration
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_TOKEN environment variable is required');
  process.exit(1);
}

// Create hero collection (singleton)
async function createHeroCollection() {
  try {
    console.log('Creating hero collection...');
    
    // Create collection
    await axios.post(`${DIRECTUS_URL}/collections`, {
      collection: 'hero',
      meta: {
        singleton: true,
        icon: 'star',
        note: 'Hero section content'
      },
      schema: {
        name: 'hero'
      }
    }, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log('Hero collection created successfully');
    
    // Create fields
    const heroFields = [
      {
        field: 'title',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Main hero title'
        }
      },
      {
        field: 'subtitle',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          note: 'Hero subtitle text'
        }
      },
      {
        field: 'primary_button_text',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Text for the primary button'
        }
      },
      {
        field: 'primary_button_link',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Link for the primary button'
        }
      }
    ];
    
    for (const field of heroFields) {
      await axios.post(`${DIRECTUS_URL}/fields/hero`, field, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
      console.log(`Created field: ${field.field}`);
    }
    
    // Create sample data
    await axios.post(`${DIRECTUS_URL}/items/hero`, {
      title: 'Performance, diagnóstico e soluções para a sua centralina',
      subtitle: 'Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.',
      primary_button_text: 'Ver Serviços',
      primary_button_link: '/servicos'
    }, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log('Hero sample data created');
    
    // Set permissions
    await setupPermissions('hero');
    
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.errors[0].message.includes('Collection "hero" already exists')) {
      console.log('Hero collection already exists, skipping creation');
      return true;
    }
    console.error('Error creating hero collection:', error.response?.data || error.message);
    return false;
  }
}

// Create contact_info collection (singleton)
async function createContactInfoCollection() {
  try {
    console.log('Creating contact_info collection...');
    
    // Create collection
    await axios.post(`${DIRECTUS_URL}/collections`, {
      collection: 'contact_info',
      meta: {
        singleton: true,
        icon: 'mail',
        note: 'Contact information'
      },
      schema: {
        name: 'contact_info'
      }
    }, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log('Contact info collection created successfully');
    
    // Create fields
    const contactFields = [
      {
        field: 'title',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Contact section title'
        }
      },
      {
        field: 'email',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Contact email address'
        }
      },
      {
        field: 'phone',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Contact phone number'
        }
      },
      {
        field: 'chat_hours',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Chat availability hours'
        }
      },
      {
        field: 'contact_form_text',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Text for the contact form button'
        }
      },
      {
        field: 'contact_form_link',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Link to the contact form'
        }
      }
    ];
    
    for (const field of contactFields) {
      await axios.post(`${DIRECTUS_URL}/fields/contact_info`, field, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
      console.log(`Created field: ${field.field}`);
    }
    
    // Create sample data
    await axios.post(`${DIRECTUS_URL}/items/contact_info`, {
      title: 'Como Podemos Ajudar?',
      email: 'suporte@keyprog.pt',
      phone: '+351 XXX XXX XXX',
      chat_hours: 'Seg-Sex: 9h-18h',
      contact_form_text: 'Formulário de Contacto',
      contact_form_link: '/contactos'
    }, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    console.log('Contact info sample data created');
    
    // Set permissions
    await setupPermissions('contact_info');
    
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.errors[0].message.includes('Collection "contact_info" already exists')) {
      console.log('Contact info collection already exists, skipping creation');
      return true;
    }
    console.error('Error creating contact_info collection:', error.response?.data || error.message);
    return false;
  }
}

// Set up permissions for a collection
async function setupPermissions(collection) {
  try {
    console.log(`Setting up permissions for ${collection}...`);
    
    // Get public role ID
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles?filter[name][_eq]=Public`, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    const publicRoleId = rolesResponse.data.data[0]?.id;
    
    if (publicRoleId) {
      // Set read permissions for public role
      await axios.post(`${DIRECTUS_URL}/permissions`, {
        collection,
        action: 'read',
        role: publicRoleId,
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
    }
    
    // Set create, read, update permissions for authenticated users
    const actions = ['create', 'read', 'update'];
    for (const action of actions) {
      await axios.post(`${DIRECTUS_URL}/permissions`, {
        collection,
        action,
        role: null, // Authenticated users
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      });
    }
    
    console.log(`Permissions set up successfully for ${collection}`);
    return true;
  } catch (error) {
    console.error(`Error setting up permissions for ${collection}:`, error.response?.data || error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Creating collections in Directus...');
  
  // Create hero collection
  await createHeroCollection();
  
  // Create contact_info collection
  await createContactInfoCollection();
  
  console.log('Collections created successfully!');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
});
