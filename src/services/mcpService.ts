import { MCP_CONFIG } from '@/config/mcp-config';
import { DirectusService } from './directusService';
import { sessionDirectus } from '@/lib/directus';

// Define response types
interface MCPResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// Define collection item types
interface CollectionItem {
  id: string | number;
  [key: string]: unknown;
}

interface CollectionSchema {
  fields: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

interface FileItem {
  id: string;
  title: string;
  filename_download: string;
  type: string;
  filesize: number;
  [key: string]: unknown;
}

/**
 * Service for interacting with the Directus MCP server
 */
export class MCPService {
  private static baseUrl = MCP_CONFIG.SERVER_URL;
  private static timeout = MCP_CONFIG.TIMEOUT;
  private static retries = MCP_CONFIG.RETRIES;
  private static retryDelay = MCP_CONFIG.RETRY_DELAY;
  private static maxRetryDelay = MCP_CONFIG.MAX_RETRY_DELAY;

  /**
   * Initialize the MCP service
   */
  public static async initialize(): Promise<boolean> {
    try {
      // Ensure we're authenticated with Directus
      await DirectusService.initialize();
      
      // Test connection to MCP server
      const isConnected = await this.testConnection();
      return isConnected;
    } catch (error) {
      console.error('Failed to initialize MCP service:', error);
      return false;
    }
  }

  /**
   * Test connection to the MCP server
   */
  public static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      return response.ok;
    } catch (error) {
      console.error('MCP server connection test failed:', error);
      return false;
    }
  }

  /**
   * List available collections
   */
  public static async listCollections(includeSystem = false): Promise<string[]> {
    return this.callTool('list_collections', { include_system: includeSystem });
  }

  /**
   * Get collection schema
   */
  public static async getCollectionSchema(collection: string): Promise<CollectionSchema> {
    return this.callTool('get_collection_schema', { collection });
  }

  /**
   * Get collection items
   */
  public static async getCollectionItems(params: {
    collection: string;
    limit?: number;
    offset?: number;
    filter?: Record<string, unknown>;
    sort?: string[];
    fields?: string[];
    search?: string;
  }): Promise<CollectionItem[]> {
    return this.callTool('get_collection_items', params);
  }

  /**
   * Create a new item in a collection
   */
  public static async createItem(collection: string, data: Record<string, unknown>): Promise<CollectionItem> {
    return this.callTool('create_item', { collection, data });
  }

  /**
   * Update an existing item in a collection
   */
  public static async updateItem(collection: string, id: string | number, data: Record<string, unknown>): Promise<CollectionItem> {
    return this.callTool('update_item', { collection, id, data });
  }

  /**
   * Delete items from a collection
   */
  public static async deleteItems(collection: string, ids: (string | number)[], cascadeDelete = false): Promise<{ deleted: number }> {
    return this.callTool('delete_items', { collection, ids, confirm: true, cascadeDelete });
  }

  /**
   * Get files with optional filtering
   */
  public static async getFiles(params: {
    limit?: number;
    offset?: number;
    filter?: Record<string, unknown>;
    sort?: string[];
    fields?: string[];
    search?: string;
  } = {}): Promise<FileItem[]> {
    return this.callTool('get_files', params);
  }

  /**
   * Call a tool on the MCP server
   */
  private static async callTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    // Get authentication token
    let token = '';
    
    try {
      // Check if we're in Directus Editor context
      const isInDirectusEditor = await DirectusService['checkDirectusEditor']()
        .then(result => result.isEditor)
        .catch(() => false);
      
      if (isInDirectusEditor && DirectusService['parentToken']) {
        // Use parent token if in Directus editor
        token = DirectusService['parentToken'];
      } else {
        // Otherwise use session token
        token = await sessionDirectus.getToken() || '';
      }
    } catch (error) {
      console.warn('Could not get authentication token:', error);
    }

    // Call the tool with retries
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.retries) {
      try {
        const response = await fetch(`${this.baseUrl}/tools`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name,
            arguments: args,
          }),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`MCP tool call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result.data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`MCP tool call attempt ${attempt + 1} failed:`, error);
        
        // Calculate backoff delay
        const delay = Math.min(this.retryDelay * Math.pow(2, attempt), this.maxRetryDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        attempt++;
      }
    }

    throw lastError || new Error(`MCP tool call failed after ${this.retries} attempts`);
  }
}

// Export a singleton instance
export default MCPService;
