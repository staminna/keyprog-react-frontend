/**
 * Content Utilities
 * Shared utility functions for content handling
 */

/**
 * Safely get a nested property from an object
 * @param obj The object to get the property from
 * @param path The path to the property (e.g., 'user.profile.name')
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function getNestedProperty<T>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
  defaultValue: T
): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined && current !== null ? current as T : defaultValue;
}

/**
 * Safely set a nested property on an object
 * @param obj The object to set the property on
 * @param path The path to the property (e.g., 'user.profile.name')
 * @param value The value to set
 * @returns A new object with the property set
 */
export function setNestedProperty<T>(
  obj: Record<string, unknown>,
  path: string,
  value: T
): Record<string, unknown> {
  const result = { ...obj };
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return result;
  
  let current: any = result;
  
  // Navigate to the parent object
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Set the value on the parent object
  current[lastKey] = value;
  
  return result;
}

/**
 * Safely merge two objects
 * @param target The target object
 * @param source The source object
 * @returns A new object with the source merged into the target
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      // If both values are objects, merge them recursively
      if (
        sourceValue !== null &&
        targetValue !== null &&
        typeof sourceValue === 'object' &&
        typeof targetValue === 'object' &&
        !Array.isArray(sourceValue) &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as any;
      } else {
        // Otherwise, use the source value
        result[key] = sourceValue as any;
      }
    }
  }
  
  return result;
}

/**
 * Remove empty values from an object
 * @param obj The object to clean
 * @returns A new object without empty values
 */
export function removeEmptyValues<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      // Skip null and undefined values
      if (value === null || value === undefined) {
        continue;
      }
      
      // Recursively clean objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleaned = removeEmptyValues(value as Record<string, unknown>);
        
        // Only add non-empty objects
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned as any;
        }
      } else if (Array.isArray(value)) {
        // Filter out empty values from arrays
        const filteredArray = value.filter(item => item !== null && item !== undefined);
        
        // Only add non-empty arrays
        if (filteredArray.length > 0) {
          result[key] = filteredArray as any;
        }
      } else if (typeof value === 'string') {
        // Only add non-empty strings
        if (value.trim() !== '') {
          result[key] = value as any;
        }
      } else {
        // Add all other values
        result[key] = value as any;
      }
    }
  }
  
  return result;
}

/**
 * Format a date string
 * @param dateString The date string to format
 * @param format The format to use (default: 'dd/MM/yyyy')
 * @returns The formatted date string
 */
export function formatDate(dateString: string, format = 'dd/MM/yyyy'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format the date
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year.toString())
      .replace('yy', year.toString().slice(-2));
  } catch (error) {
    return dateString;
  }
}

/**
 * Truncate a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @param suffix The suffix to add if truncated (default: '...')
 * @returns The truncated string
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert a string to kebab case
 * @param str The string to convert
 * @returns The kebab case string
 */
export function toKebabCase(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .toLowerCase();
}

/**
 * Convert a string to camel case
 * @param str The string to convert
 * @returns The camel case string
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '') // Convert kebab-case and snake_case to camelCase
    .replace(/^(.)/, (c) => c.toLowerCase()); // Ensure first character is lowercase
}

export default {
  getNestedProperty,
  setNestedProperty,
  deepMerge,
  removeEmptyValues,
  formatDate,
  truncate,
  toKebabCase,
  toCamelCase
};
