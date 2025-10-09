// Editor Login Diagnostic Tool
// Paste this into browser console on localhost:3000 to diagnose login issues

(async function() {
  console.log('🔧 Editor Login Diagnostic Tool Started\n');
  
  // Check 1: Environment variables
  console.log('📋 Step 1: Checking environment variables...');
  console.log('  Note: Environment variables not accessible from console');
  console.log('  Check react-frontend/.env file manually');
  
  // Check 2: Session storage
  console.log('\n📋 Step 2: Checking session storage...');
  const sessionKeys = Object.keys(sessionStorage);
  console.log('  Session storage keys:', sessionKeys);
  if (sessionKeys.length === 0) {
    console.log('  ⚠️ No session storage items found');
  } else {
    sessionKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (key.includes('token') || key.includes('auth') || key.includes('directus')) {
        console.log(`    ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
      }
    });
  }
  
  // Check 3: Local storage
  console.log('\n📋 Step 3: Checking local storage...');
  const localKeys = Object.keys(localStorage);
  console.log('  Local storage keys:', localKeys);
  if (localKeys.length === 0) {
    console.log('  ⚠️ No local storage items found');
  } else {
    localKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (key.includes('token') || key.includes('auth') || key.includes('directus')) {
        console.log(`    ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
      }
    });
  }
  
  // Check 4: Current URL and path
  console.log('\n📋 Step 4: Checking current location...');
  console.log('  URL:', window.location.href);
  console.log('  Pathname:', window.location.pathname);
  console.log('  Search:', window.location.search);
  
  // Check 5: Test Directus connection
  console.log('\n📋 Step 5: Testing Directus connection...');
  const directusUrl = 'http://localhost:8065';
  try {
    const response = await fetch(`${directusUrl}/server/ping`);
    if (response.ok) {
      console.log('  ✅ Directus is reachable at', directusUrl);
    } else {
      console.log('  ⚠️ Directus responded with status:', response.status);
    }
  } catch (error) {
    console.log('  ❌ Cannot reach Directus at', directusUrl);
    console.log('  Error:', error.message);
  }
  
  // Check 6: Test authentication
  console.log('\n📋 Step 6: Testing authentication...');
  const token = localStorage.getItem('directus_session_token') || 
                sessionStorage.getItem('directus_session_token');
  
  if (!token) {
    console.log('  ⚠️ No authentication token found');
    console.log('  Please login first at /login');
  } else {
    console.log('  ✅ Token found:', token.substring(0, 30) + '...');
    
    try {
      const response = await fetch(`${directusUrl}/users/me?fields=id,email,role.id,role.name`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('  ✅ Authentication successful!');
        console.log('  User data:', result.data);
        
        // Check role configuration
        console.log('\n📋 Step 7: Checking role configuration...');
        const roleId = result.data.role?.id;
        const roleName = result.data.role?.name;
        
        console.log('  User role ID:', roleId);
        console.log('  User role name:', roleName);
        
        const ADMIN_ROLE_ID = '0582d74b-a83f-4076-849f-b588e627c868';
        const EDITOR_ROLE_ID = '97ef35d8-3d16-458d-8c93-78e35b7105a4';
        
        if (roleId === ADMIN_ROLE_ID) {
          console.log('  ✅ User is ADMIN');
          console.log('  Should have access to: /admin, /editor');
        } else if (roleId === EDITOR_ROLE_ID) {
          console.log('  ✅ User is EDITOR');
          console.log('  Should have access to: /editor');
        } else {
          console.log('  ⚠️ User has unknown role:', roleId);
        }
        
        // Test authorization logic
        console.log('\n📋 Step 8: Testing authorization logic...');
        const requiredRoles = ['admin', 'administrator', 'editor', 'editor-user'];
        const userRoleName = roleName;
        
        const matchResults = requiredRoles.map(role => {
          const byId = roleId === role;
          const byExactName = userRoleName?.toLowerCase() === role.toLowerCase();
          const byIncludes = userRoleName?.toLowerCase().includes(role.toLowerCase());
          
          return {
            role,
            byId,
            byExactName,
            byIncludes,
            matches: byId || byExactName || byIncludes
          };
        });
        
        console.log('  Authorization checks:', matchResults);
        
        const hasAccess = matchResults.some(r => r.matches);
        if (hasAccess) {
          console.log('  ✅ User SHOULD have access to /editor');
        } else {
          console.log('  ❌ User should NOT have access to /editor');
          console.log('  This is the problem!');
        }
        
      } else {
        console.log('  ❌ Authentication failed with status:', response.status);
        const errorData = await response.json();
        console.log('  Error:', errorData);
      }
    } catch (error) {
      console.log('  ❌ Error testing authentication:', error.message);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log('\nIf you see issues above:');
  console.log('1. ❌ Cannot reach Directus → Start Directus backend');
  console.log('2. ⚠️ No token found → Login at /login first');
  console.log('3. ❌ Authentication failed → Token expired, login again');
  console.log('4. ❌ Should NOT have access → Role configuration issue');
  console.log('\nNext steps:');
  console.log('1. Clear storage: localStorage.clear(); sessionStorage.clear();');
  console.log('2. Navigate to: http://localhost:3000/login');
  console.log('3. Login with Editor credentials');
  console.log('4. Watch console for debug logs');
  console.log('\n');
})();
