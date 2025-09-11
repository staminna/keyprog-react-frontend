import { DirectusService } from './directusService';
import { FallbackService } from './fallbackService';
import { DirectusOrder, DirectusCustomer, DirectusProduct } from '@/lib/directus';

export interface RealTimeEvent {
  type: 'create' | 'update' | 'delete';
  collection: string;
  item: Record<string, unknown>;
  key: string;
  timestamp: string;
}

export type RealTimeCallback = (event: RealTimeEvent) => void;

export class RealTimeService {
  private static ws: WebSocket | null = null;
  private static callbacks: Map<string, Set<RealTimeCallback>> = new Map();
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000;
  private static isConnecting = false;
  private static usingFallback = false;
  private static fallbackPollingInterval: number | null = null;
  private static lastFallbackData: Record<string, Record<string, unknown>[]> = {};

  static async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
      const wsUrl = directusUrl.replace(/^http/, 'ws') + '/websocket';
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log('🔌 WebSocket connected to Directus');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.usingFallback = false;
        
        // Stop fallback polling if it was active
        this.stopFallbackPolling();
        
        // Authenticate with Directus
        await this.authenticate();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private static async authenticate(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Get token from DirectusService
      const token = import.meta.env.VITE_DIRECTUS_TOKEN;
      
      if (token) {
        this.ws.send(JSON.stringify({
          type: 'auth',
          access_token: token
        }));
      }
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
    }
  }

  private static handleMessage(data: Record<string, unknown>): void {
    switch (data.type) {
      case 'auth':
        if (data.status === 'ok') {
          console.log('✅ WebSocket authenticated');
          // Re-subscribe to all collections
          this.callbacks.forEach((_, collection) => {
            this.subscribeToCollection(collection);
          });
        } else {
          console.error('❌ WebSocket authentication failed:', data);
        }
        break;

      case 'subscription':
        if (data.event) {
          this.handleRealTimeEvent(data);
        }
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private static handleRealTimeEvent(data: Record<string, unknown>): void {
    const event = data.event as string;
    const collection = data.collection as string;
    const eventData = data.data as Record<string, unknown>;
    
    const realTimeEvent: RealTimeEvent = {
      type: event as 'create' | 'update' | 'delete',
      collection,
      item: eventData,
      key: (eventData?.id as string) || (eventData?.key as string) || '',
      timestamp: new Date().toISOString()
    };

    // Notify all callbacks for this collection
    const collectionCallbacks = this.callbacks.get(collection);
    if (collectionCallbacks) {
      collectionCallbacks.forEach(callback => {
        try {
          callback(realTimeEvent);
        } catch (error) {
          console.error('Error in real-time callback:', error);
        }
      });
    }

    // Notify global callbacks
    const globalCallbacks = this.callbacks.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach(callback => {
        try {
          callback(realTimeEvent);
        } catch (error) {
          console.error('Error in global real-time callback:', error);
        }
      });
    }
  }

  private static scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnect attempts reached');
      console.log('Switching to fallback mode');
      this.enableFallbackMode();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  private static enableFallbackMode(): void {
    if (this.usingFallback) return;
    
    console.log('📡 Enabling fallback mode for real-time updates');
    this.usingFallback = true;
    
    // Start polling for changes in collections that have subscribers
    this.startFallbackPolling();
  }
  
  private static startFallbackPolling(): void {
    // Stop any existing polling
    this.stopFallbackPolling();
    
    // Initialize last data for collections with subscribers
    this.initializeFallbackData();
    
    // Start polling every 5 seconds
    this.fallbackPollingInterval = window.setInterval(() => {
      this.pollFallbackData();
    }, 5000);
  }
  
  private static stopFallbackPolling(): void {
    if (this.fallbackPollingInterval !== null) {
      clearInterval(this.fallbackPollingInterval);
      this.fallbackPollingInterval = null;
    }
  }
  
  private static async initializeFallbackData(): Promise<void> {
    // Get initial data for all collections with subscribers
    for (const collection of this.callbacks.keys()) {
      if (collection === '*') continue; // Skip global subscription
      
      try {
        const data = await this.getFallbackData(collection);
        this.lastFallbackData[collection] = data;
      } catch (error) {
        console.error(`Error initializing fallback data for ${collection}:`, error);
      }
    }
  }
  
  private static async pollFallbackData(): Promise<void> {
    if (!this.usingFallback) return;
    
    // Check for changes in all collections with subscribers
    for (const collection of this.callbacks.keys()) {
      if (collection === '*') continue; // Skip global subscription
      
      try {
        const newData = await this.getFallbackData(collection);
        const lastData = this.lastFallbackData[collection] || [];
        
        // Compare with last data to detect changes
        this.detectChanges(collection, lastData, newData);
        
        // Update last data
        this.lastFallbackData[collection] = newData;
      } catch (error) {
        console.error(`Error polling fallback data for ${collection}:`, error);
      }
    }
  }
  
  private static async getFallbackData(collection: string): Promise<Record<string, unknown>[]> {
    switch (collection) {
      case 'products':
        return FallbackService.getProducts() as unknown as Record<string, unknown>[];
      case 'orders':
        return FallbackService.getOrders() as Record<string, unknown>[];
      case 'customers':
        return FallbackService.getCustomers() as Record<string, unknown>[];
      case 'services':
        return FallbackService.getServices() as unknown as Record<string, unknown>[];
      case 'news':
        return FallbackService.getNews() as unknown as Record<string, unknown>[];
      case 'categories':
        return FallbackService.getCategories() as unknown as Record<string, unknown>[];
      default:
        return [];
    }
  }
  
  private static detectChanges(collection: string, oldData: Record<string, unknown>[], newData: Record<string, unknown>[]): void {
    // Create maps for faster lookup
    const oldMap = new Map(oldData.map(item => [item.id, item]));
    const newMap = new Map(newData.map(item => [item.id, item]));
    
    // Check for created or updated items
    for (const [id, item] of newMap.entries()) {
      if (!oldMap.has(id)) {
        // Item was created
        this.emitFallbackEvent({
          type: 'create',
          collection,
          item,
          key: id as string,
          timestamp: new Date().toISOString()
        });
      } else {
        // Check if item was updated
        const oldItem = oldMap.get(id);
        if (JSON.stringify(oldItem) !== JSON.stringify(item)) {
          this.emitFallbackEvent({
            type: 'update',
            collection,
            item,
            key: id as string,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // Check for deleted items
    for (const [id, item] of oldMap.entries()) {
      if (!newMap.has(id)) {
        this.emitFallbackEvent({
          type: 'delete',
          collection,
          item,
          key: id as string,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  private static emitFallbackEvent(event: RealTimeEvent): void {
    console.log(`📡 Fallback event: ${event.type} in ${event.collection} for item ${event.key}`);
    
    // Notify collection-specific subscribers
    const collectionCallbacks = this.callbacks.get(event.collection);
    if (collectionCallbacks) {
      collectionCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in fallback callback:', error);
        }
      });
    }
    
    // Notify global subscribers
    const globalCallbacks = this.callbacks.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in global fallback callback:', error);
        }
      });
    }
  }

  static subscribe(collection: string, callback: RealTimeCallback): () => void {
    // Initialize callback set for collection if it doesn't exist
    if (!this.callbacks.has(collection)) {
      this.callbacks.set(collection, new Set());
    }

    // Add callback
    this.callbacks.get(collection)!.add(callback);

    // Subscribe to collection if WebSocket is connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.subscribeToCollection(collection);
    } else if (this.usingFallback) {
      // If in fallback mode, initialize fallback data for this collection
      this.getFallbackData(collection).then(data => {
        this.lastFallbackData[collection] = data;
      });
    } else {
      // Connect if not already connected
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(collection);
      if (callbacks) {
        callbacks.delete(callback);
        
        // If no more callbacks for this collection, unsubscribe
        if (callbacks.size === 0) {
          this.callbacks.delete(collection);
          this.unsubscribeFromCollection(collection);
          
          // Remove fallback data if in fallback mode
          if (this.usingFallback) {
            delete this.lastFallbackData[collection];
          }
        }
      }
    };
  }

  private static subscribeToCollection(collection: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'subscribe',
      collection,
      query: {
        fields: ['*']
      }
    }));

    console.log(`📡 Subscribed to real-time updates for collection: ${collection}`);
  }

  private static unsubscribeFromCollection(collection: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'unsubscribe',
      collection
    }));

    console.log(`📡 Unsubscribed from real-time updates for collection: ${collection}`);
  }

  static disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.usingFallback = false;
    this.stopFallbackPolling();
    this.lastFallbackData = {};
  }

  static isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.usingFallback;
  }
  
  static isFallbackMode(): boolean {
    return this.usingFallback;
  }

  // Convenience methods for common collections
  static subscribeToProducts(callback: RealTimeCallback): () => void {
    return this.subscribe('products', callback);
  }

  static subscribeToOrders(callback: RealTimeCallback): () => void {
    return this.subscribe('orders', callback);
  }

  static subscribeToNews(callback: RealTimeCallback): () => void {
    return this.subscribe('news', callback);
  }

  static subscribeToServices(callback: RealTimeCallback): () => void {
    return this.subscribe('services', callback);
  }

  static subscribeToSettings(callback: RealTimeCallback): () => void {
    return this.subscribe('settings', callback);
  }

  // Subscribe to all collections
  static subscribeToAll(callback: RealTimeCallback): () => void {
    return this.subscribe('*', callback);
  }
}
