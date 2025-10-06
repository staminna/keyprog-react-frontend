/**
 * Directus Refresh Utilities
 * 
 * Provides manual refresh capabilities for debugging Directus → React sync issues
 */

import { contentBatchLoader } from '@/services/contentBatchLoader';

/**
 * Manually trigger a global refresh of all Directus content
 * This invalidates all caches and dispatches a refresh event
 * 
 * Usage from browser console:
 * ```
 * window.refreshDirectusContent()
 * ```
 */
export function refreshDirectusContent() {
  console.log('🔄 Manual Directus refresh triggered');
  
  // Clear all caches
  contentBatchLoader.clearAllCache();
  
  // Dispatch refresh event
  window.dispatchEvent(new CustomEvent('directus:refresh', {
    detail: { 
      timestamp: Date.now(),
      manual: true 
    }
  }));
  
  console.log('✅ Refresh event dispatched - components should reload');
}

/**
 * Refresh a specific collection item
 * 
 * @param collection - Collection name (e.g., 'hero', 'services')
 * @param itemId - Item ID
 * 
 * Usage from browser console:
 * ```
 * window.refreshDirectusItem('hero', '1')
 * ```
 */
export function refreshDirectusItem(collection: string, itemId: string | number) {
  console.log(`🔄 Manual refresh for ${collection}:${itemId}`);
  
  // Invalidate cache for this specific item
  contentBatchLoader.invalidateCache(collection, itemId);
  
  // Dispatch specific update event
  window.dispatchEvent(new CustomEvent('directus:content-updated', {
    detail: {
      collection,
      itemId,
      timestamp: Date.now(),
      manual: true
    }
  }));
  
  console.log(`✅ Refresh event dispatched for ${collection}:${itemId}`);
}

/**
 * Enable verbose logging for debugging sync issues
 */
export function enableDirectusDebugLogging() {
  (window as Window & { __DIRECTUS_DEBUG__?: boolean }).__DIRECTUS_DEBUG__ = true;
  console.log('🔍 Directus debug logging enabled');
}

/**
 * Disable verbose logging
 */
export function disableDirectusDebugLogging() {
  (window as Window & { __DIRECTUS_DEBUG__?: boolean }).__DIRECTUS_DEBUG__ = false;
  console.log('🔇 Directus debug logging disabled');
}

// Expose utilities globally for console access
if (typeof window !== 'undefined') {
  (window as Window & {
    refreshDirectusContent?: typeof refreshDirectusContent;
    refreshDirectusItem?: typeof refreshDirectusItem;
    enableDirectusDebugLogging?: typeof enableDirectusDebugLogging;
    disableDirectusDebugLogging?: typeof disableDirectusDebugLogging;
  }).refreshDirectusContent = refreshDirectusContent;
  (window as Window & { refreshDirectusItem?: typeof refreshDirectusItem }).refreshDirectusItem = refreshDirectusItem;
  (window as Window & { enableDirectusDebugLogging?: typeof enableDirectusDebugLogging }).enableDirectusDebugLogging = enableDirectusDebugLogging;
  (window as Window & { disableDirectusDebugLogging?: typeof disableDirectusDebugLogging }).disableDirectusDebugLogging = disableDirectusDebugLogging;
}
