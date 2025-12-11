/**
 * MCP Directus Integration
 * Provides real-time schema awareness and data queries through the Directus MCP server
 */

import { DirectusSchema, DirectusQueries } from '../types/directus-schema';
import { directus } from './directus';

// =============================================================================
// MCP SERVER CONFIGURATION
// =============================================================================

const MCP_SERVER_CONFIG = {
  command: 'node',
  args: [
    '/Users/jorgenunes/2026/keyprog-local/keyprog-directus/mcp-server/dist/index.js'
  ],
  env: {
    DIRECTUS_URL: 'http://localhost:8065',
    DIRECTUS_TOKEN: 'vUaNqLyV5QqYpPR9htq77ttZQOCyo2h7',
    MCP_SYSTEM_PROMPT_ENABLED: 'true',
    DIRECTUS_PROMPTS_COLLECTION_ENABLED: 'true',
    DIRECTUS_PROMPTS_COLLECTION: 'ai_prompts',
    DIRECTUS_PROMPTS_NAME_FIELD: 'name',
    DIRECTUS_PROMPTS_DESCRIPTION_FIELD: 'description',
    DIRECTUS_PROMPTS_SYSTEM_PROMPT_FIELD: 'system_prompt',
    DIRECTUS_PROMPTS_MESSAGES_FIELD: 'messages',
    DIRECTUS_RESOURCES_ENABLED: 'true',
    DIRECTUS_RESOURCES_EXCLUDE_SYSTEM: 'true'
  }
};

// =============================================================================
// MCP CLIENT INTERFACE
// =============================================================================

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

interface MCPClient {
  list_tools(): Promise<MCPTool[]>;
  call_tool(name: string, arguments_: any): Promise<any>;
  list_resources(): Promise<MCPResource[]>;
  read_resource(uri: string): Promise<{ contents: Array<{ type: string; text?: string; data?: string }> }>;
  close(): void;
}

// =============================================================================
// MCP DIRECTUS QUERIES IMPLEMENTATION
// =============================================================================

class MCPDirectusQueries implements DirectusQueries {
  private mcpClient: MCPClient;

  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }

  async getHeaderMenu() {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'header_menu',
        query: {
          sort: ['sort'],
          filter: {
            status: { _eq: 'published' }
          }
        }
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching header menu:', error);
      return [];
    }
  }

  async getFooterMenu() {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'footer_menu',
        query: {
          sort: ['sort']
        }
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching footer menu:', error);
      return [];
    }
  }

  async getHero() {
    try {
      const result = await this.mcpClient.call_tool('read_singleton', {
        collection: 'hero'
      });
      
      return result.data || {};
    } catch (error) {
      console.error('Error fetching hero:', error);
      return {};
    }
  }

  async getServices(publishedOnly = true) {
    try {
      const query: any = {
        sort: ['sort'],
        filter: {}
      };
      
      if (publishedOnly) {
        query.filter.status = { _eq: 'published' };
      }
      
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'services',
        query
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async getServiceBySlug(slug: string) {
    try {
      const result = await this.mcpClient.call_tool('read_item', {
        collection: 'services',
        id: slug,
        query: {
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' }
          }
        }
      });
      
      return result.data || null;
    } catch (error) {
      console.error('Error fetching service by slug:', error);
      return null;
    }
  }

  async getCategories() {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'categories',
        query: {
          sort: ['sort']
        }
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string) {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'categories',
        query: {
          filter: {
            slug: { _eq: slug }
          }
        }
      });
      
      return result.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return null;
    }
  }

  async getSubMenuContent(category?: string, publishedOnly = true) {
    try {
      const query: any = {
        sort: ['sort'],
        filter: {}
      };
      
      if (category) {
        query.filter.category = { _eq: category };
      }
      
      if (publishedOnly) {
        query.filter.status = { _eq: 'published' };
      }
      
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'sub_menu_content',
        query
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching sub menu content:', error);
      return [];
    }
  }

  async getSubMenuContentBySlug(slug: string) {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'sub_menu_content',
        query: {
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' }
          }
        }
      });
      
      return result.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching sub menu content by slug:', error);
      return null;
    }
  }

  async getPages(publishedOnly = true) {
    try {
      const query: any = {
        sort: ['sort'],
        filter: {}
      };
      
      if (publishedOnly) {
        query.filter.status = { _eq: 'published' };
      }
      
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'pages',
        query
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching pages:', error);
      return [];
    }
  }

  async getPageBySlug(slug: string) {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'pages',
        query: {
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' }
          }
        }
      });
      
      return result.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      return null;
    }
  }

  async getNews(limit = 10) {
    try {
      const result = await this.mcpClient.call_tool('read_items', {
        collection: 'news',
        query: {
          sort: ['-published_date'],
          limit
        }
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  async getNewsById(id: string) {
    try {
      const result = await this.mcpClient.call_tool('read_item', {
        collection: 'news',
        id
      });
      
      return result.data || null;
    } catch (error) {
      console.error('Error fetching news by id:', error);
      return null;
    }
  }

  async getSettings() {
    try {
      const result = await this.mcpClient.call_tool('read_singleton', {
        collection: 'settings'
      });
      
      return result.data || {};
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  }
}

// =============================================================================
// SCHEMA AWARENESS UTILITIES
// =============================================================================

export class SchemaAwareness {
  private mcpClient: MCPClient;

  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }

  async getCurrentSchema() {
    try {
      const result = await this.mcpClient.call_tool('get_schema', {});
      return result.data;
    } catch (error) {
      console.error('Error fetching schema:', error);
      return null;
    }
  }

  async watchSchemaChanges(callback: (schema: any) => void) {
    // In a real implementation, this would set up a WebSocket or polling mechanism
    // to watch for schema changes and call the callback
    
    const pollSchema = async () => {
      try {
        const schema = await this.getCurrentSchema();
        if (schema) {
          callback(schema);
        }
      } catch (error) {
        console.error('Error in schema polling:', error);
      }
    };

    // Poll every 30 seconds
    const intervalId = setInterval(pollSchema, 30000);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  async validateDataAgainstSchema(collection: string, data: any) {
    try {
      const result = await this.mcpClient.call_tool('validate_data', {
        collection,
        data
      });
      
      return result.data;
    } catch (error) {
      console.error('Error validating data:', error);
      return { valid: false, errors: ['Validation failed'] };
    }
  }
}

// =============================================================================
// MAIN MCP DIRECTUS CLIENT
// =============================================================================

export class MCPDirectusClient {
  private queries: MCPDirectusQueries;
  private schemaAwareness: SchemaAwareness;
  private mcpClient: MCPClient;

  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
    this.queries = new MCPDirectusQueries(mcpClient);
    this.schemaAwareness = new SchemaAwareness(mcpClient);
  }

  get queriesInstance(): DirectusQueries {
    return this.queries;
  }

  get schemaAwarenessInstance(): SchemaAwareness {
    return this.schemaAwareness;
  }

  async listAvailableTools(): Promise<MCPTool[]> {
    try {
      return await this.mcpClient.list_tools();
    } catch (error) {
      console.error('Error listing tools:', error);
      return [];
    }
  }

  async listAvailableResources(): Promise<MCPResource[]> {
    try {
      return await this.mcpClient.list_resources();
    } catch (error) {
      console.error('Error listing resources:', error);
      return [];
    }
  }

  close() {
    this.mcpClient.close();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export async function createMCPDirectusClient(): Promise<MCPDirectusClient> {
  // In a real implementation, this would create and connect to the MCP client
  // For now, we'll create a mock client
  
  const mockMCPClient: MCPClient = {
    async list_tools() {
      return [
        {
          name: 'read_items',
          description: 'Read items from a Directus collection',
          inputSchema: {
            type: 'object',
            properties: {
              collection: { type: 'string' },
              query: { type: 'object' }
            }
          }
        },
        {
          name: 'read_item',
          description: 'Read a single item from a Directus collection',
          inputSchema: {
            type: 'object',
            properties: {
              collection: { type: 'string' },
              id: { type: 'string' },
              query: { type: 'object' }
            }
          }
        },
        {
          name: 'read_singleton',
          description: 'Read a singleton collection',
          inputSchema: {
            type: 'object',
            properties: {
              collection: { type: 'string' }
            }
          }
        },
        {
          name: 'get_schema',
          description: 'Get the current Directus schema',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ];
    },

    async call_tool(name: string, arguments_: any) {
      console.log(`MCP Tool called: ${name}`, arguments_);
      // In a real implementation, this would make the actual MCP call
      return { data: [] };
    },

    async list_resources() {
      return [];
    },

    async read_resource(uri: string) {
      return { contents: [] };
    },

    close() {
      console.log('MCP client closed');
    }
  };

  return new MCPDirectusClient(mockMCPClient);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { MCPTool, MCPResource, MCPClient };
export { MCP_SERVER_CONFIG };