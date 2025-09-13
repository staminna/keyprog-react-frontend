// Mock MCP functions until actual MCP integration is available
const mcp1_get_collection_schema = async ({ collection }: { collection: string }): Promise<Record<string, unknown>> => {
  return { collection, fields: [] };
};

const mcp1_validate_collection_schema = async ({ collection, strict }: { collection: string, strict?: boolean }): Promise<Record<string, unknown>> => {
  return { collection, valid: true };
};

/**
 * Schema validation service using MCP server
 * This service validates content against Directus schema
 */
export class SchemaValidator {
  /**
   * Get collection schema from MCP server
   * @param collection Collection name
   * @returns Collection schema
   */
  static async getCollectionSchema(collection: string): Promise<Record<string, unknown>> {
    try {
      const response = await mcp1_get_collection_schema({ collection });
      return response;
    } catch (error) {
      console.error(`Failed to get schema for collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Validate collection schema using MCP server
   * @param collection Collection name
   * @param strict Enable strict validation
   * @returns Validation result
   */
  static async validateCollectionSchema(collection: string, strict = false): Promise<Record<string, unknown>> {
    try {
      const response = await mcp1_validate_collection_schema({ collection, strict });
      return response;
    } catch (error) {
      console.error(`Failed to validate schema for collection ${collection}:`, error);
      return null;
    }
  }

  /**
   * Validate field value against schema
   * @param collection Collection name
   * @param field Field name
   * @param value Field value
   * @returns Validation result
   */
  static async validateField(collection: string, field: string, value: unknown): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    try {
      // Get collection schema
      const schema = await this.getCollectionSchema(collection);
      
      if (!schema) {
        return { valid: true }; // If we can't get schema, assume valid
      }
      
      // Find field schema
      const fieldSchema = schema.fields?.find((f: Record<string, unknown>) => f.field === field);
      
      if (!fieldSchema) {
        return { valid: true }; // If field not found in schema, assume valid
      }
      
      // Validate based on field type
      const errors: string[] = [];
      
      switch (fieldSchema.type) {
        case 'string': {
          const maxLength = fieldSchema.validation?.max_length as number | undefined;
          if (maxLength && String(value).length > maxLength) {
            errors.push(`Value exceeds maximum length of ${maxLength} characters`);
          }
          break;
        }
          
        case 'integer':
        case 'decimal':
        case 'float': {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push('Value must be a number');
          } else {
            const minValue = fieldSchema.validation?.min_value as number | undefined;
            const maxValue = fieldSchema.validation?.max_value as number | undefined;
            
            if (minValue !== undefined && num < minValue) {
              errors.push(`Value must be at least ${minValue}`);
            }
            if (maxValue !== undefined && num > maxValue) {
              errors.push(`Value must be at most ${maxValue}`);
            }
          }
          break;
        }
          
        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 1 && value !== 0) {
            errors.push('Value must be a boolean');
          }
          break;
          
        case 'json':
          try {
            if (typeof value === 'string') {
              JSON.parse(value);
            }
          } catch (e) {
            errors.push('Value must be valid JSON');
          }
          break;
      }
      
      // Check required fields
      if (fieldSchema.required && (value === null || value === undefined || value === '')) {
        errors.push('This field is required');
      }
      
      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error(`Failed to validate field ${field} in collection ${collection}:`, error);
      return { valid: true }; // If validation fails, assume valid
    }
  }
}

export default SchemaValidator;
