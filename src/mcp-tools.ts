// This file provides type definitions for MCP tools
// These are automatically injected by the MCP server

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonRecord = Record<string, JsonValue>;
type JsonRecordArray = JsonRecord[];

// Dart MCP server tools
export declare function mcp0_add_roots(options: { roots: Array<{ name?: string; uri: string }> }): Promise<JsonValue>;
export declare function mcp0_analyze_collection_schema(options: { collection: string; includeRelations?: boolean; validateConstraints?: boolean }): Promise<JsonValue>;
export declare function mcp0_analyze_files(options: JsonRecord): Promise<JsonValue>;
export declare function mcp0_analyze_relationships(options: { collection?: string; includeSystemCollections?: boolean }): Promise<JsonValue>;
export declare function mcp0_bulk_operations(options: { collection: string; operations: JsonRecordArray; validate?: boolean }): Promise<JsonValue>;
export declare function mcp0_connect_dart_tooling_daemon(options: { uri: string }): Promise<JsonValue>;
export declare function mcp0_create_collection(options: { collection: string; fields?: JsonRecordArray; meta?: JsonRecord }): Promise<JsonValue>;
export declare function mcp0_create_field(options: { collection: string; field: string; type: string; interface?: string; options?: JsonRecord; required?: boolean; unique?: boolean; validation?: JsonRecord; default_value?: JsonValue; note?: string }): Promise<JsonValue>;
export declare function mcp0_create_item(options: { collection: string; data: JsonRecord }): Promise<JsonValue>;
export declare function mcp0_create_project(options: { directory: string; projectType: string; root?: string; template?: string; empty?: boolean; platform?: string[] }): Promise<JsonValue>;
export declare function mcp0_create_relationship(options: { type: 'o2o' | 'o2m' | 'm2o' | 'm2m' | 'm2a'; collection: string; field: string; related_collection?: string; related_field?: string; junction_collection?: string; junction_field?: string; related_junction_field?: string; sort_field?: string; on_delete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'; on_update?: 'CASCADE' | 'SET NULL' | 'RESTRICT'; collection_field?: string; primary_key_field?: string; allowed_collections?: string[] }): Promise<JsonValue>;
export declare function mcp0_dart_fix(options: { roots: Array<{ root: string }> }): Promise<JsonValue>;
export declare function mcp0_dart_format(options: { roots: Array<{ root: string; paths?: string[] }> }): Promise<JsonValue>;
export declare function mcp0_delete_collection(options: { collection: string; confirm: boolean }): Promise<JsonValue>;
export declare function mcp0_delete_field(options: { collection: string; field: string; confirm: boolean }): Promise<JsonValue>;
export declare function mcp0_delete_items(options: { collection: string; ids: Array<string | number>; confirm: boolean; cascadeDelete?: boolean }): Promise<JsonValue>;
export declare function mcp0_diagnose_collection_access(options: { collection: string; includeFields?: boolean; includeRelations?: boolean; includePermissions?: boolean }): Promise<JsonValue>;
export declare function mcp0_get_active_location(options: JsonRecord): Promise<JsonValue>;
export declare function mcp0_get_collection_items(options: { collection: string; fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp0_get_collection_schema(options: { collection: string }): Promise<JsonValue>;
export declare function mcp0_get_files(options: { fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp0_get_flows(options: { fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp0_get_runtime_errors(options: { clearRuntimeErrors?: boolean }): Promise<JsonValue>;
export declare function mcp0_get_selected_widget(options: JsonRecord): Promise<JsonValue>;
export declare function mcp0_get_user(options: { id: string; fields?: string[] }): Promise<JsonValue>;
export declare function mcp0_get_users(options: { fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp0_get_widget_tree(options: JsonRecord): Promise<JsonValue>;
export declare function mcp0_hot_reload(options: { clearRuntimeErrors?: boolean }): Promise<JsonValue>;
export declare function mcp0_hover(options: { uri: string; line: number; column: number }): Promise<JsonValue>;
export declare function mcp0_list_collections(options: { include_system?: boolean }): Promise<JsonValue>;
export declare function mcp0_pub(options: { command: string; packageName?: string; roots?: Array<{ root: string }> }): Promise<JsonValue>;
export declare function mcp0_pub_dev_search(options: { query: string }): Promise<JsonValue>;
export declare function mcp0_refresh_collection_cache(options: { collection?: string }): Promise<JsonValue>;
export declare function mcp0_remove_roots(options: { uris: string[] }): Promise<JsonValue>;
export declare function mcp0_resolve_workspace_symbol(options: { query: string }): Promise<JsonValue>;
export declare function mcp0_run_tests(options: { roots: Array<{ root: string; paths?: string[] }>; testRunnerArgs?: JsonRecord }): Promise<JsonValue>;
export declare function mcp0_set_widget_selection_mode(options: { enabled: boolean }): Promise<JsonValue>;
export declare function mcp0_signature_help(options: { uri: string; line: number; column: number }): Promise<JsonValue>;
export declare function mcp0_update_field(options: { collection: string; field: string; type?: string; interface?: string; options?: JsonRecord; required?: boolean; unique?: boolean; validation?: JsonRecord; default_value?: JsonValue; note?: string }): Promise<JsonValue>;
export declare function mcp0_update_item(options: { collection: string; id: string | number; data: JsonRecord }): Promise<JsonValue>;
export declare function mcp0_validate_collection_creation(options: { collection: string; waitTime?: number }): Promise<JsonValue>;
export declare function mcp0_validate_collection_schema(options: { collection: string; strict?: boolean }): Promise<JsonValue>;

// Filesystem MCP server tools
export declare function mcp1_create_directory(options: { path: string }): Promise<JsonValue>;
export declare function mcp1_directory_tree(options: { path: string }): Promise<JsonValue>;
export declare function mcp1_edit_file(options: { path: string; edits: Array<{ oldText: string; newText: string }>; dryRun?: boolean }): Promise<JsonValue>;
export declare function mcp1_get_file_info(options: { path: string }): Promise<JsonValue>;
export declare function mcp1_list_allowed_directories(options: Record<string, never>): Promise<JsonValue>;
export declare function mcp1_list_directory(options: { path: string }): Promise<JsonValue>;
export declare function mcp1_list_directory_with_sizes(options: { path: string; sortBy?: 'name' | 'size' }): Promise<JsonValue>;
export declare function mcp1_move_file(options: { source: string; destination: string }): Promise<JsonValue>;
export declare function mcp1_read_file(options: { path: string; head?: number; tail?: number }): Promise<JsonValue>;
export declare function mcp1_read_media_file(options: { path: string }): Promise<JsonValue>;
export declare function mcp1_read_multiple_files(options: { paths: string[] }): Promise<JsonValue>;
export declare function mcp1_read_text_file(options: { path: string; head?: number; tail?: number }): Promise<JsonValue>;
export declare function mcp1_search_files(options: { path: string; pattern: string; excludePatterns?: string[] }): Promise<JsonValue>;
export declare function mcp1_write_file(options: { path: string; content: string }): Promise<JsonValue>;

// Keyprog-Directus MCP server tools
export declare function mcp2_analyze_collection_schema(options: { collection: string; includeRelations?: boolean; validateConstraints?: boolean }): Promise<JsonValue>;
export declare function mcp2_analyze_relationships(options: { collection?: string; includeSystemCollections?: boolean }): Promise<JsonValue>;
export declare function mcp2_bulk_operations(options: { collection: string; operations: JsonRecordArray; validate?: boolean }): Promise<JsonValue>;
export declare function mcp2_create_collection(options: { collection: string; fields?: JsonRecordArray; meta?: JsonRecord }): Promise<JsonValue>;
export declare function mcp2_create_field(options: { collection: string; field: string; type: string; interface?: string; options?: JsonRecord; required?: boolean; unique?: boolean; validation?: JsonRecord; default_value?: JsonValue; note?: string }): Promise<JsonValue>;
export declare function mcp2_create_item(options: { collection: string; data: JsonRecord }): Promise<JsonValue>;
export declare function mcp2_create_relationship(options: { type: 'o2o' | 'o2m' | 'm2o' | 'm2m' | 'm2a'; collection: string; field: string; related_collection?: string; related_field?: string; junction_collection?: string; junction_field?: string; related_junction_field?: string; sort_field?: string; on_delete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'; on_update?: 'CASCADE' | 'SET NULL' | 'RESTRICT'; collection_field?: string; primary_key_field?: string; allowed_collections?: string[] }): Promise<JsonValue>;
export declare function mcp2_delete_collection(options: { collection: string; confirm: boolean }): Promise<JsonValue>;
export declare function mcp2_delete_field(options: { collection: string; field: string; confirm: boolean }): Promise<JsonValue>;
export declare function mcp2_delete_items(options: { collection: string; ids: Array<string | number>; confirm: boolean; cascadeDelete?: boolean }): Promise<JsonValue>;
export declare function mcp2_diagnose_collection_access(options: { collection: string; includeFields?: boolean; includeRelations?: boolean; includePermissions?: boolean }): Promise<JsonValue>;
export declare function mcp2_get_collection_items(options: { collection: string; fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp2_get_collection_schema(options: { collection: string }): Promise<JsonValue>;
export declare function mcp2_get_files(options: { fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp2_get_flows(options: { fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp2_get_user(options: { id: string; fields?: string[] }): Promise<JsonValue>;
export declare function mcp2_get_users(options: { fields?: string[]; filter?: JsonRecord; limit?: number; offset?: number; search?: string; sort?: string[] }): Promise<JsonValue>;
export declare function mcp2_list_collections(options: { include_system?: boolean }): Promise<JsonValue>;
export declare function mcp2_refresh_collection_cache(options: { collection?: string }): Promise<JsonValue>;
export declare function mcp2_update_field(options: { collection: string; field: string; type?: string; interface?: string; options?: JsonRecord; required?: boolean; unique?: boolean; validation?: JsonRecord; default_value?: JsonValue; note?: string }): Promise<JsonValue>;
export declare function mcp2_update_item(options: { collection: string; id: string | number; data: JsonRecord }): Promise<JsonValue>;
export declare function mcp2_validate_collection_creation(options: { collection: string; waitTime?: number }): Promise<JsonValue>;
export declare function mcp2_validate_collection_schema(options: { collection: string; strict?: boolean }): Promise<JsonValue>;