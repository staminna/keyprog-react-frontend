import { DirectusService } from './directusService';
import { DirectusServiceExtension } from './directusServiceExtension';
import type { DirectusContactInfo } from '@/lib/directus';

/**
 * Service for handling contact information with improved error handling
 * and bidirectional synchronization between different collections
 */
export class ContactService {
  /**
   * Get contact information with fallbacks and error handling
   */
  static async getContactInfo(): Promise<DirectusContactInfo> {
    try {
      // First try to get from contact_info singleton
      try {
        const contactInfo = await DirectusService.getContactInfo();
        return contactInfo;
      } catch (singletonError) {
        console.warn('Error getting contact_info singleton:', singletonError);
        
        // Try to get from hero collection
        try {
          const hero = await DirectusServiceExtension.getCollectionItemSafe('hero', 1);
          
          // Extract contact-related fields from hero collection
          const heroRecord = hero as Record<string, unknown>;
          
          const extractedInfo: DirectusContactInfo = {
            id: 'contact_info',
            title: typeof heroRecord.contact_title === 'string' ? heroRecord.contact_title : 'Contact Us',
            email: typeof heroRecord.contact_email === 'string' ? heroRecord.contact_email : '',
            phone: typeof heroRecord.contact_phone === 'string' ? heroRecord.contact_phone : '',
            chat_hours: typeof heroRecord.contact_hours === 'string' ? heroRecord.contact_hours : '',
            contact_form_text: typeof heroRecord.contact_form_text === 'string' ? heroRecord.contact_form_text : 'Contact Form',
            contact_form_link: typeof heroRecord.contact_form_link === 'string' ? heroRecord.contact_form_link : '/contact'
          };
          
          return extractedInfo;
        } catch (settingsError) {
          console.warn('Error getting settings as fallback:', settingsError);
          
          // Try to get from contacts collection
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
                contact_form_link: '/contact'
              };
            }
          } catch (contactsError) {
            console.warn('Error getting contacts as fallback:', contactsError);
          }
        }
      }
      
      // If all else fails, return default values
      return {
        id: 'contact_info',
        title: 'Contact Us',
        email: 'contact@example.com',
        phone: '+351 964 463 161',
        chat_hours: 'Seg-Sex: 9h-18h',
        contact_form_text: 'Contact Form',
        contact_form_link: '/contact'
      };
    } catch (error) {
      console.error('Error in getContactInfo:', error);
      
      // Return default values on error
      return {
        id: 'contact_info',
        title: 'Contact Us',
        email: 'contact@example.com',
        phone: '+351 964 463 161',
        chat_hours: 'Seg-Sex: 9h-18h',
        contact_form_text: 'Contact Form',
        contact_form_link: '/contact'
      };
    }
  }
  
  /**
   * Update contact information with bidirectional synchronization
   * Updates both contact_info singleton and settings
   */
  static async updateContactInfo(data: Partial<DirectusContactInfo>): Promise<boolean> {
    try {
      // Track success of each update attempt
      let anySuccess = false;
      
      // Try to update contact_info singleton
      try {
        await DirectusServiceExtension.updateField('contact_info', 'contact_info', 'title', data.title);
        await DirectusServiceExtension.updateField('contact_info', 'contact_info', 'email', data.email);
        await DirectusServiceExtension.updateField('contact_info', 'contact_info', 'phone', data.phone);
        await DirectusServiceExtension.updateField('contact_info', 'contact_info', 'chat_hours', data.chat_hours);
        anySuccess = true;
      } catch (singletonError) {
        console.warn('Error updating contact_info singleton:', singletonError);
      }
      
      // Also update hero collection
      try {
        const heroData: Record<string, unknown> = {};
        if (data.title) heroData['contact_title'] = data.title;
        if (data.email) heroData['contact_email'] = data.email;
        if (data.phone) heroData['contact_phone'] = data.phone;
        if (data.chat_hours) heroData['contact_hours'] = data.chat_hours;
        if (data.contact_form_text) heroData['contact_form_text'] = data.contact_form_text;
        if (data.contact_form_link) heroData['contact_form_link'] = data.contact_form_link;
        
        await DirectusServiceExtension.updateCollectionItemSafe('hero', 1, heroData);
        anySuccess = true;
      } catch (heroError) {
        console.warn('Error updating hero collection:', heroError);
      }
      
      // Also update the first contact in contacts collection if it exists
      try {
        const contacts = await DirectusService.getContacts();
        if (contacts && contacts.length > 0) {
          const contactData: Record<string, unknown> = {};
          if (data.email) contactData.email = data.email;
          if (data.phone) contactData.phone = data.phone;
          
          await DirectusService.updateCollectionItem('contacts', contacts[0].id, contactData);
          anySuccess = true;
        }
      } catch (contactsError) {
        console.warn('Error updating contacts collection:', contactsError);
      }
      
      return anySuccess;
    } catch (error) {
      console.error('Error updating contact info:', error);
      return false;
    }
  }
  
  /**
   * Update a specific contact field with immediate two-way binding
   * Optimized for direct updates without auto-refresh
   */
  static async updateContactField(field: string, value: unknown): Promise<boolean> {
    try {
      // Map field to hero collection field if needed
      const heroField = 
        field === 'title' ? 'contact_title' :
        field === 'email' ? 'contact_email' :
        field === 'phone' ? 'contact_phone' :
        field === 'chat_hours' ? 'contact_hours' :
        field;
      
      // Try direct API update first for immediate response
      if (field === 'phone' || field === 'email') {
        try {
          // Direct API call for immediate update to hero collection
          const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
          const endpoint = `${directusUrl}/items/hero/1`;
          
          const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
            },
            body: JSON.stringify({
              contact_phone: value,
              phone: value
            })
          });
          
          if (response.ok) {
            console.log(`Successfully updated phone number using direct API call`);
            
            // After successful direct update, update other collections in background
            this.updateOtherCollections(field, value);
            
            return true;
          }
        } catch (directError) {
          console.warn(`Direct API update for ${field} failed:`, directError);
          // Continue with standard methods if direct update fails
        }
      }
      
      // Standard update through DirectusService for most fields
      try {
        // Update hero collection first (most reliable)
        await DirectusServiceExtension.updateCollectionItemSafe('hero', 1, { [heroField]: value });
        console.log(`Successfully updated ${heroField} in hero collection`);
        
        // Update other collections in background
        this.updateOtherCollections(field, value);
        
        return true;
      } catch (heroError) {
        console.warn(`Error updating ${heroField} in hero collection:`, heroError);
        
        // Try contact_info singleton as fallback
        try {
          await DirectusServiceExtension.updateField('contact_info', 'contact_info', field, value);
          console.log(`Successfully updated ${field} in contact_info singleton`);
          
          // Update other collections in background
          this.updateOtherCollections(field, value);
          
          return true;
        } catch (singletonError) {
          console.warn(`Error updating ${field} in contact_info singleton:`, singletonError);
          
          // Last resort for critical fields
          if (field === 'phone' || field === 'email') {
            try {
              const contacts = await DirectusService.getContacts();
              if (contacts && contacts.length > 0) {
                await DirectusService.updateCollectionItem('contacts', contacts[0].id, { [field]: value });
                console.log(`Successfully updated ${field} in contacts collection`);
                return true;
              }
            } catch (contactsError) {
              console.warn(`Error updating ${field} in contacts collection:`, contactsError);
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating contact field ${field}:`, error);
      return false;
    }
  }
  
  /**
   * Update other collections in background after primary update succeeds
   * This ensures immediate UI feedback while still maintaining data consistency
   */
  private static updateOtherCollections(field: string, value: unknown): void {
    // Don't await these updates to keep the UI responsive
    setTimeout(async () => {
      try {
        // Update contact_info singleton
        try {
          await DirectusServiceExtension.updateField('contact_info', 'contact_info', field, value);
          console.log(`Background update: ${field} in contact_info singleton`);
        } catch (error) {
          console.warn(`Background update failed for ${field} in contact_info:`, error);
        }
        
        // For email and phone, also update contacts collection
        if (field === 'email' || field === 'phone') {
          try {
            const contacts = await DirectusService.getContacts();
            if (contacts && contacts.length > 0) {
              await DirectusService.updateCollectionItem('contacts', contacts[0].id, { [field]: value });
              console.log(`Background update: ${field} in contacts collection`);
            }
          } catch (error) {
            console.warn(`Background update failed for ${field} in contacts:`, error);
          }
        }
        
        // For phone, update site_settings if it exists
        if (field === 'phone') {
          try {
            await DirectusServiceExtension.updateField('site_settings', 'site_settings', 'phone', value);
            console.log(`Background update: phone in site_settings`);
          } catch (error) {
            // Silently fail for site_settings as it's optional
          }
        }
      } catch (error) {
        console.warn('Background updates failed:', error);
      }
    }, 100); // Small delay to ensure primary update completes first
  }
}

export default ContactService;
