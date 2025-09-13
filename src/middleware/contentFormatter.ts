import { formatContentForDisplay, cleanContentForSaving } from '@/utils/contentParserV2';

/**
 * Content Formatter Middleware
 * This middleware intercepts API responses and requests to ensure content is properly formatted
 */
export class ContentFormatter {
  /**
   * Process API response to format content for display
   * @param response The API response to process
   * @returns Processed response with formatted content
   */
  static processResponse<T>(response: T): T {
    if (!response) return response;
    
    // Handle array responses
    if (Array.isArray(response)) {
      return response.map(item => this.processItem(item)) as unknown as T;
    }
    
    // Handle single item responses
    return this.processItem(response);
  }
  
  /**
   * Process a single item to format its content
   * @param item The item to process
   * @returns Processed item with formatted content
   */
  static processItem<T>(item: T): T {
    if (!item || typeof item !== 'object') return item;
    
    const processedItem = { ...item };
    
    // Process each field in the item
    Object.keys(processedItem).forEach(key => {
      const value = processedItem[key];
      
      // Skip null or undefined values
      if (value === null || value === undefined) return;
      
      // Process string values that might contain doc(paragraph(...)) syntax
      if (typeof value === 'string' && (value.includes('doc(') || value.includes('paragraph('))) {
        processedItem[key] = formatContentForDisplay(value);
      }
      
      // Recursively process nested objects
      if (typeof value === 'object' && value !== null) {
        processedItem[key] = this.processResponse(value);
      }
    });
    
    return processedItem;
  }
  
  /**
   * Process API request to clean content before saving
   * @param request The API request to process
   * @returns Processed request with cleaned content
   */
  static processRequest<T>(request: T): T {
    if (!request) return request;
    
    // Handle array requests
    if (Array.isArray(request)) {
      return request.map(item => this.cleanItem(item)) as unknown as T;
    }
    
    // Handle single item requests
    return this.cleanItem(request);
  }
  
  /**
   * Clean a single item's content before saving
   * @param item The item to clean
   * @returns Cleaned item
   */
  static cleanItem<T>(item: T): T {
    if (!item || typeof item !== 'object') return item;
    
    const cleanedItem = { ...item };
    
    // Clean each field in the item
    Object.keys(cleanedItem).forEach(key => {
      const value = cleanedItem[key];
      
      // Skip null or undefined values
      if (value === null || value === undefined) return;
      
      // Clean string values that might contain doc(paragraph(...)) syntax
      if (typeof value === 'string' && (value.includes('doc(') || value.includes('paragraph('))) {
        cleanedItem[key] = cleanContentForSaving(value);
      }
      
      // Recursively clean nested objects
      if (typeof value === 'object' && value !== null) {
        cleanedItem[key] = this.processRequest(value);
      }
    });
    
    return cleanedItem;
  }
}

export default ContentFormatter;
