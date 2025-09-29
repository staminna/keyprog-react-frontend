import type { DirectusSchema } from './directus';

// Define a type for collection names in the schema
export type DirectusCollectionName = keyof DirectusSchema;

// Generic type for items in collections
export type CollectionItem<T extends DirectusCollectionName> = DirectusSchema[T] extends Array<infer U> ? U : never;

// Type for query operations
export interface DirectusQuery<T> {
  filter?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
  offset?: number;
  page?: number;
  fields?: string[];
  deep?: Record<string, unknown>;
  alias?: Record<string, string>;
  aggregate?: Record<string, unknown>;
  groupBy?: string[];
  export?: 'json' | 'csv' | 'xml' | 'yaml';
  meta?: 'total_count' | 'filter_count';
}

// Type for relationship options
// Collection field definition for MCP functions
export interface DirectusFieldSchema {
  name: string;
  type: string;
  interface?: string;
  required?: boolean;
  collection?: string;
  options?: Record<string, unknown>;
}

export interface DirectusCollectionSchema {
  fields: DirectusFieldSchema[];
}

// MCP result type
export interface MCPResult<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface DirectusRelationship {
  type: 'o2o' | 'o2m' | 'm2o' | 'm2m' | 'm2a';
  collection: string;
  field: string;
  related_collection?: string;
  related_field?: string;
  junction_collection?: string;
  junction_field?: string;
  sort_field?: string;
  one_collection_field?: string;
  one_allowed_collections?: string[];
  one_collection_field_required?: boolean;
  one_deselect_action?: 'nullify' | 'delete';
  junction_field_left?: string;
  junction_field_right?: string;
  allowed_collections?: string[];
}
