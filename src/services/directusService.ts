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
  type DirectusSubMenuContent,
  type DirectusContactInfo,
  type SubMenuCategory
} from '@/lib/directus';
import { deleteItem as directusDeleteItem } from '@directus/sdk';

import { parseDirectusError, logDirectusError, DirectusErrorType } from './directusErrorHandler';
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
    const isLocalDevHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

    try {
      // Check if we're in an iframe and the parent has Directus context
      if (window.parent !== window) {
        // Check for Directus-specific indicators
        const isDirectusFrame = 
          window.location.search.includes('directus') ||
          document.referrer.includes('directus') ||
          (window.parent as Window & { location?: Location }).location?.href?.includes('directus');
        
        if (isDirectusFrame) {
          if (isLocalDevHost) {
            console.log('🧪 Local development detected - skipping Directus Visual Editor auto-detection');
            return { isEditor: false };
          }

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
        // In Visual Editor but no parent token - this is normal when embedded cross-origin
        // Fall through to use environment credentials which work fine
        this.parentToken = null;
        this.editorDirectusClient = null;
        this.isAuthenticated = false;
      }

      // Try static token for read-only operations
      const staticToken = import.meta.env.VITE_DIRECTUS_TOKEN;
      if (staticToken && staticToken.trim()) {
        console.log('🔑 Using static token for authentication');
        this.isAuthenticated = true;
        this.useStaticToken = true;
        return true;
      }

      // Check for an existing valid session token
      const sessionTokenIsValid = await this.verifyToken();
      if (sessionTokenIsValid) {
        console.log('✅ Found valid session token');
        this.isAuthenticated = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Initialization failed:', error);
      return false;
    }
  }

  // Public method to trigger authentication initialization
  static async autoLogin(): Promise<boolean> {
    console.log('🚀 Initializing authentication...');
    return await this.initialize();
  }

  static async authenticate(email?: string, password?: string): Promise<boolean> {
    // If email and password are provided, force a new session-based authentication
    if (email && password) {
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

    // If not authenticating with new credentials, rely on the initialization status
    if (!this.initPromise) {
      return await this.initialize();
    }
    
    // Check if we're in Directus Visual Editor
    const editorContext = await this.checkDirectusEditor();
    this.isInDirectusEditor = editorContext.isEditor;
    
    // If in Directus Editor, try to use inherited authentication
    if (this.isInDirectusEditor && editorContext.token) {
      console.log('🎯 Auto-authenticating for Directus Visual Editor with inherited token');
      
      try {
        this.parentToken = editorContext.token;
        this.editorDirectusClient = createEditorDirectus(editorContext.token);
        console.log('🔑 Created Directus client with parent token for write operations');
      } catch (tokenError) {
        console.warn('Failed to create editor client with parent token:', tokenError);
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

  private static async performAuthentication(email: string, password: string): Promise<boolean> {
    try {
      // Use session-based client for authentication
      const authClient = sessionDirectus;

      // CRITICAL: Only authenticate if login method exists
      if (!('login' in authClient)) {
        console.error('Login method not available on session client - authentication cannot proceed');
        return false;
      }

      console.log('Attempting login with provided credentials...');
      
      const result = await (authClient as { login: (credentials: { email: string; password: string }) => Promise<{ access_token?: string }> }).login({ 
        email, 
        password 
      });

      // Verify we actually received a valid token
      if (!result.access_token) {
        console.error('No access token received from Directus login');
        this.isAuthenticated = false;
        return false;
      }

      console.log('Authentication successful');
      this.isAuthenticated = true;
      return true;

    } catch (error) {
      console.error('Authentication failed with error:', error);
      this.isAuthenticated = false;
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
  static async getCurrentUser(options?: { token?: string }): Promise<User | null> {
    try {
      // Prefer explicit override token (e.g., passed from Directus Visual Editor)
      const tokenOverride = options?.token;
      if (tokenOverride) {
        this.parentToken = tokenOverride;
      }

      const token = tokenOverride || this.parentToken || await sessionDirectus.getToken();
      if (!token) {
        return null;
      }
      
      // Get user info using fetch to avoid SDK typing issues
      try {
        const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/users/me?fields=id,email,first_name,last_name,role.id,role.name`, {
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
            id: result.data.id,
            email: result.data.email,
            firstName: result.data.first_name,
            lastName: result.data.last_name,
            role: result.data.role?.name,
            roleId: result.data.role?.id,
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
    
    // Wait for initialization to complete if in progress
    if (this.initPromise && !this.isAuthenticated) {
      await this.initPromise;
    }
    
    // If in Directus Editor, skip authentication check
    if (this.isInDirectusEditor && this.parentToken && this.editorDirectusClient) {
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
      // First try with authentication if possible
      try {
        await this.ensureAuthenticated();
        
        // If in Directus Editor with parent token, use the editor client for requests
        if (this.isInDirectusEditor && this.editorDirectusClient && this.parentToken) {
          // Use debug level to reduce console noise
          if (process.env.NODE_ENV === 'development') {
            console.debug('🎯 Using editor Directus client with inherited token');
          }
        }
        
        return await requestFn();
      } catch (authError) {
        // Authentication error - public collections should still work without auth
        // When in Visual Editor, use fallback to public access
        if (this.isInDirectusEditor) {
          console.log('📣 Using public access for collection in Visual Editor');
          try {
            // Try without authentication - relies on PUBLIC_READ being configured correctly
            return await requestFn();
          } catch (publicError) {
            // Public access also failed, use fallback
            const parsedError = parseDirectusError(publicError);
            logDirectusError(parsedError, 'safeRequest:publicAccess');
            return fallback;
          }
        }
        
        // Not in Visual Editor, handle authentication error
        const parsedError = parseDirectusError(authError);
        logDirectusError(parsedError, 'safeRequest:auth');
        
        // If it's a 403, try to re-authenticate once as the token might be expired
        if (parsedError.statusCode === 403 && !(authError as { isRetry?: boolean })?.isRetry) {
          // Use info level to reduce console noise
          console.info('403 error - token might be expired, re-authenticating...');
          this.isAuthenticated = false;
          try {
            await this.ensureAuthenticated();
            const retryError = new Error('Retry attempt') as Error & { isRetry: boolean };
            retryError.isRetry = true;
            return await requestFn();
          } catch (retryError) {
            const parsedRetryError = parseDirectusError(retryError);
            logDirectusError(parsedRetryError, 'safeRequest:retry');
            return fallback;
          }
        }
        
        // For all other errors, use fallback
        return fallback;
      }
    } catch (error: unknown) {
      // Parse and log the error properly
      const parsedError = parseDirectusError(error);
      logDirectusError(parsedError, 'safeRequest');
      
      // Return fallback for any unexpected errors
      return fallback;
    }
  }
  static async getSettingsItem(): Promise<{
    site_title: string;
    site_description: string;
    [key: string]: string | number | boolean | null | undefined;
  }> {
    try {
      await this.ensureAuthenticated();
      
      // Default fallback values
      const defaultSettings = {
        site_title: 'Keyprog',
        site_description: 'Soluções Automóveis',
        project_name: 'Keyprog',
        project_descriptor: 'Soluções Automóveis'
      };

      try {
        // For now, just return default settings to avoid API issues
        return defaultSettings;
      } catch (settingsError) {
        console.warn('Failed to fetch system settings, using defaults:', settingsError);
        
        // Fallback to default values if settings can't be fetched
        return {
          site_title: 'Keyprog',
          site_description: 'Soluções Automóveis',
          project_name: 'Keyprog',
          project_descriptor: 'Soluções Automóveis'
        };
      }
    } catch (error) {
      console.error('❌ Error in getSettingsItem:', {
        message: error.message,
        status: error?.response?.status,
        data: error?.data
      });
      
      // Return default values in case of any error
      return {
        site_title: 'Keyprog',
        site_description: 'Soluções Automóveis',
        project_name: 'Keyprog',
        project_descriptor: 'Soluções Automóveis'
      };
      return null;
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

    try {
      await this.ensureAuthenticated();
      let token = await this.getToken();
      if (!token) {
        token = import.meta.env.VITE_DIRECTUS_TOKEN;
      }

      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/hero?_=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Only use fallback for server errors (500+) or network issues
        // For auth errors (401, 403), throw so we know auth is broken
        if (response.status >= 500) {
          console.error(`Server error ${response.status}, using fallback`);
          return fallback;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      // Only use fallback for network errors (Directus down)
      // Re-throw auth and other errors so they're visible
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ Network error - Directus appears to be down, using fallback:', error);
        return fallback;
      }
      console.error('❌ Error fetching hero data:', error);
      throw error; // Re-throw so calling code knows there's a problem
    }
  }

  static async updateHero(data: Partial<DirectusHero>): Promise<DirectusHero> {
    try {
      await this.ensureAuthenticated();
      
      // CRITICAL: When in Visual Editor, we need a token with WRITE permissions
      // Static tokens are read-only, so we must use session auth
      let token;
      
      if (this.isInDirectusEditor) {
        // In Visual Editor - try to get session token first
        token = await sessionDirectus.getToken();
        if (token) {
          console.log('🔑 Using session token for Visual Editor write operation');
          console.log('🔍 Token preview:', token.substring(0, 20) + '...');
        } else if (this.parentToken) {
          console.log('🔑 Using parent token for Visual Editor write operation');
          console.log('🔍 Token preview:', this.parentToken.substring(0, 20) + '...');
          token = this.parentToken;
        } else {
          console.warn('⚠️ No write-capable token available in Visual Editor');
          throw new Error('No authentication token with write permissions available');
        }
      } else {
        // Not in Visual Editor - use regular directus client
        token = await sessionDirectus.getToken();
        if (!token) {
          token = import.meta.env.VITE_DIRECTUS_TOKEN;
        }
      }
      
      console.log('🔄 Updating hero singleton with data:', data);
      console.log('🌐 API URL:', import.meta.env.VITE_DIRECTUS_URL);
      
      const body = JSON.stringify(data);
      console.log('Request body:', body);

      // Use direct fetch to ensure update persists
      const updateResponse = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/hero`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update hero');
      }
      
      const updatedHero = await updateResponse.json();
      console.log('✅ API Response:', updatedHero.data);
      
      // Verify the update by fetching again with cache busting
      await new Promise(resolve => setTimeout(resolve, 1000));
      const verifyResponse = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/hero?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('🔍 Verification fetch:', verifyData.data);
        
        // Check if the data actually persisted - only verify the fields we updated
        const persistedCorrectly = Object.keys(data).every(key => {
          const expected = data[key];
          const actual = verifyData.data[key];
          const matches = expected === actual;
          if (!matches) {
            console.warn(`⚠️ Field '${key}' mismatch:`, { expected, actual });
          }
          return matches;
        });
        
        if (!persistedCorrectly) {
          console.warn('⚠️ Data verification failed - update may not have persisted');
          console.warn('Expected fields:', data);
          console.warn('Got from server:', Object.fromEntries(
            Object.keys(data).map(key => [key, verifyData.data[key]])
          ));
        } else {
          console.log('✅ Data verified - update persisted correctly');
        }
        
        return verifyData.data;
      }
      
      // If verification fails, still return the update response
      return updatedHero.data;
    } catch (error) {
      console.error('❌ Error updating hero:', error);
      console.error('Error details:', {
        message: error.message,
        status: error?.response?.status,
        data: error?.response?.data || error?.data
      });
      throw error;
    }
  }

  static async getPages(): Promise<Record<string, unknown>[]> {
    try {
      await this.ensureAuthenticated();
      const pages = await directus.request(readItems('pages' as const));
      return pages;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  static async getPage(slug: string): Promise<Record<string, unknown> | null> {
    try {
      const pages = await directus.request(
        readItems('pages' as const, {
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
          { title: 'Reprogramação ECU', url: '/servicos/reprogramacao' },
          { title: 'Desbloqueio', url: '/servicos/desbloqueio' },
          { title: 'Clonagem', url: '/servicos/clonagem' },
          { title: 'Diagnóstico', url: '/servicos/diagnostico' },
          { title: 'Airbag', url: '/servicos/airbag' },
          { title: 'AdBlue', url: '/servicos/adblue' },
          { title: 'Chaves', url: '/servicos/chaves' },
          { title: 'Quadrantes', url: '/servicos/quadrantes' }
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
      
      // Try without sort first to avoid permission issues
      try {
        const headerMenu = await client.request(readItems('header_menu', {
          filter: {
            _or: [
              { status: { _eq: 'published' } },
              { status: { _null: true } } // Include items with no status
            ]
          }
        }));
        
        if (headerMenu?.length) {
          // Sort items by sort field if it exists, otherwise keep original order
          const sortedMenu = [...headerMenu].sort((a, b) => {
            const aSort = typeof a.sort === 'number' ? a.sort : 0;
            const bSort = typeof b.sort === 'number' ? b.sort : 0;
            return aSort - bSort;
          });
          
          return sortedMenu.map(item => ({
            ...item,
            sub_menu: this.normalizeSubMenu(item.sub_menu)
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching header menu:', error);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch header menu from Directus:', error);
      return [];
    }
  }

  // Get sub-menu content by category and slug
  static async getSubMenuContent(category: SubMenuCategory, slug: string): Promise<DirectusSubMenuContent | null> {
    try {
      await this.ensureAuthenticated();
      const content = await directus.request(
        readItems('sub_menu_content' as const, {
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
  static async getSubMenuContentByCategory(category: SubMenuCategory): Promise<DirectusSubMenuContent[]> {
    try {
      await this.ensureAuthenticated();
      const content = await directus.request(
        readItems('sub_menu_content' as const, {
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
  private static normalizeSubMenu(subMenu: unknown): Array<{
    title: string;
    link: string;
    status?: 'draft' | 'published' | 'archived';
    target?: string;
  }> | undefined {
    if (!subMenu) return undefined;
    
    // If it's already an array (from JSON field), filter out archived items
    if (Array.isArray(subMenu)) {
      return subMenu.filter(item => {
        // Skip if item is not an object or missing required fields
        if (!item || typeof item !== 'object' || !('title' in item) || !('link' in item)) {
          return false;
        }
        // Filter out archived items
        return item.status !== 'archived';
      }) as Array<{
        title: string;
        link: string;
        status?: 'draft' | 'published' | 'archived';
        target?: string;
      }>;
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
      
      // Use custom fetch with cache-busting to prevent stale data
      const token = await this.getToken() || import.meta.env.VITE_DIRECTUS_TOKEN;
      const response = await fetch(
        `${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}/${id}?_=${Date.now()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${collection} item: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data as Record<string, unknown>;
    } catch (error) {
      console.error(`Error fetching ${collection} item:`, error);
      throw error;
    }
  }
  
  // Get contact information
  static async getContactInfo(): Promise<DirectusContactInfo> {
    const fallback: DirectusContactInfo = {
      id: '1',
      title: 'Como Podemos Ajudar?',
      email: 'suporte@keyprog.pt',
      phone: '+351 964 463 161',
      chat_hours: 'Seg-Sex: 9h-18h',
      contact_form_text: 'Formulário de Contacto',
      contact_form_link: '/contactos'
    };

    return this.safeRequest(
      async () => {
        const client = this.isInDirectusEditor && this.editorDirectusClient 
          ? this.editorDirectusClient 
          : directus;
        
        try {
          // First try to get as a singleton (preferred approach)
          try {
            const contactInfo = await client.request(readSingleton('contact_info'));
            return contactInfo as unknown as DirectusContactInfo;
          } catch (singletonError) {
            // If singleton approach fails, try as a regular item
            const parsedError = parseDirectusError(singletonError);
            
            // Only log if it's not a 404 (not found) error
            if (parsedError.type !== DirectusErrorType.NOT_FOUND) {
              logDirectusError(parsedError, 'getContactInfo:singleton');
            }
            
            // Try as regular item
            // @ts-expect-error - Explicitly using contact_info collection
            const contactInfo = await client.request(readItem('contact_info', '1'));
            return contactInfo as unknown as DirectusContactInfo;
          }
        } catch (error) {
          const parsedError = parseDirectusError(error);
          logDirectusError(parsedError, 'getContactInfo');
          throw error; // Rethrow for fallback handling
        }
      },
      fallback
    );
  }

  static async updateCollectionItem(collection: string, id: string | number, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      await this.ensureAuthenticated();
      
      let token = await this.getToken();
      if (!token) {
        // Fallback to static token if no session token is available
        token = import.meta.env.VITE_DIRECTUS_TOKEN;
      }

      if (!token) {
        throw new Error('No authentication token available for update operation');
      }

      const apiUrl = `${import.meta.env.VITE_DIRECTUS_URL}/items/${collection}/${id}`;
      console.log(`🔄 Updating ${collection} item #${id} at ${apiUrl}`);
      
      const body = JSON.stringify(data);
      console.log('Request body:', body);

      const updateResponse = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: body
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          console.error(`❌ Failed to update ${collection} item. Server response:`, errorData);
          throw new Error(errorData.errors?.[0]?.message || `Failed to update item. Status: ${updateResponse.status}`);
        } catch (e) {
          console.error(`❌ Failed to update ${collection} item. Non-JSON response:`, errorText);
          throw new Error(`Failed to update item. Status: ${updateResponse.status}, Response: ${errorText}`);
        }
      }

      const updatedItem = await updateResponse.json();
      console.log('✅ API Response:', updatedItem.data);

      // Verification step with cache-busting to ensure data persisted
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s for DB + cache to update
      const verifyResponse = await fetch(`${apiUrl}?_=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const persistedCorrectly = Object.keys(data).every(key => {
          const expected = data[key];
          const actual = verifyData.data[key];
          if (expected !== actual) {
            console.warn(`⚠️ Field '${key}' mismatch after update:`, { expected, actual });
          }
          return expected === actual;
        });

        if (persistedCorrectly) {
          console.log(`✅ Data for ${collection} item #${id} verified - update persisted correctly.`);
        } else {
          console.warn(`⚠️ Data verification failed for ${collection} item #${id}. The update may not have persisted correctly.`);
        }
        return verifyData.data;
      }

      return updatedItem.data;
    } catch (error) {
      console.error(`❌ Error in updateCollectionItem for ${collection} item #${id}:`, error);
      throw error; // Re-throw the error to make it visible to the calling component
    }
  }

  static async createCollectionItem(collection: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      await this.ensureAuthenticated();
      const newItem = await directus.request(
        // @ts-expect-error - Dynamic collection access
        createItem(collection, data)
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
        // @ts-expect-error - Dynamic collection access
        directusDeleteItem(collection, id)
      );
    } catch (error) {
      console.error(`Error deleting ${collection} item:`, error);
      throw error;
    }
  }

  // Create new user (for registration) - creates user with draft status
  static async createUser(userData: Record<string, unknown>): Promise<User> {
    try {
      // Use admin token to create user with draft status
      const adminToken = import.meta.env.VITE_DIRECTUS_TOKEN;
      
      // Create user with status='draft' (unverified)
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role, // Cliente role
          status: 'draft', // Unverified until email is confirmed
          email_notifications: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create user');
      }

      const result = await response.json();
      const newUser = result.data;

      // Email is now sent automatically by Directus Flow
      console.log('✅ User created, verification email will be sent by Directus Flow');

      return newUser as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Resend verification email - Note: Emails are sent automatically by Directus Flow
  // This function just validates the user exists and provides helpful information
  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      const adminToken = import.meta.env.VITE_DIRECTUS_TOKEN;
      const directusUrl = import.meta.env.VITE_DIRECTUS_URL;
      
      // Check if user exists and is unverified
      const getUserResponse = await fetch(
        `${directusUrl}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,first_name,status`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (!getUserResponse.ok) {
        throw new Error('Failed to lookup user');
      }

      const userData = await getUserResponse.json();
      
      if (!userData.data || userData.data.length === 0) {
        throw new Error('User not found with this email. Please register first.');
      }

      const user = userData.data[0];

      // Check if user is already verified
      if (user.status === 'active') {
        throw new Error('Email already verified! You can login now.');
      }

      // User exists and is unverified - provide helpful information
      console.log('📧 Verification email was sent during registration');
      console.log('💡 Check MailHog at: http://localhost:8025');
      console.log('⚠️  If email not received, the Directus Flow may need to be configured');
      console.log('👤 User ID:', user.id);
      
      // In production, you would trigger the Flow again here or use a dedicated resend endpoint
      // For now, just inform the user to check their email
    } catch (error) {
      console.error('⚠️ Resend verification error:', error);
      throw error;
    }
  }

  // Upload files to Directus
  static async uploadFiles(files: File[]): Promise<string[]> {
    try {
      const token = await sessionDirectus.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const uploadedFileIds: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || `Failed to upload file: ${file.name}`);
        }

        const result = await response.json();
        if (result.data && result.data.id) {
          uploadedFileIds.push(result.data.id);
        }
      }

      return uploadedFileIds;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  // Update user's File_service field with uploaded file IDs
  static async updateUserFileService(userId: string, fileIds: string[]): Promise<void> {
    try {
      const token = await sessionDirectus.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // File_service is a FILES relation (alias field)
      // We need to create junction records in junction_directus_users_files
      const junctionRecords = fileIds.map(fileId => ({
        directus_users_id: userId,
        directus_files_id: fileId
      }));

      // Create junction records
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/junction_directus_users_files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(junctionRecords)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating junction records:', errorData);
        throw new Error(errorData.errors?.[0]?.message || 'Failed to associate files with user');
      }

      console.log('✅ Successfully associated files with user');
    } catch (error) {
      console.error('Error updating user File_service:', error);
      throw error;
    }
  }

  // Logout user and clear session
  static async logout(): Promise<void> {
    try {
      // Clear session token using SDK
      if ('logout' in sessionDirectus && typeof sessionDirectus.logout === 'function') {
        await (sessionDirectus as { logout: () => Promise<void> }).logout();
      }
      
      // Reset internal authentication state
      this.isAuthenticated = false;
      this.useStaticToken = false;
      this.parentToken = null;
      this.editorDirectusClient = null;
      this.authPromise = null;
      this.initPromise = null;
      
      // Clear stored session token and credentials
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('directus_session_token');
        localStorage.removeItem('directus_auth_email');
        localStorage.removeItem('directus_auth_password');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      this.isAuthenticated = false;
      this.useStaticToken = false;
      this.parentToken = null;
      this.editorDirectusClient = null;
      
      // Force clear localStorage even on error
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('directus_session_token');
        localStorage.removeItem('directus_auth_email');
        localStorage.removeItem('directus_auth_password');
      }
    }
  }

  // Get current authentication token
  static async getToken(): Promise<string | null> {
    try {
      return await sessionDirectus.getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
}