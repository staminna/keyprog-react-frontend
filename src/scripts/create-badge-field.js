// Script to create the badge_text field in the hero collection
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the .env file
let token = '';
let directusUrl = 'http://localhost:8065';

try {
  // Try to read from different locations
  let envContent = '';
  const possiblePaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '.env')
  ];
  
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      break;
    }
  }
  
  // Parse the .env file
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    if (line.startsWith('DIRECTUS_TOKEN=')) {
      token = line.split('=')[1].trim();
    } else if (line.startsWith('VITE_DIRECTUS_URL=')) {
      directusUrl = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('Error reading .env file:', error);
}

if (!token) {
  console.error('❌ DIRECTUS_TOKEN not found in environment variables');
  process.exit(1);
}

// Simple fetch implementation using http/https modules
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function createBadgeField() {
  try {
    console.log('🔍 Creating badge_text field in hero collection...');
    
    // Create the field
    const response = await fetch(`${directusUrl}/fields/hero`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    
    if (response.ok) {
      console.log('✅ Field created successfully');
    } else {
      const errorData = await response.text();
      console.log('❌ Failed to create field:', errorData);
    }
    
    // Check if hero item exists
    console.log('🔍 Checking if hero item exists...');
    const heroResponse = await fetch(`${directusUrl}/items/hero/1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (heroResponse.ok) {
      // Update the hero item with the badge_text field
      console.log('✅ Hero item exists. Updating with badge_text field...');
      const updateResponse = await fetch(`${directusUrl}/items/hero/1`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          badge_text: 'Especialistas em eletrónica automóvel'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Hero item updated with badge_text field');
      } else {
        const updateErrorData = await updateResponse.text();
        console.log('❌ Failed to update hero item:', updateErrorData);
      }
    } else if (heroResponse.status === 404) {
      // Create the hero item if it doesn't exist
      console.log('❌ Hero item does not exist. Creating it...');
      const createResponse = await fetch(`${directusUrl}/items/hero`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      
      if (createResponse.ok) {
        console.log('✅ Hero item created with badge_text field');
      } else {
        const createErrorData = await createResponse.text();
        console.log('❌ Failed to create hero item:', createErrorData);
      }
    } else {
      const heroErrorData = await heroResponse.text();
      console.log('❌ Failed to check hero item:', heroErrorData);
    }
    
    console.log('✅ All done! The badge_text field is now available in the hero collection.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createBadgeField();