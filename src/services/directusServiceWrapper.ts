import { DirectusService } from './directusService';
import { ContentFormatter } from '../middleware/contentFormatter';
import { type DirectusSettings } from '@/lib/directus';

/**
 * DirectusServiceWrapper
 * This wrapper adds content formatting to DirectusService methods
 * to ensure doc(paragraph(...)) syntax is properly handled
 */
export class DirectusServiceWrapper {
  /**
   * Get settings with content formatting
   */
  static async getSettings(): Promise<DirectusSettings> {
    const settings = await DirectusService.getSettings();
    return ContentFormatter.processResponse(settings);
  }

  /**
   * Update settings with content formatting
   */
  static async updateSettings(data: Partial<DirectusSettings>): Promise<DirectusSettings> {
    const cleanedData = ContentFormatter.processRequest(data);
    const result = await DirectusService.updateSettings(cleanedData);
    return ContentFormatter.processResponse(result);
  }

  /**
   * Get collection item with content formatting
   */
  static async getCollectionItem(collection: string, id: string | number): Promise<Record<string, unknown>> {
    const item = await DirectusService.getCollectionItem(collection, id);
    return ContentFormatter.processResponse(item);
  }

  /**
   * Update collection item with content formatting
   */
  static async updateCollectionItem(
    collection: string, 
    id: string | number, 
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const cleanedData = ContentFormatter.processRequest(data);
    const result = await DirectusService.updateCollectionItem(collection, id, cleanedData);
    return ContentFormatter.processResponse(result);
  }

  /**
   * Create collection item with content formatting
   */
  static async createCollectionItem(
    collection: string, 
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const cleanedData = ContentFormatter.processRequest(data);
    const result = await DirectusService.createCollectionItem(collection, cleanedData);
    return ContentFormatter.processResponse(result);
  }

  /**
   * Get header menu with content formatting
   */
  static async getHeaderMenu() {
    const menu = await DirectusService.getHeaderMenu();
    return ContentFormatter.processResponse(menu);
  }

  /**
   * Get footer menu with content formatting
   */
  static async getFooterMenu() {
    const menu = await DirectusService.getFooterMenu();
    return ContentFormatter.processResponse(menu);
  }

  /**
   * Get sub-menu content with content formatting
   */
  static async getSubMenuContent(category: string, slug: string) {
    const content = await DirectusService.getSubMenuContent(category, slug);
    return ContentFormatter.processResponse(content);
  }

  /**
   * Get sub-menu content by category with content formatting
   */
  static async getSubMenuContentByCategory(category: string) {
    const content = await DirectusService.getSubMenuContentByCategory(category);
    return ContentFormatter.processResponse(content);
  }

  /**
   * Get hero content with content formatting
   */
  static async getHero() {
    const hero = await DirectusService.getHero();
    return ContentFormatter.processResponse(hero);
  }

  /**
   * Update hero content with content formatting
   */
  static async updateHero(data: Record<string, unknown>) {
    const cleanedData = ContentFormatter.processRequest(data);
    const result = await DirectusService.updateHero(cleanedData);
    return ContentFormatter.processResponse(result);
  }

  /**
   * Get contact info with content formatting
   */
  static async getContactInfo() {
    const contactInfo = await DirectusService.getContactInfo();
    return ContentFormatter.processResponse(contactInfo);
  }

  /**
   * Get page with content formatting
   */
  static async getPage(slug: string) {
    const page = await DirectusService.getPage(slug);
    return ContentFormatter.processResponse(page);
  }

  /**
   * Get pages with content formatting
   */
  static async getPages() {
    const pages = await DirectusService.getPages();
    return ContentFormatter.processResponse(pages);
  }

  /**
   * Get services with content formatting
   */
  static async getServices() {
    const services = await DirectusService.getServices();
    return ContentFormatter.processResponse(services);
  }

  /**
   * Get service with content formatting
   */
  static async getService(slug: string) {
    const service = await DirectusService.getService(slug);
    return ContentFormatter.processResponse(service);
  }

  /**
   * Update service with content formatting
   */
  static async updateService(id: string, data: Record<string, unknown>) {
    const cleanedData = ContentFormatter.processRequest(data);
    const result = await DirectusService.updateService(id, cleanedData);
    return ContentFormatter.processResponse(result);
  }
}

export default DirectusServiceWrapper;
