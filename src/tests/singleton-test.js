// Simple test script for singleton collections
// This can be run in the browser console to test the DirectusServiceExtension

// Import the DirectusServiceExtension
import { DirectusServiceExtension } from '../services/directusServiceExtension';

/**
 * Test singleton collection handling
 */
async function testSingletonCollections() {
  console.log('===== TESTING SINGLETON COLLECTIONS =====');
  
  // Test isSingleton method
  console.log('Testing isSingleton method:');
  console.log('settings is singleton:', DirectusServiceExtension.isSingleton('settings'));
  console.log('hero is singleton:', DirectusServiceExtension.isSingleton('hero'));
  console.log('contact_info is singleton:', DirectusServiceExtension.isSingleton('contact_info'));
  console.log('services is singleton:', DirectusServiceExtension.isSingleton('services'));
  console.log('unknown is singleton:', DirectusServiceExtension.isSingleton('unknown'));
  
  // Test updateField with singleton collection
  console.log('\nTesting updateField with singleton collection:');
  try {
    const result = await DirectusServiceExtension.updateField(
      'hero',
      '1', // ID is ignored for singletons
      'title',
      'New Hero Title'
    );
    console.log('Update successful:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
  
  // Test updateField with regular collection
  console.log('\nTesting updateField with regular collection:');
  try {
    const result = await DirectusServiceExtension.updateField(
      'services',
      '1',
      'title',
      'New Service Title'
    );
    console.log('Update successful:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
  
  // Test getCollectionItemSafe with singleton collection
  console.log('\nTesting getCollectionItemSafe with singleton collection:');
  try {
    const result = await DirectusServiceExtension.getCollectionItemSafe(
      'hero',
      '1' // ID is ignored for singletons
    );
    console.log('Get successful:', result);
  } catch (error) {
    console.error('Get failed:', error);
  }
  
  // Test getCollectionItemSafe with regular collection
  console.log('\nTesting getCollectionItemSafe with regular collection:');
  try {
    const result = await DirectusServiceExtension.getCollectionItemSafe(
      'services',
      '1'
    );
    console.log('Get successful:', result);
  } catch (error) {
    console.error('Get failed:', error);
  }
  
  // Test field mapping
  console.log('\nTesting field mapping:');
  const heroTitleMapping = DirectusServiceExtension.mapField('hero', 'title');
  console.log('hero.title maps to:', heroTitleMapping);
  
  const contactEmailMapping = DirectusServiceExtension.mapField('contact_info', 'email');
  console.log('contact_info.email maps to:', contactEmailMapping);
  
  console.log('===== SINGLETON COLLECTIONS TEST COMPLETE =====');
}

// Run the test
testSingletonCollections().catch(console.error);

// Export for potential use in other tests
export { testSingletonCollections };
