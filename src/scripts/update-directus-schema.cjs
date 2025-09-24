// Script to update Directus schema to support the universal inline editor
const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'stamina.nunes@gmail.com';
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Nov3abril';

async function updateDirectusSchema() {
  try {
    console.log('🔑 Authenticating with Directus...');
    const authResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    const accessToken = authResponse.data.data.access_token;
    console.log('✅ Authentication successful');
    
    // Check if hero collection exists
    console.log('🔍 Checking if hero collection exists...');
    try {
      const heroCollectionResponse = await axios.get(`${DIRECTUS_URL}/collections/hero`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ Hero collection exists');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ Hero collection does not exist. Creating it...');
        await axios.post(`${DIRECTUS_URL}/collections`, {
          collection: 'hero',
          meta: {
            singleton: true,
            icon: 'star',
            note: 'Hero section content for the homepage'
          },
          schema: {
            name: 'hero'
          }
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('✅ Hero collection created');
      } else {
        throw error;
      }
    }
    
    // Check if badge_text field exists in hero collection
    console.log('🔍 Checking if badge_text field exists in hero collection...');
    try {
      const badgeFieldResponse = await axios.get(`${DIRECTUS_URL}/fields/hero/badge_text`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ badge_text field exists in hero collection');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ badge_text field does not exist in hero collection. Creating it...');
        await axios.post(`${DIRECTUS_URL}/fields/hero`, {
          field: 'badge_text',
          type: 'string',
          meta: {
            interface: 'input',
            special: null,
            options: {
              placeholder: 'Enter badge text'
            },
            display: 'raw',
            display_options: null,
            readonly: false,
            hidden: false,
            sort: null,
            width: 'full',
            translations: null,
            note: 'Text displayed in the badge at the top of the hero section'
          },
          schema: {
            name: 'badge_text',
            table: 'hero',
            data_type: 'varchar',
            default_value: 'Especialistas em eletrónica automóvel',
            max_length: 255,
            is_nullable: true
          }
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('✅ badge_text field created in hero collection');
      } else {
        throw error;
      }
    }
    
    // Create hero item if it doesn't exist
    console.log('🔍 Checking if hero item exists...');
    try {
      const heroItemResponse = await axios.get(`${DIRECTUS_URL}/items/hero/1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ Hero item exists');
      
      // Check if badge_text field is set
      if (!heroItemResponse.data.data.badge_text) {
        console.log('❌ badge_text field is not set in hero item. Setting it...');
        await axios.patch(`${DIRECTUS_URL}/items/hero/1`, {
          badge_text: 'Especialistas em eletrónica automóvel'
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('✅ badge_text field set in hero item');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ Hero item does not exist. Creating it...');
        await axios.post(`${DIRECTUS_URL}/items/hero`, {
          id: 1,
          title: 'Performance, diagnóstico e soluções para a sua centralina',
          subtitle: 'Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.',
          primary_button_text: 'Ver Serviços',
          primary_button_link: '/servicos',
          badge_text: 'Especialistas em eletrónica automóvel'
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('✅ Hero item created');
      } else {
        throw error;
      }
    }
    
    console.log('✅ All schema updates completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

updateDirectusSchema();