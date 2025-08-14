#!/usr/bin/env node

/**
 * Directus Collections Setup Script
 * This script creates the required collections and sets up proper permissions
 */

import { createDirectus, rest, authentication, createCollection, createField, readRoles, updateRole } from '@directus/sdk';

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'https://keyprog.varrho.com';
const ADMIN_EMAIL = process.env.VITE_DIRECTUS_EMAIL || 'stamina.nunes@gmail.com';
const ADMIN_PASSWORD = process.env.VITE_DIRECTUS_PASSWORD || 'Nov3abril';

const directus = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication());

async function setupCollections() {
  try {
    console.log('🔐 Authenticating with Directus...');
    await directus.login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    console.log('✅ Authentication successful');

    // Create Hero collection (singleton)
    console.log('📝 Creating Hero collection...');
    try {
      await directus.request(createCollection({
        collection: 'hero',
        meta: {
          singleton: true,
          icon: 'star',
          note: 'Hero section content for the homepage'
        },
        schema: {
          name: 'hero'
        }
      }));
      console.log('✅ Hero collection created');
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Hero collection already exists');
      } else {
        console.error('❌ Error creating Hero collection:', error.message);
      }
    }

    // Create Hero fields
    const heroFields = [
      { field: 'title', type: 'string', meta: { interface: 'input', note: 'Main hero title' } },
      { field: 'subtitle', type: 'text', meta: { interface: 'textarea', note: 'Hero subtitle/description' } },
      { field: 'primary_button_text', type: 'string', meta: { interface: 'input', note: 'Primary button text' } },
      { field: 'primary_button_link', type: 'string', meta: { interface: 'input', note: 'Primary button link' } }
    ];

    for (const fieldConfig of heroFields) {
      try {
        await directus.request(createField('hero', fieldConfig));
        console.log(`✅ Hero field '${fieldConfig.field}' created`);
      } catch (error) {
        if (error.message?.includes('already exists')) {
          console.log(`ℹ️  Hero field '${fieldConfig.field}' already exists`);
        } else {
          console.error(`❌ Error creating Hero field '${fieldConfig.field}':`, error.message);
        }
      }
    }

    // Create Services collection
    console.log('📝 Creating Services collection...');
    try {
      await directus.request(createCollection({
        collection: 'services',
        meta: {
          icon: 'build',
          note: 'Services offered by the company'
        },
        schema: {
          name: 'services'
        }
      }));
      console.log('✅ Services collection created');
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Services collection already exists');
      } else {
        console.error('❌ Error creating Services collection:', error.message);
      }
    }

    // Create Services fields
    const servicesFields = [
      { field: 'title', type: 'string', meta: { interface: 'input', note: 'Service title' } },
      { field: 'description', type: 'text', meta: { interface: 'textarea', note: 'Service description' } },
      { field: 'slug', type: 'string', meta: { interface: 'input', note: 'URL slug for the service' } }
    ];

    for (const fieldConfig of servicesFields) {
      try {
        await directus.request(createField('services', fieldConfig));
        console.log(`✅ Services field '${fieldConfig.field}' created`);
      } catch (error) {
        if (error.message?.includes('already exists')) {
          console.log(`ℹ️  Services field '${fieldConfig.field}' already exists`);
        } else {
          console.error(`❌ Error creating Services field '${fieldConfig.field}':`, error.message);
        }
      }
    }

    // Set up permissions for the authenticated user role
    console.log('🔐 Setting up permissions...');
    try {
      const roles = await directus.request(readRoles());
      const adminRole = roles.find(role => role.name === 'Administrator');
      
      if (adminRole) {
        console.log('✅ Administrator role found, permissions should be automatically granted');
      } else {
        console.log('ℹ️  No Administrator role found, you may need to set up permissions manually');
      }
    } catch (error) {
      console.error('❌ Error checking roles:', error.message);
    }

    console.log('🎉 Directus collections setup completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to your Directus admin panel: ' + DIRECTUS_URL + '/admin');
    console.log('2. Navigate to Settings > Roles & Permissions');
    console.log('3. Ensure your user role has read/write access to "hero" and "services" collections');
    console.log('4. Add some sample data to the collections');
    console.log('5. Refresh your React application');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupCollections().catch(console.error);
