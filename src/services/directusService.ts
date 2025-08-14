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
  private static authPromise: Promise<boolean> | null = null;
  private static useStaticToken = false;

  static async authenticate(): Promise<boolean> {
    // Check if we have a static token first
    const staticToken = import.meta.env.VITE_DIRECTUS_TOKEN;
    if (staticToken && staticToken.trim()) {
      console.log('Using static token authentication');
      this.isAuthenticated = true;
      this.useStaticToken = true;
      return true;
    }

    // Prevent multiple simultaneous authentication attempts
    if (this.authPromise) {
      return this.authPromise;
    }

    if (this.isAuthenticated) return true;
    
    this.authPromise = this.performAuthentication();
    const result = await this.authPromise;
    this.authPromise = null;
    return result;
  }

  private static async performAuthentication(): Promise<boolean> {
    try {
      const email = import.meta.env.VITE_DIRECTUS_EMAIL;
      const password = import.meta.env.VITE_DIRECTUS_PASSWORD;
      
      if (!email || !password) {
        console.warn('Directus credentials not found in environment');
        return false;
      }
      
      // Check if we're using static token (no login/logout methods available)
      if (this.useStaticToken) {
        console.log('Using static token, skipping login');
        this.isAuthenticated = true;
        return true;
      }
      
      // Clear any existing authentication state only if we're already authenticated
      const existingToken = await directus.getToken();
      if (existingToken && 'logout' in directus) {
        try {
          await (directus as any).logout();
          console.log('Logged out existing session');
        } catch (logoutError) {
          console.warn('Logout failed, continuing with fresh login');
        }
      }
      
      // Perform fresh login only if login method exists
      if ('login' in directus) {
        const result = await (directus as any).login({ email, password });
        console.log('Authentication successful, token received:', !!result.access_token);
        
        // Verify the token is properly set
        const token = await directus.getToken();
        console.log('Token verification:', !!token);
        
        this.isAuthenticated = true;
        return true;
      } else {
        console.warn('Login method not available, using static token mode');
        this.isAuthenticated = true;
        return true;
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.isAuthenticated = false;
      
      // Reset authentication state on failure
      if ('logout' in directus) {
        try {
          await (directus as any).logout();
        } catch (logoutError) {
          // Ignore logout errors
        }
      }
      
      return false;
    }
  }

  private static async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated) {
      const success = await this.authenticate();
      if (!success) {
        throw new Error('Authentication failed');
      }
    }
  }

  private static async safeRequest<T>(requestFn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      await this.ensureAuthenticated();
      
      // Verify we have a valid token before making the request
      const token = await directus.getToken();
      if (!token) {
        console.warn('No authentication token found, re-authenticating...');
        this.isAuthenticated = false;
        await this.ensureAuthenticated();
      }
      
      return await requestFn();
    } catch (error: unknown) {
      console.error('Request failed:', error);
      
      const errorObj = error as { response?: { status?: number }; isRetry?: boolean };
      
      // If it's a 403, try to re-authenticate once as the token might be expired
      if (errorObj?.response?.status === 403 && !errorObj?.isRetry) {
        console.log('403 error - token might be expired, re-authenticating...');
        this.isAuthenticated = false;
        try {
          await this.ensureAuthenticated();
          const retryError = new Error('Retry attempt') as Error & { isRetry: boolean };
          retryError.isRetry = true;
          return await requestFn();
        } catch (retryError) {
          console.error('Re-authentication retry failed, using fallback data');
          return fallback;
        }
      }
      
      // If it's a 404, the collection might not exist
      if (errorObj?.response?.status === 404) {
        console.warn('Collection not found, using fallback data');
        return fallback;
      }
      
      // For other errors or already retried 403s, use fallback
      console.warn('Using fallback data due to error:', errorObj?.response?.status);
      return fallback;
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
    const fallback: DirectusHero = {
      title: "Performance, diagnóstico e soluções para a sua centralina",
      subtitle: "Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.",
      primary_button_text: "Ver Serviços",
      primary_button_link: "/servicos"
    };

    return this.safeRequest(
      () => directus.request(readSingleton('hero')),
      fallback
    );
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
    const fallback: DirectusServices[] = [
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

    return this.safeRequest(
      () => directus.request(readItems('services')),
      fallback
    );
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