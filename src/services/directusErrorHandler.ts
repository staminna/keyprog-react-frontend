/**
 * DirectusErrorHandler
 * Utility functions for handling Directus API errors
 */

// Error types
export enum DirectusErrorType {
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

// Error interface
export interface DirectusError {
  type: DirectusErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
}

/**
 * Parse Directus API error to get more specific information
 * @param error The error from Directus API
 * @returns Parsed error with type and message
 */
export function parseDirectusError(error: unknown): DirectusError {
  // Default error
  const defaultError: DirectusError = {
    type: DirectusErrorType.UNKNOWN,
    message: 'Unknown error occurred'
  };
  
  // If error is not an object, return default
  if (!error || typeof error !== 'object') {
    return defaultError;
  }
  
  // Try to extract error information
  const typedError = error as { 
    response?: { status?: number; statusText?: string; data?: { errors?: Array<{ message: string }> } };
    message?: string;
  };
  
  // Extract status code if available
  const statusCode = typedError.response?.status;
  
  // Determine error type based on status code
  if (statusCode === 401) {
    return {
      type: DirectusErrorType.AUTHENTICATION,
      message: 'Authentication failed. Please log in again.',
      originalError: error,
      statusCode
    };
  }
  
  if (statusCode === 403) {
    return {
      type: DirectusErrorType.PERMISSION,
      message: 'You do not have permission to access this resource.',
      originalError: error,
      statusCode
    };
  }
  
  if (statusCode === 404) {
    return {
      type: DirectusErrorType.NOT_FOUND,
      message: 'The requested resource was not found.',
      originalError: error,
      statusCode
    };
  }
  
  // Network errors don't have status codes
  if (typedError.message?.includes('network') || typedError.message?.includes('ECONNREFUSED')) {
    return {
      type: DirectusErrorType.NETWORK,
      message: 'Network error. Please check your connection.',
      originalError: error
    };
  }
  
  // Extract error message if available
  const errorMessage = typedError.response?.data?.errors?.[0]?.message || 
                      typedError.message || 
                      'Unknown error occurred';
  
  return {
    type: DirectusErrorType.UNKNOWN,
    message: errorMessage,
    originalError: error,
    statusCode
  };
}

/**
 * Log Directus error with appropriate level and format
 * @param error The parsed Directus error
 * @param context Additional context information
 */
export function logDirectusError(error: DirectusError, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : '';
  
  // Suppress 403/404 errors for missing collections/items to reduce console noise
  const is403or404 = error.statusCode === 403 || error.statusCode === 404 || 
                     error.message.includes('Forbidden') || 
                     error.message.includes('do not have permission');
  
  if (is403or404 && (error.type === DirectusErrorType.PERMISSION || error.type === DirectusErrorType.NOT_FOUND)) {
    // Silently ignore - these are expected for missing pages/collections
    return;
  }
  
  switch (error.type) {
    case DirectusErrorType.AUTHENTICATION:
      console.warn(`${contextPrefix}Authentication error: ${error.message}`);
      break;
    case DirectusErrorType.PERMISSION:
      console.warn(`${contextPrefix}Permission error: ${error.message}`);
      break;
    case DirectusErrorType.NOT_FOUND:
      console.info(`${contextPrefix}Not found: ${error.message}`);
      break;
    case DirectusErrorType.NETWORK:
      console.error(`${contextPrefix}Network error: ${error.message}`);
      break;
    default:
      console.error(`${contextPrefix}Error: ${error.message}`, error.originalError);
  }
}

/**
 * Determine if an error should be shown to the user
 * @param error The parsed Directus error
 * @returns Whether the error should be shown to the user
 */
export function shouldShowToUser(error: DirectusError): boolean {
  // Don't show not found errors to users
  if (error.type === DirectusErrorType.NOT_FOUND) {
    return false;
  }
  
  // Don't show permission errors to users (handled by fallbacks)
  if (error.type === DirectusErrorType.PERMISSION) {
    return false;
  }
  
  // Show authentication errors to users
  if (error.type === DirectusErrorType.AUTHENTICATION) {
    return true;
  }
  
  // Show network errors to users
  if (error.type === DirectusErrorType.NETWORK) {
    return true;
  }
  
  // For unknown errors, only show if they're critical
  return error.statusCode ? error.statusCode >= 500 : false;
}

export default {
  parseDirectusError,
  logDirectusError,
  shouldShowToUser,
  DirectusErrorType
};
