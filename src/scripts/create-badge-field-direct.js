// Script to create the badge_text field directly using the token from the environment file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const DIRECTUS_TOKEN = process.env.VITE_DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN not found in environment variables');
  process.exit(1);
}

async function createBadgeField() {
  try {
    console.log('🔍 Creating badge_text field in hero collection...');
    
    // Create the field
    const response = await fetch(`${DIRECTUS_URL}/fields/hero`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        field: 'badge_text',
        type: 'string',
        meta: {
          interface: 'input',
          options: {
            placeholder: 'Enter badge text'
          },
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
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create field: ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    console.log('✅ Field created successfully:', result);
    
    // Check if hero item exists
    console.log('🔍 Checking if hero item exists...');
    const heroResponse = await fetch(`${DIRECTUS_URL}/items/hero/1`, {
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`
      }
    });
    
    if (heroResponse.ok) {
      // Update the hero item with the badge_text field
      console.log('✅ Hero item exists. Updating with badge_text field...');
      const updateResponse = await fetch(`${DIRECTUS_URL}/items/hero/1`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          badge_text: 'Especialistas em eletrónica automóvel'
        })
      });
      
      if (!updateResponse.ok) {
        const updateErrorData = await updateResponse.json();
        throw new Error(`Failed to update hero item: ${JSON.stringify(updateErrorData)}`);
      }
      
      console.log('✅ Hero item updated with badge_text field');
    } else if (heroResponse.status === 404) {
      // Create the hero item if it doesn't exist
      console.log('❌ Hero item does not exist. Creating it...');
      const createResponse = await fetch(`${DIRECTUS_URL}/items/hero`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 1,
          title: 'Performance, diagnóstico e soluções para a sua centralina',
          subtitle: 'Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.',
          primary_button_text: 'Ver Serviços',
          primary_button_link: '/servicos',
          badge_text: 'Especialistas em eletrónica automóvel'
        })
      });
      
      if (!createResponse.ok) {
        const createErrorData = await createResponse.json();
        throw new Error(`Failed to create hero item: ${JSON.stringify(createErrorData)}`);
      }
      
      console.log('✅ Hero item created with badge_text field');
    } else {
      const heroErrorData = await heroResponse.json();
      throw new Error(`Failed to check hero item: ${JSON.stringify(heroErrorData)}`);
    }
    
    console.log('✅ All done! The badge_text field is now available in the hero collection.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createBadgeField();