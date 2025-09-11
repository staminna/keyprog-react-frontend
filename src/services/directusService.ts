import { deleteItem } from '@directus/sdk';
import { 
  directus, 
  sessionDirectus,
  createEditorDirectus,
  readItems, 
  readItem, 
  readSingleton,
  updateSingleton,
  updateItem,
  createItem,
  type DirectusSettings,
  type DirectusHeaderMenu,
  type DirectusFooterMenu,
  type DirectusServices,
  type DirectusCategories,
  type DirectusNews,
  type DirectusContacts,
  type DirectusHero,
  type DirectusSchema,
  type DirectusSubMenuContent
} from '@/lib/directus';

import type { User } from '@/types/auth';

export class DirectusService {
  private static isAuthenticated = false;
  private static authPromise: Promise<boolean> | null = null;
  private static useStaticToken = false;
  private static isInDirectusEditor = false;
  private static editorDirectusClient: ReturnType<typeof createEditorDirectus> | null = null;
  private static parentToken: string | null = null;
  private static autoLoginAttempted = false;
  private static initPromise: Promise<boolean> | null = null;

  // Check if running inside Directus Visual Editor and get parent token
  private static async checkDirectusEditor(): Promise<{ isEditor: boolean; token?: string }> {
    try {
      // Check if we're in an iframe and the parent has Directus context
      if (window.parent !== window) {
        // Check for Directus-specific indicators
        const isDirectusFrame = 
          window.location.search.includes('directus') ||
          document.referrer.includes('directus') ||
          (window.parent as Window & { location?: Location }).location?.href?.includes('directus');
        
        if (isDirectusFrame) {
          console.log('🎯 Detected Directus Visual Editor context');
          
          // Try to get the parent Directus token
          try {
            // Check if parent has Directus API or token available
            const parentDirectus = (window.parent as Window & { directus?: { getToken: () => string } }).directus;
            if (parentDirectus && typeof parentDirectus.getToken === 'function') {
              const token = await parentDirectus.getToken();
              if (token) {
                console.log('🔑 Retrieved parent Directus token for write operations');
                return { isEditor: true, token };
              }
            }
            
            // Alternative: check for token in parent localStorage
            const parentToken = (window.parent as Window & { localStorage?: Storage }).localStorage?.getItem('directus_token');
            if (parentToken) {
              console.log('🔑 Retrieved parent Directus token from localStorage');
              return { isEditor: true, token: parentToken };
            }
          } catch (tokenError) {
            console.warn('Could not retrieve parent Directus token:', tokenError);
          }
          
          return { isEditor: true };
        }
      }
    } catch (error) {
      // Cross-origin restrictions - likely in iframe but can't access parent
      // This often happens in Directus Visual Editor
      if (window.parent !== window) {
        console.log('🎯 Detected iframe context - likely Directus Visual Editor');
        return { isEditor: true };
      }
    }
    return { isEditor: false };
  }

  // Initialize autologin - called automatically when service is first used
  static async initialize(): Promise<boolean> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private static async performInitialization(): Promise<boolean> {
    try {
      // Check if we're in Directus Visual Editor first
      const editorContext = await this.checkDirectusEditor();
      this.isInDirectusEditor = editorContext.isEditor;
      
      if (this.isInDirectusEditor) {
        console.log('🎯 Detected Directus Visual Editor - using inherited authentication');
        if (editorContext.token) {
          this.parentToken = editorContext.token;
          this.editorDirectusClient = createEditorDirectus(editorContext.token);
        }
        this.isAuthenticated = true;
        return true;
      }

      // Try static token first
      const staticToken = import.meta.env.VITE_DIRECTUS_TOKEN;
      if (staticToken && staticToken.trim()) {
        console.log('🔑 Using static token for authentication');
        this.isAuthenticated = true;
        this.useStaticToken = true;
        return true;
      }

      // Attempt autologin with environment credentials
      const email = import.meta.env.VITE_DIRECTUS_EMAIL;
      const password = import.meta.env.VITE_DIRECTUS_PASSWORD;
      
      if (email && password && !this.autoLoginAttempted) {
        console.log('🚀 Attempting autologin with environment credentials');
        this.autoLoginAttempted = true;
        const success = await this.performAuthentication(email, password);
        if (success) {
          console.log('✅ Autologin successful');
          return true;
        } else {
          console.warn('❌ Autologin failed');
        }
      }

      return false;
    } catch (error) {
      console.error('Initialization failed:', error);
      return false;
    }
  }

  // Public method to trigger autologin
  static async autoLogin(): Promise<boolean> {
    console.log('🚀 Triggering autologin...');
    return await this.initialize();
  }

  static async authenticate(email?: string, password?: string): Promise<boolean> {
    // If email and password are provided, force session-based authentication
    if (email && password) {
      console.log('Using session-based authentication with provided credentials');
      this.useStaticToken = false;
      this.isAuthenticated = false; // Reset to force fresh authentication
      
      // Prevent multiple simultaneous authentication attempts
      if (this.authPromise) {
        return this.authPromise;
      }
      
      this.authPromise = this.performAuthentication(email, password);
      const result = await this.authPromise;
      this.authPromise = null;
      return result;
    }
    
    // If not initialized yet, initialize first
    if (!this.initPromise) {
      return await this.initialize();
    }
    
    // Check if we're in Directus Visual Editor
    const editorContext = await this.checkDirectusEditor();
    this.isInDirectusEditor = editorContext.isEditor;
    
    // If in Directus Editor, try to use inherited authentication
    if (this.isInDirectusEditor) {
      console.log('🎯 Auto-authenticating for Directus Visual Editor');
      
      // If we have a parent token, create a dedicated editor client
      if (editorContext.token) {
        try {
          this.parentToken = editorContext.token;
          this.editorDirectusClient = createEditorDirectus(editorContext.token);
          console.log('🔑 Created Directus client with parent token for write operations');
        } catch (tokenError) {
          console.warn('Failed to create editor client with parent token:', tokenError);
        }
      }
      
      this.isAuthenticated = true;
      this.useStaticToken = false; // Use session auth in editor
      return true;
    }
    
    // Only use static token if no credentials provided (for API calls)
    const staticToken = import.meta.env.VITE_DIRECTUS_TOKEN;
    if (staticToken && staticToken.trim()) {
      console.log('Using static token authentication for API calls');
      this.isAuthenticated = true;
      this.useStaticToken = true;
      return true;
    }

    // If already authenticated and no new credentials provided
    if (this.isAuthenticated) return true;
    
    // No credentials and no static token
    console.warn('No authentication method available');
    return false;
  }

  private static async performAuthentication(email?: string, password?: string): Promise<boolean> {
    try {
      // Use provided credentials or fall back to environment
      const authEmail = email || import.meta.env.VITE_DIRECTUS_EMAIL;
      const authPassword = password || import.meta.env.VITE_DIRECTUS_PASSWORD;
      
      if (!authEmail || !authPassword) {
        console.warn('Directus credentials not provided');
        return false;
      }
      
      // Check if we're using static token (no login/logout methods available)
      if (this.useStaticToken) {
        console.log('Using static token, skipping login');
        this.isAuthenticated = true;
        return true;
      }
      
      // If in Directus Editor, assume authentication is inherited
      if (this.isInDirectusEditor) {
        console.log('🎯 Using inherited Directus Editor authentication');
        this.isAuthenticated = true;
        return true;
      }
      
      // Use session-based client for authentication
      const authClient = sessionDirectus;
      
      // Clear any existing authentication state
      const existingToken = await authClient.getToken();
      if (existingToken && 'logout' in authClient) {
        try {
          await (authClient as { logout: () => Promise<void> }).logout();
          console.log('Logged out existing session');
        } catch (logoutError) {
          console.warn('Logout failed, continuing with fresh login');
        }
      }
      
      // CRITICAL: Only authenticate if login method exists, otherwise fail
      if (!('login' in authClient)) {
        console.error('Login method not available on session client - authentication cannot proceed');
        this.isAuthenticated = false;
        return false;
      }
      
      // Perform fresh login with proper error handling
      try {
        console.log('Attempting login with credentials:', { email: authEmail, passwordProvided: !!authPassword });
        
        const result = await (authClient as { login: (credentials: { email: string; password: string }) => Promise<{ access_token?: string }> }).login({ 
          email: authEmail, 
          password: authPassword 
        });
        
        console.log('Login attempt result:', !!result.access_token);
        
        // Verify we actually received a valid token
        if (!result.access_token) {
          console.error('No access token received from Directus login');
          this.isAuthenticated = false;
          return false;
        }
        
        // Double-check the token is properly set in the client
        const token = await authClient.getToken();
        if (!token) {
          console.error('Token not properly set in Directus client after login');
          this.isAuthenticated = false;
          return false;
        }
        
        console.log('Authentication successful - token verified');
        this.isAuthenticated = true;
        return true;
        
      } catch (loginError) {
        console.error('Login failed with error:', loginError);
        this.isAuthenticated = false;
        return false;
      }
    } catch (error) {
      console.error('Authentication failed with error:', error);
      this.isAuthenticated = false;
      
      // Reset authentication state on failure
      if ('logout' in sessionDirectus) {
        try {
          await (sessionDirectus as { logout: () => Promise<void> }).logout();
        } catch (logoutError) {
          console.warn('Failed to logout after authentication error');
        }
      }
      
      return false;
    }
  }

  // Verify if the current token is valid without full re-authentication
  static async verifyToken(): Promise<boolean> {
    try {
      // If in Directus Editor, assume token is valid
      if (this.isInDirectusEditor) {
        return true;
      }
      
      // Check if we have a token in the session client
      const token = await sessionDirectus.getToken();
      if (!token) {
        return false;
      }
      
      // Make a lightweight request to verify token validity
      // Using the /users/me endpoint is a good way to verify token
      try {
        // Use raw fetch to avoid SDK typing issues
        const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/users/me?fields=email`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          return false;
        }
        
        const data = await response.json();
        return !!data && !!data.data;
      } catch (error) {
        // If we get a 401/403, token is invalid
        console.warn('Token verification failed:', error);
        return false;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }
  
  // Get current user information
  static async getCurrentUser(): Promise<User | null> {
    try {
      // If in Directus Editor, return a placeholder user
      if (this.isInDirectusEditor) {
        return { email: 'directus-editor-user', authenticated: true };
      }
      
      // Check if we have a token
      const token = await sessionDirectus.getToken();
      if (!token) {
        return null;
      }
      
      // Get user info using fetch to avoid SDK typing issues
      try {
        const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/users/me?fields=email,first_name,last_name`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          return null;
        }
        
        const result = await response.json();
        if (result && result.data) {
          return {
            email: result.data.email,
            firstName: result.data.first_name,
            lastName: result.data.last_name,
            authenticated: true
          };
        }
        return null;
      } catch (error) {
        console.warn('Failed to get user info:', error);
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  private static async ensureAuthenticated(): Promise<void> {
    // Initialize if not already done
    if (!this.isAuthenticated && !this.initPromise) {
      await this.initialize();
    }
    
    // If in Directus Editor, skip authentication check
    if (this.isInDirectusEditor) {
      console.log('🎯 Skipping authentication check - using Directus Editor context');
      this.isAuthenticated = true;
      return;
    }
    
    // If using static token, we're already authenticated
    if (this.useStaticToken && this.isAuthenticated) {
      return;
    }
    
    // First try to verify if we have a valid token
    const tokenValid = await this.verifyToken();
    if (tokenValid) {
      this.isAuthenticated = true;
      return;
    }
    
    // If token is not valid, try to authenticate
    const authenticated = await this.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
  }

  private static async safeRequest<T>(requestFn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      await this.ensureAuthenticated();
      
      // If in Directus Editor with parent token, use the editor client for requests
      if (this.isInDirectusEditor && this.editorDirectusClient && this.parentToken) {
        console.log('🎯 Using editor Directus client with inherited token');
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
      // Return empty settings object so logo fallback works
      return { logo: null } as DirectusSettings;
    }
  }

  static async updateSettings(data: Partial<DirectusSettings>): Promise<DirectusSettings> {
    try {
      await this.ensureAuthenticated();
      
      // Use editor client if available (for Directus Visual Editor context)
      const client = this.isInDirectusEditor && this.editorDirectusClient 
        ? this.editorDirectusClient 
        : directus;
      
      console.log('🔄 Updating settings with client:', this.isInDirectusEditor ? 'editor' : 'default');
      const updatedSettings = await client.request(updateSingleton('settings', data));
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
      
      // Use editor client if available (for Directus Visual Editor context)
      const client = this.isInDirectusEditor && this.editorDirectusClient 
        ? this.editorDirectusClient 
        : directus;
      
      console.log('🔄 Updating hero with client:', this.isInDirectusEditor ? 'editor' : 'default');
      const updatedHero = await client.request(updateSingleton('hero', data));
      return updatedHero;
    } catch (error) {
      console.error('Error updating hero:', error);
      throw error;
    }
  }

  static async getPages(): Promise<Record<string, unknown>[]> {
    try {
      await this.ensureAuthenticated();
      const pages = await directus.request(readItems('pages' as 'pages'));
      return pages;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  static async getPage(slug: string): Promise<Record<string, unknown> | null> {
    try {
      const pages = await directus.request(
        readItems('pages' as 'pages', {
          filter: { slug: { _eq: slug } }
        })
      );
      return pages[0] || null;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }



  static async getFooterMenu(): Promise<DirectusFooterMenu[]> {
    const fallback: DirectusFooterMenu[] = [
      {
        id: '1',
        title: 'Serviços',
        links: [
          { title: 'Reprogramação ECU', url: '/servicos#reprogramacao' },
          { title: 'Desbloqueio', url: '/servicos#desbloqueio' },
          { title: 'Clonagem', url: '/servicos#clonagem' },
          { title: 'Diagnóstico', url: '/servicos#diagnostico' }
        ]
      },
      {
        id: '2',
        title: 'Loja',
        links: [
          { title: 'Emuladores', url: '/loja#emuladores' },
          { title: 'Equipamentos', url: '/loja#equipamentos' },
          { title: 'Software', url: '/loja#software' },
          { title: 'Acessórios', url: '/loja#acessorios' }
        ]
      },
      {
        id: '3',
        title: 'Suporte',
        links: [
          { title: 'Contactos', url: '/contactos' },
          { title: 'File Service', url: '/file-service' },
          { title: 'Simulador', url: '/simulador' },
          { title: 'FAQ', url: '/suporte#faq' }
        ]
      },
      {
        id: '4',
        title: 'Empresa',
        links: [
          { title: 'Sobre Nós', url: '/sobre' },
          { title: 'Notícias', url: '/noticias' },
          { title: 'Política de Privacidade', url: '/privacidade' },
          { title: 'Termos de Serviço', url: '/termos' }
        ]
      }
    ];

    return this.safeRequest(async () => {
      const client = this.isInDirectusEditor && this.editorDirectusClient 
        ? this.editorDirectusClient 
        : directus;
      
      const menu = await client.request(readItems('footer_menu'));
      
      return menu.map(item => ({
        ...item,
        links: Array.isArray(item.links) ? item.links : []
      }));
    }, fallback);
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
    return this.safeRequest(async () => {
      const client = this.isInDirectusEditor && this.editorDirectusClient 
        ? this.editorDirectusClient 
        : directus;
      
      const services = await client.request(
        readItems('services', {
          filter: { slug: { _eq: slug } }
        })
      );
      return services[0] || null;
    }, null);
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

  static async getHeaderMenu(): Promise<DirectusHeaderMenu[]> {
    try {
      const client = this.isInDirectusEditor && this.editorDirectusClient 
        ? this.editorDirectusClient 
        : directus;
      
      const headerMenu = await client.request(readItems('header_menu'));
      
      if (headerMenu && headerMenu.length > 0) {
        return headerMenu.map(item => ({
          ...item,
          sub_menu: this.normalizeSubMenu(item.sub_menu)
        }));
      }
      
      // Return empty array if no data, let component handle fallback
      return [];
    } catch (error) {
      console.error('Failed to fetch header menu from Directus:', error);
      // Return empty array on error, let component handle fallback
      return [];
    }
  }

  // Get sub-menu content by category and slug
  static async getSubMenuContent(category: string, slug: string): Promise<DirectusSubMenuContent | null> {
    try {
      await this.ensureAuthenticated();
      const content = await directus.request(
        readItems('sub_menu_content' as any, {
          filter: { 
            category: { _eq: category },
            slug: { _eq: slug },
            status: { _eq: 'published' }
          }
        })
      );
      return (content[0] || null) as unknown as DirectusSubMenuContent | null;
    } catch (error) {
      console.error('Error fetching sub-menu content:', error);
      return null;
    }
  }

  // Get all sub-menu content by category
  static async getSubMenuContentByCategory(category: string): Promise<DirectusSubMenuContent[]> {
    try {
      await this.ensureAuthenticated();
      const content = await directus.request(
        readItems('sub_menu_content' as any, {
          filter: { 
            category: { _eq: category },
            status: { _eq: 'published' }
          },
          sort: ['sort', 'title']
        })
      );
      return content as unknown as DirectusSubMenuContent[];
    } catch (error) {
      console.error('Error fetching sub-menu content by category:', error);
      return [];
    }
  }

  // Helper function to normalize sub_menu data from Directus JSON field
  private static normalizeSubMenu(subMenu: unknown): Array<{title: string, link: string}> | undefined {
    if (!subMenu) return undefined;
    
    // If it's already an array (from JSON field), return as is
    if (Array.isArray(subMenu)) {
      return subMenu.filter(item => 
        item && typeof item === 'object' && 'title' in item && 'link' in item
      ) as Array<{title: string, link: string}>;
    }
    
    return undefined;
  }

  static getImageUrl(imageId: string): string {
    if (!imageId) return '';
    const baseUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065';
    return `${baseUrl}/assets/${imageId}`;
  }

  // Generic collection item methods for inline editing
  static async getCollectionItem(collection: string, id: string | number): Promise<Record<string, unknown>> {
    try {
      await this.ensureAuthenticated();
      const item = await directus.request(
        readItem(collection as any, id)
      );
      return item as Record<string, unknown>;
    } catch (error) {
      console.error(`Error fetching ${collection} item:`, error);
      throw error;
    }
  }

  static async updateCollectionItem(collection: string, id: string | number, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      await this.ensureAuthenticated();
      const updatedItem = await directus.request(
        updateItem(collection as any, id, data)
      );
      return updatedItem as Record<string, unknown>;
    } catch (error) {
      console.error(`Error updating ${collection} item:`, error);
      throw error;
    }
  }

  static async createCollectionItem(collection: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      await this.ensureAuthenticated();
      const newItem = await directus.request(
        createItem(collection as any, data)
      );
      return newItem as Record<string, unknown>;
    } catch (error) {
      console.error(`Error creating ${collection} item:`, error);
      throw error;
    }
  }

  static async deleteCollectionItem(collection: string, id: string | number): Promise<void> {
    try {
      await this.ensureAuthenticated();
      await directus.request(
        deleteItem(collection as any, id)
      );
    } catch (error) {
      console.error(`Error deleting ${collection} item:`, error);
      throw error;
    }
  }
}