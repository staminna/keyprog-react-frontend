// Script to create the badge_text field in the hero collection
const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'stamina.nunes@gmail.com';
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Nov3abril';

async function createHeroBadgeField() {
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
          schema: {
            name: 'hero',
            comment: 'Hero section content'
          },
          meta: {
            singleton: true,
            icon: 'star',
            note: 'Hero section content for the homepage'
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
    
    // Check if badge_text field exists
    console.log('🔍 Checking if badge_text field exists...');
    try {
      const fieldResponse = await axios.get(`${DIRECTUS_URL}/fields/hero/badge_text`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ badge_text field already exists');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ badge_text field does not exist. Creating it...');
        await axios.post(`${DIRECTUS_URL}/fields/hero`, {
          field: 'badge_text',
          type: 'string',
          schema: {
            name: 'badge_text',
            table: 'hero',
            data_type: 'varchar',
            default_value: 'Especialistas em eletrónica automóvel',
            max_length: 255,
            is_nullable: true
          },
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
          }
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('✅ badge_text field created');
        
        // Create initial hero item if it doesn't exist
        console.log('🔍 Checking if hero item exists...');
        try {
          const heroItemResponse = await axios.get(`${DIRECTUS_URL}/items/hero/1`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          console.log('✅ Hero item exists, updating with badge_text...');
          await axios.patch(`${DIRECTUS_URL}/items/hero/1`, {
            badge_text: 'Especialistas em eletrónica automóvel'
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          console.log('✅ Hero item updated with badge_text');
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log('❌ Hero item does not exist. Creating it...');
            await axios.post(`${DIRECTUS_URL}/items/hero`, {
              id: 1,
              badge_text: 'Especialistas em eletrónica automóvel',
              title: 'Keyprog',
              subtitle: 'Serviços de eletrónica automóvel'
            }, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            console.log('✅ Hero item created with badge_text');
          } else {
            throw error;
          }
        }
      } else {
        throw error;
      }
    }
    
    console.log('✅ All done! The badge_text field is now available in the hero collection.');
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

createHeroBadgeField();