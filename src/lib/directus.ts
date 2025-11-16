import { createDirectus, rest, readItems, readItem, readSingleton, updateSingleton, updateItem, createItem, authentication, staticToken } from '@directus/sdk';

interface DirectusSettings {
  site_title?: string;
  site_description?: string;
  logo?: string;
}

interface DirectusPages {
  id: string;
  title?: string;
  slug?: string;
  content?: Record<string, unknown>;
}

interface DirectusHeaderMenu {
  id: string;
  title?: string;
  link?: string;
  status?: 'draft' | 'published' | 'archived';
  sort?: number;
  sub_menu?: Array<{
    title: string;
    link: string;
    status?: 'draft' | 'published' | 'archived';
    target?: string;
  }>;
}

interface DirectusFooterMenu {
  id: string;
  title?: string;
  links?: Array<{
    title: string;
    url: string;
  }>;
}

interface DirectusServices {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  content?: string;
  image?: string;
  category?: string;
  features?: string | string[];
  price?: number;
  status?: string;
  sort?: number;
}

interface DirectusCategories {
  id: string;
  title?: string;
  image?: string;
  slug?: string;
}

interface DirectusNews {
  id: string;
  title?: string;
  content?: string;
  image?: string;
  published_date?: string;
  summary?: string;
  category?: string;
  tags?: string | string[];
  author?: string;
  status?: string;
}

interface DirectusContacts {
  id: string;
  email?: string;
  phone?: string;
}

interface DirectusContactInfo {
  id: string;
  title: string;
  email: string;
  phone: string;
  chat_hours: string;
  contact_form_text: string;
  contact_form_link: string;
}

export type SubMenuCategory = 'loja' | 'servicos' | 'suporte';

export interface DirectusSubMenuContent {
  id: string;
  slug: string;
  category: SubMenuCategory;
  title: string;
  description?: string;
  content?: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  sort?: number;
  not_found_message?: string;
}

interface DirectusHero {
  title?: string;
  subtitle?: string;
  primary_button_text?: string;
  primary_button_link?: string;
}

interface DirectusOrder {
  id: string;
  customer: string | number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  date_created?: string;
  date_updated?: string;
  items?: DirectusOrderItem[];
}

interface DirectusOrderItem {
  id: string;
  order: string | number;
  product: string | number;
  quantity: number;
  price: number;
}

interface DirectusCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_created?: string;
}

interface DirectusSchema {
  settings: DirectusSettings;
  pages: DirectusPages[];
  header_menu: DirectusHeaderMenu[];
  footer_menu: DirectusFooterMenu[];
  services: DirectusServices[];
  categories: DirectusCategories[];
  news: DirectusNews[];
  contacts: DirectusContacts[];
  hero: DirectusHero;
  products: DirectusProduct[];
  orders: DirectusOrder[];
  customers: DirectusCustomer[];
  order_items: DirectusOrderItem[];
  contact_info: DirectusContactInfo;
  sub_menu_content: DirectusSubMenuContent[];
}

export interface DirectusProductImage {
  id: number;
  products_id: number;
  directus_files_id: string;  // UUID of the image file
  sort: number;  // Order of images
}

export interface DirectusProduct {
  id: number; // Directus uses integer for product ID
  name: string;
  description?: string;
  price: number;
  image?: string; // Single image UUID (deprecated, use images instead)
  images?: DirectusProductImage[]; // M2M relationship for multiple images
  status?: 'draft' | 'published' | 'archived';
  category?: number; // Foreign key to categories table (integer)
  stock?: number; // Available stock count
}

// Automatically determine the correct Directus URL based on environment
const getDirectusURL = () => {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  const isBrowser = typeof window !== 'undefined';
  const isHTTPS = isBrowser && window.location.protocol === 'https:';
  
  // Force production mode if we're on HTTPS or the domain contains varrho.com
  const forceProduction = isHTTPS || (isBrowser && window.location.hostname.includes('varrho.com'));
  
  if (isProduction || forceProduction) {
    // In production, always use HTTPS with the correct API path
    return import.meta.env.VITE_DIRECTUS_URL || 'https://keyprog.varrho.com';
  }
  
  // In development, always use the VITE_DIRECTUS_URL from environment
  // This ensures we connect to the correct Directus instance (localhost:8065)
  return import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
};

const DIRECTUS_URL = getDirectusURL();
const STATIC_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

// Debug logging for URL configuration
console.log('🔧 Directus Configuration:', {
  url: DIRECTUS_URL,
  isProduction: import.meta.env.PROD || import.meta.env.MODE === 'production',
  isHTTPS: typeof window !== 'undefined' && window.location.protocol === 'https:',
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  isBrowser: typeof window !== 'undefined',
  hasToken: !!STATIC_TOKEN
});

// Create Directus client for API calls (with static token if available)
export const directus = createDirectus<DirectusSchema>(DIRECTUS_URL)
  .with(rest({
    onRequest: (options) => {
      // Add timeout and better error handling
      return { 
        ...options, 
        timeout: 10000,
        // Enable cross-origin cookies for Directus session
        credentials: 'include'
      };
    }
  }))
  .with(STATIC_TOKEN && STATIC_TOKEN.trim() 
    ? staticToken(STATIC_TOKEN)
    : authentication('json', {
        // Enable cross-origin cookies for Directus session
        credentials: 'include',
        autoRefresh: true,
        msRefreshBeforeExpires: 30000
      })
  );

// Create separate Directus client for session-based authentication with localStorage persistence
export const sessionDirectus = createDirectus<DirectusSchema>(DIRECTUS_URL)
  .with(rest({
    onRequest: (options) => {
      return {
        ...options,
        timeout: 10000,
        credentials: 'include'
      };
    }
  }))
  .with(authentication('json', {
    credentials: 'include',
    autoRefresh: true,
    msRefreshBeforeExpires: 30000, // Refresh 30 seconds before expiration
    // CRITICAL: Store FULL authentication data (access_token + refresh_token) in localStorage
    storage: {
      get: async () => {
        try {
          const authData = localStorage.getItem('directus_auth_data');
          if (!authData) return null;

          const parsed = JSON.parse(authData);
          // Verify we have both tokens
          if (!parsed.access_token || !parsed.refresh_token) {
            console.warn('⚠️ Incomplete auth data in storage, clearing...');
            localStorage.removeItem('directus_auth_data');
            return null;
          }

          return parsed;
        } catch (error) {
          console.error('Error reading auth data from storage:', error);
          localStorage.removeItem('directus_auth_data');
          return null;
        }
      },
      set: async (data) => {
        try {
          if (data && data.access_token && data.refresh_token) {
            // Store the complete authentication data object
            localStorage.setItem('directus_auth_data', JSON.stringify(data));
            console.log('✅ Auth tokens stored successfully');
          } else if (!data) {
            // Clear auth data on logout
            localStorage.removeItem('directus_auth_data');
            console.log('🗑️ Auth tokens cleared');
          } else {
            console.warn('⚠️ Attempted to store incomplete auth data:', data);
          }
        } catch (error) {
          console.error('Error storing auth data:', error);
        }
      }
    }
  }));

// Create Directus client for Visual Editor with token inheritance
export const createEditorDirectus = (token: string) => {
  return createDirectus<DirectusSchema>(DIRECTUS_URL)
    .with(rest({
      onRequest: (options) => {
        // Add the inherited token to all requests
        return { 
          ...options, 
          timeout: 10000,
          // Enable cross-origin cookies for Directus session
          credentials: 'include',
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        };
      }
    }));
};

export { 
  readItems, 
  readItem, 
  readSingleton,
  updateSingleton,
  updateItem,
  createItem,
  type DirectusSettings,
  type DirectusPages,
  type DirectusHeaderMenu,
  type DirectusFooterMenu,
  type DirectusServices,
  type DirectusCategories,
  type DirectusNews,
  type DirectusContacts,
  type DirectusContactInfo,
  type DirectusHero,
  type DirectusSchema,
  type DirectusOrder,
  type DirectusCustomer,
  type DirectusOrderItem
};