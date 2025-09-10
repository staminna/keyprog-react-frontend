import { DirectusService } from './directusService';

export interface RealTimeEvent {
  type: 'create' | 'update' | 'delete';
  collection: string;
  item: any;
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

  private static handleMessage(data: any): void {
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

  private static handleRealTimeEvent(data: any): void {
    const { event, collection, data: eventData } = data;
    
    const realTimeEvent: RealTimeEvent = {
      type: event as 'create' | 'update' | 'delete',
      collection,
      item: eventData,
      key: eventData?.id || eventData?.key,
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
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
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
  }

  static isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
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
