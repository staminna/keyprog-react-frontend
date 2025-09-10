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
}

interface DirectusHero {
  title?: string;
  subtitle?: string;
  primary_button_text?: string;
  primary_button_link?: string;
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
      return { ...options, timeout: 10000 };
    }
  }))
  .with(STATIC_TOKEN && STATIC_TOKEN.trim() 
    ? staticToken(STATIC_TOKEN)
    : authentication('json', {
        credentials: 'include',
        autoRefresh: true,
        msRefreshBeforeExpires: 30000
      })
  );

// Create separate Directus client for session-based authentication
export const sessionDirectus = createDirectus<DirectusSchema>(DIRECTUS_URL)
  .with(rest({
    onRequest: (options) => {
      return { ...options, timeout: 10000 };
    }
  }))
  .with(authentication('json', {
    credentials: 'include',
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
  type DirectusHero,
  type DirectusSchema
};