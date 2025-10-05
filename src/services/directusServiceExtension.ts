import { DirectusService } from './directusService';
import { DirectusServiceWrapper } from './directusServiceWrapper';
import { type DirectusSettings } from '@/lib/directus';
import { formatContentForDisplay, cleanContentForSaving } from '@/utils/contentParserV2';

// Define collection existence mapping
const COLLECTION_EXISTS: Record<string, boolean> = {
  'hero': false,      // Hero is a singleton collection
  'contact_info': false, // Contact info is a singleton
  'services': true,   // Services is a regular collection
  'pages': true,      // Pages is a regular collection
  'blog_posts': true, // Blog posts is a regular collection
  'news': true,       // News is a regular collection
  'header_menu': true, // Header menu items
  'footer_menu': true, // Footer menu items
  'sub_menu_content': true, // Submenu content items
  'contacts': true,   // Contacts collection
  'categories': true, // Categories collection
  'products': true,   // Products collection
  'orders': true,     // Orders collection
  'customers': true   // Customers collection
};

// Define menu collection mapping
const MENU_COLLECTIONS = ['header_menu', 'footer_menu', 'sub_menu_content'];

/**
 * Extension to DirectusService with improved permission handling
 * This class adds methods to handle collection permissions properly
 */
export class DirectusServiceExtension {
  /**
   * Check if a collection exists and is a regular collection (not a singleton)
   */
  static collectionExists(collection: string): boolean {
    return COLLECTION_EXISTS[collection] ?? true; // Default to true if unknown
  }
  
  /**
   * Check if a collection is a singleton
   */
  static isSingleton(collection: string): boolean {
    // A collection is considered a singleton if its value in COLLECTION_EXISTS is false.
    return COLLECTION_EXISTS[collection] === false;
  }
  
  /**
   * Update a collection item with permission handling
   * This method ensures we use the correct client and handles permission errors
   */
  static async updateCollectionItemSafe(
    collection: string, 
    id: string | number, 
    data: Record<string, unknown>,
    fallbackCollection?: string
  ): Promise<Record<string, unknown>> {
    try {
      // Check if this is a singleton collection
      if (this.isSingleton(collection)) {
        // For singletons, use updateHero method from DirectusServiceWrapper
        console.log(`${collection} is a singleton, using updateHero instead`);
        try {
          // Clean data before saving to remove doc(paragraph(...)) syntax
          const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              acc[key] = cleanContentForSaving(value);
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, unknown>);
          
          return await DirectusServiceWrapper.updateHero(cleanedData) as Record<string, unknown>;
        } catch (singletonError) {
          console.error(`Error updating singleton ${collection}:`, singletonError);
          throw singletonError;
        }
      }
      
      // For regular collections, use updateItem with content formatting
      // Clean data before saving to remove doc(paragraph(...)) syntax
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = cleanContentForSaving(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);
      
      return await DirectusServiceWrapper.updateCollectionItem(collection, id, cleanedData);
    } catch (error: unknown) {
      const typedError = error as { response?: { status?: number }; message?: string };
      
      // If we get a 403 Forbidden error and have a fallback collection
      if (typedError?.response?.status === 403 && fallbackCollection) {
        console.log(`Permission denied for ${collection}, trying fallback collection ${fallbackCollection}`);
        
        // Try to update the fallback collection instead with content formatting
        // Clean data before saving
        const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            acc[key] = cleanContentForSaving(value);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, unknown>);
        
        return await DirectusServiceWrapper.updateCollectionItem(fallbackCollection, id, cleanedData);
      }
      
      // If we get a 404 Not Found error, the collection might not exist
      if (typedError?.response?.status === 404 || typedError?.message?.includes("doesn't exist")) {
        console.log(`Collection ${collection} not found`);
        throw error;
      }
      
      // Re-throw the error if we can't handle it
      throw error;
    }
  }

  /**
   * Get a collection item with permission handling
   * This method tries multiple collections if needed
   */
  static async getCollectionItemSafe(
    collection: string, 
    id: string | number,
    fallbackCollection?: string
  ): Promise<Record<string, unknown>> {
    try {
      // Check if this is a singleton collection
      if (this.isSingleton(collection)) {
        // For singletons, use getHero method from DirectusServiceWrapper
        // Removed excessive logging to reduce console noise
        return await DirectusServiceWrapper.getHero() as Record<string, unknown>;
      }
      
      // For regular collections, use getCollectionItem with content formatting
      return await DirectusServiceWrapper.getCollectionItem(collection, id);
    } catch (error: unknown) {
      const typedError = error as { response?: { status?: number }; message?: string };
      
      // If we get a 403 Forbidden error and have a fallback collection
      if ((typedError?.response?.status === 403) && fallbackCollection) {
        console.log(`Permission denied for ${collection}, trying fallback collection ${fallbackCollection}`);
        
        // Try to get from the fallback collection instead with content formatting
        return await DirectusServiceWrapper.getCollectionItem(fallbackCollection, id);
      }
      
      // If we get a 404 Not Found error, the collection might not exist
      if (typedError?.response?.status === 404 || typedError?.message?.includes("doesn't exist")) {
        console.log(`Collection ${collection} not found`);
        throw error;
      }
      
      // Re-throw the error if we can't handle it
      throw error;
    }
  }

  /**
   * Check if a collection is a menu collection
   */
  static isMenuCollection(collection: string): boolean {
    return MENU_COLLECTIONS.includes(collection);
  }
  
  /**
   * Map a field from one collection to another
   * This is useful when we need to update a field in a different collection
   */
  static mapField(collection: string, field: string): { collection: string, field: string } {
    // No field mappings needed since settings collection is removed
    // Return the original collection and field
    return { collection, field };
  }
  
  /**
   * Get menu items with permission handling
   * @param collection Menu collection name
   * @returns Array of menu items
   */
  static async getMenuItems(collection: string): Promise<Record<string, unknown>[]> {
    if (!this.isMenuCollection(collection)) {
      throw new Error(`${collection} is not a menu collection`);
    }
    
    try {
      // Get all items for this collection
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}?sort=sort`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load ${collection} items`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error loading ${collection} items:`, error);
      throw error;
    }
  }
  
  /**
   * Create a menu item with permission handling
   * @param collection Menu collection name
   * @param data Item data
   * @returns Created item
   */
  static async createMenuItem(
    collection: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.isMenuCollection(collection)) {
      throw new Error(`${collection} is not a menu collection`);
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create ${collection} item`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Failed to create ${collection} item:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a menu item with permission handling
   * @param collection Menu collection name
   * @param id Item ID
   */
  static async deleteMenuItem(collection: string, id: string): Promise<void> {
    if (!this.isMenuCollection(collection)) {
      throw new Error(`${collection} is not a menu collection`);
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${collection} item`);
      }
    } catch (error) {
      console.error(`Failed to delete ${collection} item:`, error);
      throw error;
    }
  }

  /**
   * Create an item in a collection with permission handling
   * @param collection Collection name
   * @param data Item data
   * @returns Created item
   */
  static async createItem(
    collection: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      // Clean data before saving to remove doc(paragraph(...)) syntax
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = cleanContentForSaving(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create ${collection} item`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Failed to create ${collection} item:`, error);
      throw error;
    }
  }
  
  /**
   * Update a specific field in a collection with permission handling
   * This method maps the field to the correct collection if needed
   */
  static async updateField(
    collection: string,
    id: string | number,
    field: string,
    value: unknown
  ): Promise<Record<string, unknown>> {
    console.log('DirectusServiceExtension.updateField called with:', {
      collection,
      id,
      field,
      value
    });
    
    // Map the field to the correct collection if needed
    const { collection: mappedCollection, field: mappedField } = this.mapField(collection, field);
    console.log('Mapped to:', { mappedCollection, mappedField });
    
    // Create the data object with the mapped field
    const data = { [mappedField]: value };
    
    // Check if this is a singleton collection
    if (this.isSingleton(mappedCollection)) {
      console.log(`${mappedCollection} is a singleton, but settings collection removed. Using regular collection update.`);
      // Fall through to regular collection handling since settings is removed
    }
    
    // For regular collections, use updateCollectionItemSafe
    return this.updateCollectionItemSafe(
      mappedCollection,
      id,
      data,
      collection !== mappedCollection ? collection : undefined
    );
  }
  
  /**
   * Get contact information with bidirectional support
   * This method tries multiple collections to find contact information
   */
  static async getContactInfo(): Promise<Record<string, unknown>> {
    try {
      // Try to get from contact_info collection first
      try {
        const contactInfo = await this.getCollectionItemSafe('contact_info', 1);
        return contactInfo;
      } catch (contactError) {
        console.error('Error getting contact_info collection:', contactError);
        
        // Try to get from contacts collection as fallback
        try {
          const contacts = await DirectusService.getContacts();
          if (contacts && contacts.length > 0) {
            const contact = contacts[0];
            return {
              id: contact.id,
              title: 'Contact Us',
              email: contact.email || '',
              phone: contact.phone || '',
              chat_hours: '',
              contact_form_text: 'Contact Form',
              contact_form_link: '/contact',
              // Use custom fields if available
              address: ((contact as unknown) as {address?: string}).address || '',
              website: ''
            };
          }
        } catch (contactsError) {
          console.error('Error getting contacts as fallback:', contactsError);
        }
        
        // If all else fails, return default values
        return {
          id: '1',
          title: 'Contact Us',
          email: 'contact@example.com',
          phone: '',
          chat_hours: '',
          contact_form_text: 'Contact Form',
          contact_form_link: '/contact'
        };
      }
    } catch (error) {
      console.error('Error in getContactInfo:', error);
      throw error;
    }
  }
  
  /**
   * Update contact information with bidirectional support
   * This method tries multiple collections to update contact information
   */
  static async updateContactInfo(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Map contact data to hero collection fields
      const heroData: Record<string, unknown> = {};
      if (data.title) heroData.contact_title = data.title;
      if (data.email) heroData.contact_email = data.email;
      if (data.phone) heroData.contact_phone = data.phone;
      if (data.chat_hours) heroData.contact_hours = data.chat_hours;
      if (data.contact_form_text) heroData.contact_form_text = data.contact_form_text;
      if (data.contact_form_link) heroData.contact_form_link = data.contact_form_link;
      if (data.address) heroData.contact_address = data.address;
      
      // Update hero collection
      await this.updateCollectionItemSafe('hero', 1, heroData);
      
      // Also update the first contact in contacts collection if it exists
      try {
        const contacts = await DirectusService.getContacts();
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          const contactData: Record<string, unknown> = {};
          if (data.email) contactData.email = data.email;
          if (data.phone) contactData.phone = data.phone;
          if (data.address) contactData.address = data.address;
          
          await DirectusService.updateCollectionItem('contacts', contact.id, contactData);
        }
      } catch (contactsError) {
        console.warn('Could not update contacts collection:', contactsError);
        // Continue even if contacts update fails
      }
      
      // Return the updated data
      return await this.getContactInfo();
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  }
}
