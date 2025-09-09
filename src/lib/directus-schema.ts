import type { DirectusPages, DirectusHeaderMenu } from './directus';

export interface Schema {
  pages: DirectusPages[];
  header_menu: DirectusHeaderMenu[];
  // Add other collections as needed
}

export type CollectionName = keyof Schema;
