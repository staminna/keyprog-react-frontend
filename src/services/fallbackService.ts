import type { 
  DirectusSettings,
  DirectusHeaderMenu,
  DirectusFooterMenu,
  DirectusServices,
  DirectusCategories,
  DirectusNews,
  DirectusContacts,
  DirectusHero,
  DirectusSubMenuContent,
  DirectusProduct
} from '@/lib/directus';

// Fallback data for when Directus is down
export class FallbackService {
  // Fallback settings
  static getSettings(): DirectusSettings {
    return {
      logo: null,
      site_name: 'Keyprog',
      site_description: 'Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.',
      contact_email: 'info@keyprog.com',
      contact_phone: '+351 123 456 789',
      social_facebook: 'https://facebook.com/keyprog',
      social_instagram: 'https://instagram.com/keyprog',
      social_youtube: 'https://youtube.com/keyprog',
      footer_text: '© 2025 Keyprog. Todos os direitos reservados.'
    } as DirectusSettings;
  }

  // Fallback hero section
  static getHero(): DirectusHero {
    return {
      title: "Performance, diagnóstico e soluções para a sua centralina",
      subtitle: "Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.",
      primary_button_text: "Ver Serviços",
      primary_button_link: "/servicos",
      secondary_button_text: "Contacte-nos",
      secondary_button_link: "/contactos",
      background_image: null
    } as DirectusHero;
  }

  // Fallback header menu
  static getHeaderMenu(): DirectusHeaderMenu[] {
    return [
      {
        id: '1',
        title: 'Início',
        link: '/'
      },
      {
        id: '2',
        title: 'Serviços',
        link: '/servicos',
        sub_menu: [
          { title: 'Reprogramação ECU', link: '/servicos/reprogramacao-ecu' },
          { title: 'Desbloqueio', link: '/servicos/desbloqueio' },
          { title: 'Clonagem', link: '/servicos/clonagem' },
          { title: 'Diagnóstico', link: '/servicos/diagnostico' }
        ]
      },
      {
        id: '3',
        title: 'Produtos',
        link: '/produtos',
        sub_menu: [
          { title: 'Emuladores', link: '/produtos/emuladores' },
          { title: 'Equipamentos', link: '/produtos/equipamentos' },
          { title: 'Software', link: '/produtos/software' },
          { title: 'Acessórios', link: '/produtos/acessorios' }
        ]
      },
      {
        id: '4',
        title: 'Notícias',
        link: '/noticias'
      },
      {
        id: '5',
        title: 'Sobre',
        link: '/sobre'
      },
      {
        id: '6',
        title: 'Contactos',
        link: '/contactos'
      }
    ] as DirectusHeaderMenu[];
  }

  // Fallback footer menu
  static getFooterMenu(): DirectusFooterMenu[] {
    return [
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
    ] as DirectusFooterMenu[];
  }

  // Fallback services
  static getServices(): DirectusServices[] {
    return [
      {
        id: "1",
        title: "Reprogramação de Centralinas",
        description: "Otimização e personalização do desempenho do seu veículo",
        slug: "reprogramacao-centralinas",
        image: null,
        status: "published"
      },
      {
        id: "2", 
        title: "Diagnóstico Avançado",
        description: "Identificação precisa de problemas eletrónicos",
        slug: "diagnostico-avancado",
        image: null,
        status: "published"
      },
      {
        id: "3",
        title: "Clonagem de Centralinas", 
        description: "Duplicação segura de configurações",
        slug: "clonagem-centralinas",
        image: null,
        status: "published"
      }
    ] as DirectusServices[];
  }

  // Fallback service by slug
  static getService(slug: string): DirectusServices | null {
    return this.getServices().find(service => service.slug === slug) || null;
  }

  // Fallback products
  static getProducts(): DirectusProduct[] {
    return [
      { 
        id: "1",
        name: "ECU Programmer Pro", 
        description: "Professional ECU programming tool for all vehicle makes and models", 
        price: 599.99, 
        status: "published", 
        category: "1",
        slug: "ecu-programmer-pro",
        inventory_count: 15,
        featured: true
      },
      { 
        id: "2",
        name: "OBD-II Scanner", 
        description: "Advanced OBD-II diagnostic scanner with Bluetooth connectivity", 
        price: 149.99, 
        status: "published", 
        category: "2",
        slug: "obd-ii-scanner",
        inventory_count: 30,
        featured: false
      },
      { 
        id: "3",
        name: "Keyprog Software Suite", 
        description: "Complete software suite for ECU programming and diagnostics", 
        price: 299.99, 
        status: "published", 
        category: "4",
        slug: "keyprog-software-suite",
        inventory_count: 100,
        featured: true
      },
      { 
        id: "4",
        name: "CAN Bus Analyzer", 
        description: "Professional tool for analyzing CAN bus communications", 
        price: 249.99, 
        status: "published", 
        category: "3",
        slug: "can-bus-analyzer",
        inventory_count: 20,
        featured: false
      }
    ];
  }

  // Fallback product by id
  static getProduct(id: string): DirectusProduct | null {
    return this.getProducts().find(product => product.id === id) || null;
  }

  // Fallback categories
  static getCategories(): DirectusCategories[] {
    return [
      {
        id: "1",
        title: "ECU Programming",
        slug: "ecu-programming",
        image: null
      },
      {
        id: "2",
        title: "Diagnostic Tools",
        slug: "diagnostic-tools",
        image: null
      },
      {
        id: "3",
        title: "Automotive Electronics",
        slug: "automotive-electronics",
        image: null
      },
      {
        id: "4",
        title: "Software",
        slug: "software",
        image: null
      }
    ] as DirectusCategories[];
  }

  // Fallback category by slug
  static getCategory(slug: string): DirectusCategories | null {
    return this.getCategories().find(category => category.slug === slug) || null;
  }

  // Fallback news
  static getNews(): DirectusNews[] {
    return [
      {
        id: "1",
        title: "Nova Versão do Software Keyprog",
        content: "<p>Lançámos uma nova versão do nosso software com melhorias significativas na interface e novas funcionalidades.</p>",
        summary: "Nova versão do software Keyprog com melhorias na interface e novas funcionalidades.",
        published_date: "2025-08-15",
        status: "published",
        image: null
      },
      {
        id: "2",
        title: "Workshop de Diagnóstico Avançado",
        content: "<p>Vamos realizar um workshop sobre diagnóstico avançado de veículos no próximo mês. Inscreva-se já!</p>",
        summary: "Workshop sobre diagnóstico avançado de veículos no próximo mês.",
        published_date: "2025-08-10",
        status: "published",
        image: null
      }
    ] as DirectusNews[];
  }

  // Fallback news item by id
  static getNewsItem(id: string): DirectusNews | null {
    return this.getNews().find(news => news.id === id) || null;
  }

  // Fallback contacts
  static getContacts(): DirectusContacts[] {
    return [
      {
        id: "1",
        phone: "+351 123 456 789",
        email: "info@keyprog.com"
      },
      {
        id: "2",
        phone: "+351 987 654 321",
        email: "porto@keyprog.com"
      }
    ] as DirectusContacts[];
  }

  // Fallback sub-menu content
  static getSubMenuContent(category: string, slug: string): DirectusSubMenuContent | null {
    const allContent = this.getAllSubMenuContent();
    return allContent.find(content => content.category === category && content.slug === slug) || null;
  }

  // Fallback sub-menu content by category
  static getSubMenuContentByCategory(category: string): DirectusSubMenuContent[] {
    const allContent = this.getAllSubMenuContent();
    return allContent.filter(content => content.category === category);
  }

  // All fallback sub-menu content
  private static getAllSubMenuContent(): DirectusSubMenuContent[] {
    return [
      {
        id: "1",
        title: "Reprogramação ECU",
        content: "<h2>Reprogramação ECU</h2><p>Serviço especializado de reprogramação de unidades de controlo eletrónico.</p>",
        category: "servicos",
        slug: "reprogramacao-ecu",
        status: "published",
        sort: 1
      },
      {
        id: "2",
        title: "Desbloqueio",
        content: "<h2>Desbloqueio</h2><p>Serviços de desbloqueio de centralinas e sistemas eletrónicos.</p>",
        category: "servicos",
        slug: "desbloqueio",
        status: "published",
        sort: 2
      },
      {
        id: "3",
        title: "Emuladores",
        content: "<h2>Emuladores</h2><p>Emuladores de alta qualidade para diversos sistemas automotivos.</p>",
        category: "loja",
        slug: "emuladores",
        status: "published",
        sort: 1
      },
      {
        id: "4",
        title: "Equipamentos",
        content: "<h2>Equipamentos</h2><p>Equipamentos profissionais para diagnóstico e programação.</p>",
        category: "loja",
        slug: "equipamentos",
        status: "published",
        sort: 2
      }
    ] as DirectusSubMenuContent[];
  }

  // Fallback orders
  static getOrders(): Record<string, unknown>[] {
    return [
      { 
        id: "1",
        customer: 1, 
        status: "delivered", 
        total: 749.98, 
        payment_status: "paid",
        date_created: "2025-08-01T10:30:00Z",
        date_updated: "2025-08-02T14:15:00Z"
      },
      { 
        id: "2",
        customer: 2, 
        status: "processing", 
        total: 299.99, 
        payment_status: "paid",
        date_created: "2025-08-10T15:45:00Z",
        date_updated: "2025-08-10T16:00:00Z"
      }
    ];
  }

  // Fallback order by id
  static getOrder(id: string): Record<string, unknown> | null {
    return this.getOrders().find(order => order.id === id) || null;
  }

  // Fallback customers
  static getCustomers(): Record<string, unknown>[] {
    return [
      { 
        id: "1",
        first_name: "John", 
        last_name: "Doe", 
        email: "john.doe@example.com", 
        phone: "+1234567890", 
        address: "123 Main St, Anytown, USA",
        date_created: "2025-07-15T09:20:00Z"
      },
      { 
        id: "2",
        first_name: "Jane", 
        last_name: "Smith", 
        email: "jane.smith@example.com", 
        phone: "+1987654321", 
        address: "456 Oak Ave, Somewhere, USA",
        date_created: "2025-07-20T14:30:00Z"
      }
    ];
  }

  // Fallback customer by id
  static getCustomer(id: string): Record<string, unknown> | null {
    return this.getCustomers().find(customer => customer.id === id) || null;
  }

  // Fallback order items
  static getOrderItems(): Record<string, unknown>[] {
    return [
      { id: "1", order: 1, product: 1, quantity: 1, price: 599.99 },
      { id: "2", order: 1, product: 2, quantity: 1, price: 149.99 },
      { id: "3", order: 2, product: 3, quantity: 1, price: 299.99 }
    ];
  }

  // Fallback order items by order id
  static getOrderItemsByOrder(orderId: string): Record<string, unknown>[] {
    return this.getOrderItems().filter(item => item.order.toString() === orderId);
  }
}
