import { mcp0_add_roots, mcp0_analyze_collection_schema, mcp0_create_collection, mcp0_create_field, mcp0_create_relationship, mcp0_get_collection_schema, mcp0_list_collections } from '@/mcp-tools';

/**
 * Service for interacting with Directus via MCP server
 * This provides optimized access to Directus collections and fields
 */
export class MCPDirectusService {
  /**
   * Initialize the MCP service with the project root
   */
  static async initialize() {
    try {
      await mcp0_add_roots({
        roots: [
          {
            name: 'keyprog-directus',
            uri: 'file:///Users/jorgenunes/2026/keyprog-local/keyprog-directus'
          }
        ]
      });
      console.log('MCP Directus service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize MCP Directus service:', error);
      return false;
    }
  }

  /**
   * Get all collections from Directus
   */
  static async getCollections(includeSystem = false) {
    try {
      const result = await mcp0_list_collections({
        include_system: includeSystem
      });
      return result.data || [];
    } catch (error) {
      console.error('Failed to get collections:', error);
      return [];
    }
  }

  /**
   * Get schema for a specific collection
   */
  static async getCollectionSchema(collection: string) {
    try {
      const result = await mcp0_get_collection_schema({
        collection
      });
      return result;
    } catch (error) {
      console.error(`Failed to get schema for collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Analyze a collection schema to find editable fields
   */
  static async analyzeCollection(collection: string) {
    try {
      const result = await mcp0_analyze_collection_schema({
        collection,
        includeRelations: true,
        validateConstraints: true
      });
      return result;
    } catch (error) {
      console.error(`Failed to analyze collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Create a new collection for editable content
   */
  static async createCollection(collection: string, fields: any[]) {
    try {
      const result = await mcp0_create_collection({
        collection,
        fields
      });
      return result;
    } catch (error) {
      console.error(`Failed to create collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Create a new field in a collection
   */
  static async createField(collection: string, field: string, type: string, options: any = {}) {
    try {
      const result = await mcp0_create_field({
        collection,
        field,
        type,
        ...options
      });
      return result;
    } catch (error) {
      console.error(`Failed to create field ${field} in collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Create a relationship between collections
   */
  static async createRelationship(options: any) {
    try {
      const result = await mcp0_create_relationship(options);
      return result;
    } catch (error) {
      console.error('Failed to create relationship:', error);
      return null;
    }
  }

  /**
   * Get all editable fields for a collection
   * This is useful for automatically generating editable components
   */
  static async getEditableFields(collection: string) {
    try {
      const schema = await this.getCollectionSchema(collection);
      if (!schema) return [];
      
      // Filter for fields that are typically editable
      const editableTypes = ['string', 'text', 'wysiwyg', 'markdown', 'integer', 'float', 'decimal', 'boolean'];
      
      return Object.entries(schema.fields)
        .filter(([_, field]) => editableTypes.includes(field.type))
        .map(([name, field]) => ({
          name,
          type: field.type,
          interface: field.interface,
          required: field.required,
          collection
        }));
    } catch (error) {
      console.error(`Failed to get editable fields for collection ${collection}:`, error);
      return [];
    }
  }

  /**
   * Scan all collections and create a mapping of editable fields
   * This is useful for automatically generating editable components for all routes
   */
  static async scanAllCollections() {
    try {
      const collections = await this.getCollections();
      const editableMapping = {};
      
      for (const collection of collections) {
        const fields = await this.getEditableFields(collection.collection);
        if (fields.length > 0) {
          editableMapping[collection.collection] = fields;
        }
      }
      
      return editableMapping;
    } catch (error) {
      console.error('Failed to scan all collections:', error);
      return {};
    }
  }
}

export default MCPDirectusService;