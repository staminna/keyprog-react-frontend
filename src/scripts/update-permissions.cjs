// Script to update permissions for the directus-editor-user
const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'stamina.nunes@gmail.com';
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Nov3abril';

async function updatePermissions() {
  try {
    console.log('🔑 Authenticating with Directus...');
    const authResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    const accessToken = authResponse.data.data.access_token;
    console.log('✅ Authentication successful');
    
    // Find the editor role ID
    console.log('🔍 Finding editor role...');
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const editorRole = rolesResponse.data.data.find(role => 
      role.name.toLowerCase().includes('editor') || role.name === 'directus-editor-user'
    );
    
    if (!editorRole) {
      console.log('❌ Editor role not found. Creating it...');
      const newRoleResponse = await axios.post(`${DIRECTUS_URL}/roles`, {
        name: 'Content Editor',
        app_access: true,
        admin_access: false,
        description: 'Role for content editors'
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      editorRoleId = newRoleResponse.data.data.id;
      console.log(`✅ Created editor role with ID: ${editorRoleId}`);
    } else {
      editorRoleId = editorRole.id;
      console.log(`✅ Found editor role with ID: ${editorRoleId}`);
    }
    
    // Update permissions for the settings collection
    console.log('🔄 Updating permissions for settings collection...');
    
    // Check if permission already exists
    const permissionsResponse = await axios.get(`${DIRECTUS_URL}/permissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const settingsPermission = permissionsResponse.data.data.find(permission => 
      permission.collection === 'settings' && permission.role === editorRoleId
    );
    
    if (settingsPermission) {
      console.log('✅ Settings permission already exists. Updating it...');
      await axios.patch(`${DIRECTUS_URL}/permissions/${settingsPermission.id}`, {
        collection: 'settings',
        action: 'read',
        role: editorRoleId,
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } else {
      console.log('❌ Settings permission does not exist. Creating it...');
      await axios.post(`${DIRECTUS_URL}/permissions`, {
        collection: 'settings',
        action: 'read',
        role: editorRoleId,
        fields: ['*'],
        permissions: {},
        validation: {},
        presets: null,
        limit: null
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    
    console.log('✅ Updated permissions for settings collection');
    
    // Update permissions for the hero collection
    console.log('🔄 Updating permissions for hero collection...');
    
    const heroPermission = permissionsResponse.data.data.find(permission => 
      permission.collection === 'hero' && permission.role === editorRoleId && permission.action === 'update'
    );
    
    if (heroPermission) {
      console.log('✅ Hero update permission already exists. Updating it...');
      await axios.patch(`${DIRECTUS_URL}/permissions/${heroPermission.id}`, {
        collection: 'hero',
        action: 'update',
        role: editorRoleId,
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } else {
      console.log('❌ Hero update permission does not exist. Creating it...');
      await axios.post(`${DIRECTUS_URL}/permissions`, {
        collection: 'hero',
        action: 'update',
        role: editorRoleId,
        fields: ['*'],
        permissions: {},
        validation: {},
        presets: null,
        limit: null
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    
    // Add read permission for hero if it doesn't exist
    const heroReadPermission = permissionsResponse.data.data.find(permission => 
      permission.collection === 'hero' && permission.role === editorRoleId && permission.action === 'read'
    );
    
    if (!heroReadPermission) {
      console.log('❌ Hero read permission does not exist. Creating it...');
      await axios.post(`${DIRECTUS_URL}/permissions`, {
        collection: 'hero',
        action: 'read',
        role: editorRoleId,
        fields: ['*'],
        permissions: {},
        validation: {},
        presets: null,
        limit: null
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    
    console.log('✅ Updated permissions for hero collection');
    
    // Update permissions for the services collection
    console.log('🔄 Updating permissions for services collection...');
    
    const servicesPermissions = ['create', 'read', 'update', 'delete'];
    
    for (const action of servicesPermissions) {
      const servicePermission = permissionsResponse.data.data.find(permission => 
        permission.collection === 'services' && permission.role === editorRoleId && permission.action === action
      );
      
      if (servicePermission) {
        console.log(`✅ Services ${action} permission already exists.`);
      } else {
        console.log(`❌ Services ${action} permission does not exist. Creating it...`);
        await axios.post(`${DIRECTUS_URL}/permissions`, {
          collection: 'services',
          action,
          role: editorRoleId,
          fields: ['*'],
          permissions: {},
          validation: {},
          presets: null,
          limit: null
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }
    }
    
    console.log('✅ Updated permissions for services collection');
    
    console.log('✅ All permissions updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

updatePermissions();