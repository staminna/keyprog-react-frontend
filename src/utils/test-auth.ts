import { DirectusService } from '@/services/directusService';

/**
 * Test utility to verify authentication works correctly
 * This should be removed in production
 */
export const testAuthentication = async () => {
  console.log('🔐 Testing Directus Authentication...');
  
  // Test 1: Invalid credentials should fail
  console.log('\n📋 Test 1: Invalid credentials');
  const invalidResult = await DirectusService.authenticate('invalid@email.com', 'wrongpassword');
  console.log('Invalid credentials result:', invalidResult ? '❌ FAILED - Should reject' : '✅ PASSED - Correctly rejected');
  
  // Test 2: Empty credentials should fail
  console.log('\n📋 Test 2: Empty credentials');
  const emptyResult = await DirectusService.authenticate('', '');
  console.log('Empty credentials result:', emptyResult ? '❌ FAILED - Should reject' : '✅ PASSED - Correctly rejected');
  
  // Test 3: Valid credentials (if you have them)
  console.log('\n📋 Test 3: Valid credentials (manual test)');
  console.log('Please test with your actual Directus credentials to verify they work');
  
  return {
    invalidCredentialsRejected: !invalidResult,
    emptyCredentialsRejected: !emptyResult
  };
};
