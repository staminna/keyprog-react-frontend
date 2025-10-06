/**
 * Test Directus Sync Functionality
 * 
 * This script helps verify that Directus → React sync is working correctly
 */

// Test 1: Check if we're in an iframe (Directus Visual Editor)
export function testIframeDetection() {
  const isInIframe = window.self !== window.top;
  console.log('📊 Test 1: Iframe Detection');
  console.log(`  Result: ${isInIframe ? '✅ IN IFRAME' : '❌ NOT IN IFRAME'}`);
  console.log(`  Note: Should be true when viewing in Directus Visual Editor`);
  return isInIframe;
}

// Test 2: Check if event listeners are registered
export function testEventListeners() {
  console.log('📊 Test 2: Event Listener Registration');
  
  let contentUpdateReceived = false;
  let refreshReceived = false;
  
  const contentHandler = () => { contentUpdateReceived = true; };
  const refreshHandler = () => { refreshReceived = true; };
  
  window.addEventListener('directus:content-updated', contentHandler);
  window.addEventListener('directus:refresh', refreshHandler);
  
  // Trigger test events
  window.dispatchEvent(new CustomEvent('directus:content-updated', {
    detail: { collection: 'test', itemId: '1', field: 'title' }
  }));
  
  window.dispatchEvent(new CustomEvent('directus:refresh', {
    detail: { timestamp: Date.now() }
  }));
  
  // Small delay to allow handlers to fire
  setTimeout(() => {
    console.log(`  Content Update Handler: ${contentUpdateReceived ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`  Refresh Handler: ${refreshReceived ? '✅ WORKING' : '❌ NOT WORKING'}`);
    
    window.removeEventListener('directus:content-updated', contentHandler);
    window.removeEventListener('directus:refresh', refreshHandler);
  }, 100);
}

// Test 3: Check if refresh utilities are available
export function testRefreshUtilities() {
  console.log('📊 Test 3: Refresh Utilities Availability');
  
  const utilities = [
    'refreshDirectusContent',
    'refreshDirectusItem',
    'enableDirectusDebugLogging',
    'disableDirectusDebugLogging'
  ];
  
  utilities.forEach(util => {
    const available = typeof (window as unknown as Record<string, unknown>)[util] === 'function';
    console.log(`  ${util}: ${available ? '✅ AVAILABLE' : '❌ MISSING'}`);
  });
}

// Test 4: Simulate Directus content update
export function testSimulateDirectusUpdate() {
  console.log('📊 Test 4: Simulate Directus Content Update');
  console.log('  Dispatching test content update event...');
  
  window.dispatchEvent(new CustomEvent('directus:content-updated', {
    detail: {
      collection: 'hero',
      itemId: '1',
      field: 'title',
      value: 'Test Update at ' + new Date().toLocaleTimeString(),
      timestamp: Date.now()
    }
  }));
  
  console.log('  ✅ Event dispatched - check if components refresh');
  console.log('  Look for "🔄 Refreshing content due to Directus update" in console');
}

// Test 5: Simulate Directus refresh request
export function testSimulateRefresh() {
  console.log('📊 Test 5: Simulate Directus Refresh Request');
  console.log('  Dispatching refresh event...');
  
  window.dispatchEvent(new CustomEvent('directus:refresh', {
    detail: { timestamp: Date.now() }
  }));
  
  console.log('  ✅ Event dispatched - all components should refresh');
}

// Run all tests
export function runAllTests() {
  console.log('🧪 Running Directus Sync Tests...\n');
  
  testIframeDetection();
  console.log('');
  
  testEventListeners();
  console.log('');
  
  testRefreshUtilities();
  console.log('');
  
  setTimeout(() => {
    testSimulateDirectusUpdate();
    console.log('');
    
    setTimeout(() => {
      testSimulateRefresh();
      console.log('\n✅ All tests completed!');
      console.log('Check above for any ❌ failures');
    }, 1000);
  }, 500);
}

// Expose test functions globally
if (typeof window !== 'undefined') {
  (window as Window & { testDirectusSync?: Record<string, unknown> }).testDirectusSync = {
    runAll: runAllTests,
    testIframeDetection,
    testEventListeners,
    testRefreshUtilities,
    testSimulateUpdate: testSimulateDirectusUpdate,
    testSimulateRefresh
  };
  
  console.log('🧪 Directus Sync Tests loaded!');
  console.log('Run tests with: window.testDirectusSync.runAll()');
}
