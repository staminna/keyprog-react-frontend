import { DirectusSchema } from './directus';

// Portuguese interfaces for Directus collections
export interface DirectusSettingsPT {
  site_title?: string;
  site_description?: string;
  logo?: string;
  language?: 'pt' | 'en';
}

export interface DirectusPagesPT {
  id: string;
  title?: string;
  slug?: string;
  content?: Record<string, unknown>;
  not_found_message?: string;
}

export interface DirectusHeaderMenuPT {
  id: string;
  title?: string;
  link?: string;
  sub_menu?: Array<{
    title: string;
    link: string;
  }>;
}

export interface DirectusFooterMenuPT {
  id: string;
  title?: string;
  links?: Array<{
    title: string;
    url: string;
  }>;
}

export interface DirectusServicesPT {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  image?: string;
  category?: string;
  features?: string | string[];
  price?: number;
  status?: string;
  not_found_message?: string;
}

export interface DirectusCategoriesPT {
  id: string;
  title?: string;
  image?: string;
  slug?: string;
  not_found_message?: string;
}

export interface DirectusNewsPT {
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
  not_found_message?: string;
}

export interface DirectusContactsPT {
  id: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  not_found_message?: string;
}

export interface DirectusSubMenuContentPT {
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

export interface DirectusHeroPT {
  title?: string;
  subtitle?: string;
  primary_button_text?: string;
  primary_button_link?: string;
}

export interface DirectusProductPT {
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
  not_found_message?: string;
}

export interface DirectusOrderPT {
  id: string;
  customer: string | number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  date_created?: string;
  date_updated?: string;
  items?: DirectusOrderItemPT[];
  not_found_message?: string;
}

export interface DirectusOrderItemPT {
  id: string;
  order: string | number;
  product: string | number;
  quantity: number;
  price: number;
}

export interface DirectusCustomerPT {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_created?: string;
  not_found_message?: string;
}

export interface DirectusFileServicePT {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  not_found_message?: string;
}

export interface DirectusSimuladorPT {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  not_found_message?: string;
}

export interface DirectusSuportePT {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  not_found_message?: string;
}

export interface DirectusSchemaPT extends DirectusSchema {
  settings_pt: DirectusSettingsPT;
  pages_pt: DirectusPagesPT[];
  header_menu_pt: DirectusHeaderMenuPT[];
  footer_menu_pt: DirectusFooterMenuPT[];
  services_pt: DirectusServicesPT[];
  categories_pt: DirectusCategoriesPT[];
  news_pt: DirectusNewsPT[];
  contacts_pt: DirectusContactsPT[];
  hero_pt: DirectusHeroPT;
  products_pt: DirectusProductPT[];
  orders_pt: DirectusOrderPT[];
  customers_pt: DirectusCustomerPT[];
  order_items_pt: DirectusOrderItemPT[];
  file_service_pt: DirectusFileServicePT[];
  simulador_pt: DirectusSimuladorPT[];
  suporte_pt: DirectusSuportePT[];
}

// Default not found message in Portuguese
export const DEFAULT_NOT_FOUND_MESSAGE = "Conteúdo não encontrado. O conteúdo solicitado não foi encontrado ou não está disponível.";
