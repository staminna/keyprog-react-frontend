/**
 * Content Batch Loader
 *
 * Batches and caches Directus content requests to prevent rate limiting.
 * Instead of making individual requests for each field, this service:
 * 1. Batches multiple requests for the same collection/item into one API call
 * 2. Caches results to avoid redundant requests
 * 3. Implements request deduplication
 */

import { DirectusServiceExtension } from './directusServiceExtension';
import { DirectusService } from './directusService';
import { directus, readItems } from '@/lib/directus';

type DirectusItem = Record<string, unknown>;

interface CacheEntry {
  data: DirectusItem | null;
  timestamp: number;
}

interface PendingRequest {
  resolve: (value: DirectusItem | null) => void;
  reject: (error: Error) => void;
}

class ContentBatchLoader {
  // Cache for loaded items
  private cache = new Map<string, CacheEntry>();
  private cacheTTL = 5000; // 5 seconds - shorter TTL for better real-time updates in Visual Editor

  // Pending requests for deduplication
  private pendingRequests = new Map<string, PendingRequest[]>();

  // Batch queue
  private batchQueue = new Map<string, Set<string>>();
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay = 10; // ms - wait 10ms to collect more requests (faster batching)

  /**
   * Get content for a specific field
   */
  async getFieldContent(
    collection: string,
    itemId: string | number,
    field: string,
    bypassCache: boolean = false
  ): Promise<string> {
    const cacheKey = this.getCacheKey(collection, itemId);

    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached !== null) {
        const value = field in cached ? cached[field] : null;
        return value !== null && value !== undefined ? String(value) : '';
      }

      // Check if there's already a pending request for this item (only if not bypassing cache)
      if (this.pendingRequests.has(cacheKey)) {
        // Wait for the existing request
        return new Promise((resolve, reject) => {
          this.pendingRequests.get(cacheKey)!.push({ resolve, reject });
        }).then((item: DirectusItem | null) => {
          const value = item && field in item ? item[field] : null;
          return value !== null && value !== undefined ? String(value) : '';
        });
      }
    } else {
      // If bypassing cache, invalidate existing cache AND pending requests
      this.cache.delete(cacheKey);
      // Cancel any pending requests for this item (they're stale)
      if (this.pendingRequests.has(cacheKey)) {
        this.pendingRequests.delete(cacheKey);
      }
    }

    // Create new pending request
    this.pendingRequests.set(cacheKey, []);

    // Add to batch queue
    this.addToBatch(collection, itemId);

    // Return promise that will be resolved when batch completes
    return new Promise((resolve, reject) => {
      this.pendingRequests.get(cacheKey)!.push({
        resolve: (item: DirectusItem | null) => {
          const value = item && field in item ? item[field] : null;
          resolve(value !== null && value !== undefined ? String(value) : '');
        },
        reject
      });
    });
  }

  /**
   * Add item to batch queue
   */
  private addToBatch(collection: string, itemId: string | number) {
    if (!this.batchQueue.has(collection)) {
      this.batchQueue.set(collection, new Set());
    }

    this.batchQueue.get(collection)!.add(String(itemId));

    // Schedule batch processing
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.processBatch(), this.batchDelay);
    }
  }

  /**
   * Process queued batch requests
   */
  private async processBatch() {
    this.batchTimeout = null;

    const batches = Array.from(this.batchQueue.entries());
    this.batchQueue.clear();

    // Process each collection's batch
    for (const [collection, itemIds] of batches) {
      try {
        if (collection === 'settings') {
          // Special handling for settings singleton
          const settings = await DirectusService.getSettingsItem();
          const cacheKey = this.getCacheKey('settings', 'singleton');

          this.setCache(cacheKey, settings);
          this.resolvePendingRequests(cacheKey, settings);
        } else if (itemIds.size === 1) {
          // Single item - fetch directly
          const itemId = Array.from(itemIds)[0];
          const cacheKey = this.getCacheKey(collection, itemId);

          const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);

          this.setCache(cacheKey, item);
          this.resolvePendingRequests(cacheKey, item);
        } else {
          // Multiple items - batch fetch using Directus SDK
          const itemIdArray = Array.from(itemIds);
          
          try {
            // Use Directus SDK to fetch all items in a single API call
            const response = await directus.request(
              readItems(collection as never, {
                filter: {
                  id: {
                    _in: itemIdArray
                  }
                },
                limit: itemIdArray.length
              })
            );

            const items = Array.isArray(response) ? response : [response];

            // Cache and resolve each item
            for (const item of items) {
              const cacheKey = this.getCacheKey(collection, item.id);
              this.setCache(cacheKey, item);
              this.resolvePendingRequests(cacheKey, item);
            }

            // Handle items that weren't found
            const foundIds = new Set(items.map((item: DirectusItem) => String(item.id)));
            for (const itemId of itemIdArray) {
              if (!foundIds.has(String(itemId))) {
                const cacheKey = this.getCacheKey(collection, itemId);
                this.resolvePendingRequests(cacheKey, null);
              }
            }
          } catch (error) {
            console.error(`Batch fetch failed for ${collection}, falling back to individual requests:`, error);
            // Fallback to individual requests
            for (const itemId of itemIds) {
              const cacheKey = this.getCacheKey(collection, itemId);
              try {
                const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
                this.setCache(cacheKey, item);
                this.resolvePendingRequests(cacheKey, item);
              } catch (itemError) {
                this.rejectPendingRequests(cacheKey, itemError);
              }
            }
          }
        }
      } catch (error) {
        // Suppress console errors for 403/404 (missing pages) to reduce noise
        const errorMessage = error instanceof Error ? error.message : String(error);
        const is403or404 = errorMessage.includes('Forbidden') || errorMessage.includes('403') || errorMessage.includes('404');
        
        if (!is403or404) {
          console.error(`Batch load failed for collection ${collection}:`, error);
        }

        // Reject all pending requests for this batch
        for (const itemId of itemIds) {
          const cacheKey = this.getCacheKey(collection, itemId);
          this.rejectPendingRequests(cacheKey, error);
        }
      }
    }
  }

  /**
   * Get cache key
   */
  private getCacheKey(collection: string, itemId: string | number): string {
    return `${collection}:${itemId}`;
  }

  /**
   * Get item from cache if not expired
   */
  private getFromCache(cacheKey: string): DirectusItem | null {
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCache(cacheKey: string, data: DirectusItem | null) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Resolve all pending requests for a cache key
   */
  private resolvePendingRequests(cacheKey: string, item: DirectusItem | null) {
    const pending = this.pendingRequests.get(cacheKey);

    if (pending) {
      for (const { resolve } of pending) {
        resolve(item);
      }
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Reject all pending requests for a cache key
   */
  private rejectPendingRequests(cacheKey: string, error: Error) {
    const pending = this.pendingRequests.get(cacheKey);

    if (pending) {
      for (const { reject } of pending) {
        reject(error);
      }
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Clear cache for a specific item (after updates)
   */
  invalidateCache(collection: string, itemId: string | number) {
    const cacheKey = this.getCacheKey(collection, itemId);
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Preload entire collection (useful for pages with many items)
   */
  async preloadCollection(collection: string, itemIds: (string | number)[]) {
    const promises = itemIds.map(itemId =>
      this.getFieldContent(collection, itemId, 'id') // Just load the item
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(`Preload failed for ${collection}:`, error);
    }
  }
}

// Singleton instance
export const contentBatchLoader = new ContentBatchLoader();
