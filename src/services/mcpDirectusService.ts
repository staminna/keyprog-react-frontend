import { mcp0_add_roots, mcp0_analyze_collection_schema, mcp0_create_collection, mcp0_create_field, mcp0_create_relationship, mcp0_get_collection_schema, mcp0_list_collections } from '@/mcp-tools';
import { DirectusRelationship } from '@/lib/directus-types';

// Define types needed for this service
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type FieldData = { type: string; interface?: string; required?: boolean };

// Define EditableField interface outside the class for better structure
interface EditableField {
  name: string;
  type: string;
  interface?: string;
  required?: boolean;
  collection: string;
}

/**
 * Service for interacting with Directus via MCP server
 * This provides optimized access to Directus collections and fields
 */
export class MCPDirectusService {
  /**
   * Initialize the MCP service with the project root
   */
  static async initialize(): Promise<boolean> {
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
  static async getCollections(includeSystem = false): Promise<string[]> {
    try {
      const result = await mcp0_list_collections({
        include_system: includeSystem
      });
      
      // Safely cast the JsonValue result to our expected structure
      if (result && typeof result === 'object' && !Array.isArray(result) && 'data' in result) {
        const data = result.data;
        if (Array.isArray(data)) {
          return data.map(item => String(item));
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to get collections:', error);
      return [];
    }
  }

  /**
   * Get schema for a specific collection
   */
  static async getCollectionSchema(collection: string): Promise<Record<string, unknown> | null> {
    try {
      const result = await mcp0_get_collection_schema({
        collection
      });
      return result as Record<string, unknown>;
    } catch (error) {
      console.error(`Failed to get schema for collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Analyze a collection schema to find editable fields
   */
  static async analyzeCollection(collection: string): Promise<Record<string, unknown> | null> {
    try {
      const result = await mcp0_analyze_collection_schema({
        collection,
        includeRelations: true,
        validateConstraints: true
      });
      return result as Record<string, unknown>;
    } catch (error) {
      console.error(`Failed to analyze collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Create a new collection for editable content
   * @param collection Collection name
   * @param fields Array of field definitions
   */
  static async createCollection(
    collection: string, 
    fields: Array<{
      field: string;
      type: string;
      [key: string]: string | number | boolean | null | undefined;
    }>
  ): Promise<Record<string, unknown> | null> {
    try {
      const result = await mcp0_create_collection({
        collection,
        // Type assertion to satisfy compiler
        fields: fields as unknown as Array<Record<string, JsonValue>>
      });
      return result as Record<string, unknown>;
    } catch (error) {
      console.error(`Failed to create collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Create a new field in a collection
   */
  static async createField(
    collection: string, 
    field: string, 
    type: string, 
    options: Record<string, string | number | boolean | null | undefined> = {}
  ): Promise<Record<string, unknown> | null> {
    try {
      const result = await mcp0_create_field({
        collection,
        field,
        type,
        ...options
      });
      return result as Record<string, unknown>;
    } catch (error) {
      console.error(`Failed to create field ${field} in collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Create a relationship between collections
   */
  static async createRelationship(options: DirectusRelationship): Promise<Record<string, unknown> | null> {
    try {
      const result = await mcp0_create_relationship(options);
      return result as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to create relationship:', error);
      return null;
    }
  }

  /**
   * Get all editable fields for a collection
   * This is useful for automatically generating editable components
   */
  static async getEditableFields(collection: string): Promise<EditableField[]> {
    try {
      const schemaResult = await this.getCollectionSchema(collection);
      if (!schemaResult) return [];
      
      // Extract fields safely with proper type assertion
      const schema = schemaResult as { fields?: Record<string, FieldData> };
      if (!schema.fields) return [];
      
      // Filter for fields that are typically editable
      const editableTypes = ['string', 'text', 'wysiwyg', 'markdown', 'integer', 'float', 'decimal', 'boolean'];
      
      return Object.entries(schema.fields)
        .filter(([_, field]) => 
          field && typeof field === 'object' && 'type' in field && 
          editableTypes.includes(field.type)
        )
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
  static async scanAllCollections(): Promise<Record<string, EditableField[]>> {
    try {
      const collections = await this.getCollections();
      const editableMapping: Record<string, EditableField[]> = {};
      
      for (const collectionName of collections) {
        const fields = await this.getEditableFields(collectionName);
        if (fields.length > 0) {
          editableMapping[collectionName] = fields;
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