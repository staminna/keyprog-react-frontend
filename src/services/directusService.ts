import { 
  directus, 
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
  type DirectusHero
} from '../lib/directus';

export class DirectusService {
  private static isAuthenticated = false;

  static async authenticate(): Promise<boolean> {
    if (this.isAuthenticated) return true;
    
    try {
      const email = import.meta.env.VITE_DIRECTUS_EMAIL;
      const password = import.meta.env.VITE_DIRECTUS_PASSWORD;
      
      if (!email || !password) {
        console.warn('Directus credentials not found in environment');
        return false;
      }
      
      const result = await directus.login(email, password);
      console.log('Authentication successful');
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  private static async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }
  }
  static async getSettings(): Promise<DirectusSettings> {
    try {
      await this.ensureAuthenticated();
      const settings = await directus.request(readSingleton('settings'));
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  static async updateSettings(data: Partial<DirectusSettings>): Promise<DirectusSettings> {
    try {
      await this.ensureAuthenticated();
      const updatedSettings = await directus.request(updateSingleton('settings', data));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async getHero(): Promise<DirectusHero> {
    try {
      // Try without authentication first (for public access)
      let hero;
      try {
        hero = await directus.request(readSingleton('hero'));
      } catch (publicError) {
        console.log('Public access failed, trying authenticated access...');
        await this.ensureAuthenticated();
        hero = await directus.request(readSingleton('hero'));
      }
      return hero;
    } catch (error) {
      console.error('Error fetching hero:', error);
      // Return default data if collection doesn't exist
      return {
        title: "Performance, diagnóstico e soluções para a sua centralina",
        subtitle: "Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.",
        primary_button_text: "Ver Serviços",
        primary_button_link: "/servicos"
      };
    }
  }

  static async updateHero(data: Partial<DirectusHero>): Promise<DirectusHero> {
    try {
      await this.ensureAuthenticated();
      const updatedHero = await directus.request(updateSingleton('hero', data));
      return updatedHero;
    } catch (error) {
      console.error('Error updating hero:', error);
      throw error;
    }
  }

  static async getPages(): Promise<DirectusPages[]> {
    try {
      await this.ensureAuthenticated();
      const pages = await directus.request(readItems('pages'));
      return pages;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  static async getPage(slug: string): Promise<DirectusPages | null> {
    try {
      const pages = await directus.request(
        readItems('pages', {
          filter: { slug: { _eq: slug } }
        })
      );
      return pages[0] || null;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  static async getHeaderMenu(): Promise<DirectusHeaderMenu[]> {
    try {
      const menu = await directus.request(readItems('header_menu'));
      return menu;
    } catch (error) {
      console.error('Error fetching header menu:', error);
      throw error;
    }
  }

  static async getFooterMenu(): Promise<DirectusFooterMenu[]> {
    try {
      const menu = await directus.request(readItems('footer_menu'));
      return menu;
    } catch (error) {
      console.error('Error fetching footer menu:', error);
      throw error;
    }
  }

  static async getServices(): Promise<DirectusServices[]> {
    try {
      // Try without authentication first (for public access)
      let services;
      try {
        services = await directus.request(readItems('services'));
      } catch (publicError) {
        console.log('Public services access failed, trying authenticated access...');
        await this.ensureAuthenticated();
        services = await directus.request(readItems('services'));
      }
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      // Return default services if collection doesn't exist
      return [
        {
          id: "1",
          title: "Reprogramação de Centralinas",
          description: "Otimização e personalização do desempenho do seu veículo",
          slug: "reprogramacao-centralinas"
        },
        {
          id: "2", 
          title: "Diagnóstico Avançado",
          description: "Identificação precisa de problemas eletrónicos",
          slug: "diagnostico-avancado"
        },
        {
          id: "3",
          title: "Clonagem de Centralinas", 
          description: "Duplicação segura de configurações",
          slug: "clonagem-centralinas"
        }
      ];
    }
  }

  static async updateService(id: string, data: Partial<DirectusServices>): Promise<DirectusServices> {
    try {
      await this.ensureAuthenticated();
      const updatedService = await directus.request(updateItem('services', id, data));
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  static async createService(data: Omit<DirectusServices, 'id'>): Promise<DirectusServices> {
    try {
      await this.ensureAuthenticated();
      const newService = await directus.request(createItem('services', data));
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  static async getService(slug: string): Promise<DirectusServices | null> {
    try {
      const services = await directus.request(
        readItems('services', {
          filter: { slug: { _eq: slug } }
        })
      );
      return services[0] || null;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<DirectusCategories[]> {
    try {
      const categories = await directus.request(readItems('categories'));
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getCategory(slug: string): Promise<DirectusCategories | null> {
    try {
      const categories = await directus.request(
        readItems('categories', {
          filter: { slug: { _eq: slug } }
        })
      );
      return categories[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  static async getNews(): Promise<DirectusNews[]> {
    try {
      const news = await directus.request(
        readItems('news', {
          sort: ['-published_date']
        })
      );
      return news;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  static async getNewsItem(id: string): Promise<DirectusNews | null> {
    try {
      const news = await directus.request(readItem('news', id));
      return news;
    } catch (error) {
      console.error('Error fetching news item:', error);
      throw error;
    }
  }

  static async getContacts(): Promise<DirectusContacts[]> {
    try {
      const contacts = await directus.request(readItems('contacts'));
      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  static getImageUrl(imageId: string): string {
    if (!imageId) return '';
    const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
    return `${baseUrl}/assets/${imageId}`;
  }
}