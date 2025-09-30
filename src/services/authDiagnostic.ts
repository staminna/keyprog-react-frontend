import { DirectusService } from './directusService';
import { sessionDirectus } from '@/lib/directus';

/**
 * Test authentication credentials
 */
export async function testAuthCredentials() {
  console.log('🧪 Testing Directus Authentication...');
  console.log('━'.repeat(50));
  
  const email = import.meta.env.VITE_DIRECTUS_EMAIL;
  const password = import.meta.env.VITE_DIRECTUS_PASSWORD;
  const staticToken = import.meta.env.VITE_DIRECTUS_TOKEN;
  
  console.log('📋 Configuration:');
  console.log(`  URL: ${import.meta.env.VITE_DIRECTUS_URL}`);
  console.log(`  Email: ${email ? '✓ Set' : '✗ Missing'}`);
  console.log(`  Password: ${password ? '✓ Set' : '✗ Missing'}`);
  console.log(`  Static Token: ${staticToken ? '✓ Set' : '✗ Missing'}`);
  console.log('━'.repeat(50));
  
  // Test 1: Static Token
  console.log('\n🧪 Test 1: Static Token Authentication');
  try {
    const user = await DirectusService.getCurrentUser();
    if (user) {
      console.log('✅ Static token works');
      console.log(`   User: ${user.email} (${user.role})`);
    } else {
      console.log('❌ Static token failed - no user returned');
    }
  } catch (error) {
    console.log('❌ Static token failed:', error.message);
  }
  
  // Test 2: Session Authentication
  console.log('\n🧪 Test 2: Session Authentication');
  if (!email || !password) {
    console.log('⚠️  Skipped - credentials not set in .env');
  } else {
    try {
      const success = await DirectusService.authenticate(email, password);
      if (success) {
        console.log('✅ Session authentication successful');
        const token = await sessionDirectus.getToken();
        console.log(`   Session token: ${token ? '✓ Created' : '✗ Missing'}`);
        
        const user = await DirectusService.getCurrentUser();
        if (user) {
          console.log(`   User: ${user.email} (${user.role})`);
        }
      } else {
        console.log('❌ Session authentication failed');
        console.log('   Possible causes:');
        console.log('   - Wrong email or password');
        console.log('   - User does not exist');
        console.log('   - User is not active');
      }
    } catch (error) {
      console.log('❌ Session authentication error:', error.message);
    }
  }
  
  // Test 3: Token Verification
  console.log('\n🧪 Test 3: Token Verification');
  try {
    const isValid = await DirectusService.verifyToken();
    console.log(isValid ? '✅ Current token is valid' : '❌ Current token is invalid');
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
  }
  
  console.log('\n' + '━'.repeat(50));
  console.log('🏁 Diagnostic complete');
}

/**
 * Run on app startup if needed
 */
if (import.meta.env.DEV) {
  // Only run in development
  setTimeout(() => {
    if (window.location.search.includes('debug=auth')) {
      testAuthCredentials();
    }
  }, 1000);
}

export default testAuthCredentials;
