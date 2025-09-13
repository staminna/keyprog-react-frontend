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
  sub_menu?: Array<{
    title: string;
    link: string;
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
  image?: string;
  category?: string;
  features?: string | string[];
  price?: number;
  status?: string;
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

export interface DirectusSubMenuContent {
  id: string;
  slug: string;
  category: 'loja' | 'servicos' | 'suporte';
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
}

export interface DirectusProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  slug: string;
  category?: string;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  inventory_count?: number;
  sku?: string;
  featured?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
const STATIC_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

// Create Directus client for API calls (with static token if available)
export const directus = createDirectus<DirectusSchema>(DIRECTUS_URL)
  .with(rest({
    onRequest: (options) => {
      // Add timeout and better error handling
      return { 
        ...options, 
        timeout: 10000,
        // Fix CORS issue by using 'same-origin' instead of 'include'
        credentials: 'same-origin'
      };
    }
  }))
  .with(STATIC_TOKEN && STATIC_TOKEN.trim() 
    ? staticToken(STATIC_TOKEN)
    : authentication('json', {
        // Fix CORS issue by using 'same-origin' instead of 'include'
        credentials: 'same-origin',
        autoRefresh: true,
        msRefreshBeforeExpires: 30000
      })
  );

// Create separate Directus client for session-based authentication
export const sessionDirectus = createDirectus<DirectusSchema>(DIRECTUS_URL)
  .with(rest({
    onRequest: (options) => {
      return { 
        ...options, 
        timeout: 10000,
        // Fix CORS issue by using 'same-origin' instead of 'include'
        credentials: 'same-origin'
      };
    }
  }))
  .with(authentication('json', {
    // Fix CORS issue by using 'same-origin' instead of 'include'
    credentials: 'same-origin',
    autoRefresh: true,
    msRefreshBeforeExpires: 30000
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
          // Fix CORS issue by using 'same-origin' instead of 'include'
          credentials: 'same-origin',
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