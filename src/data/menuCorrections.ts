/**
 * Menu corrections for Portuguese menus
 * Fixes incorrect paths and empty content
 */

export const headerMenuCorrections = [
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
    title: 'Loja',
    link: '/loja',
    sub_menu: [
      { title: 'Emuladores', link: '/loja/emuladores' },
      { title: 'Equipamentos', link: '/loja/equipamentos' },
      { title: 'Software', link: '/loja/software' },
      { title: 'Acessórios', link: '/loja/acessorios' }
    ]
  },
  {
    id: '4',
    title: 'Notícias',
    link: '/noticias'
  },
  {
    id: '5',
    title: 'Suporte',
    link: '/suporte',
    sub_menu: [
      { title: 'FAQ', link: '/suporte/faq' },
      { title: 'Contactos', link: '/contactos' },
      { title: 'Serviço de Arquivos', link: '/file-service' },
      { title: 'Simulador', link: '/simulador' }
    ]
  },
  {
    id: '6',
    title: 'Contactos',
    link: '/contactos'
  }
];

export const footerMenuCorrections = [
  {
    id: '1',
    title: 'Serviços',
    links: [
      { title: 'Reprogramação ECU', url: '/servicos/reprogramacao-ecu' },
      { title: 'Desbloqueio', url: '/servicos/desbloqueio' },
      { title: 'Clonagem', url: '/servicos/clonagem' },
      { title: 'Diagnóstico', url: '/servicos/diagnostico' }
    ]
  },
  {
    id: '2',
    title: 'Loja',
    links: [
      { title: 'Emuladores', url: '/loja/emuladores' },
      { title: 'Equipamentos', url: '/loja/equipamentos' },
      { title: 'Software', url: '/loja/software' },
      { title: 'Acessórios', url: '/loja/acessorios' }
    ]
  },
  {
    id: '3',
    title: 'Suporte',
    links: [
      { title: 'Contactos', url: '/contactos' },
      { title: 'Serviço de Arquivos', url: '/file-service' },
      { title: 'Simulador', url: '/simulador' },
      { title: 'FAQ', url: '/suporte/faq' }
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

// Default not found message in Portuguese
export const DEFAULT_NOT_FOUND_MESSAGE = "Conteúdo não encontrado. O conteúdo solicitado não foi encontrado ou não está disponível.";

// Submenu content corrections
export const subMenuContentCorrections = {
  'loja': {
    'emuladores': {
      title: 'Emuladores',
      description: 'Emuladores de alta qualidade para diversas aplicações',
      content: '<p>Nossa seleção de emuladores de alta qualidade para diversas aplicações automotivas.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'equipamentos': {
      title: 'Equipamentos',
      description: 'Equipamentos profissionais para diagnóstico e programação',
      content: '<p>Equipamentos profissionais para diagnóstico e programação de centralinas.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'software': {
      title: 'Software',
      description: 'Software especializado para reprogramação e diagnóstico',
      content: '<p>Software especializado para reprogramação e diagnóstico de centralinas.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'acessorios': {
      title: 'Acessórios',
      description: 'Acessórios e peças para equipamentos de diagnóstico',
      content: '<p>Acessórios e peças para equipamentos de diagnóstico e programação.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    }
  },
  'servicos': {
    'reprogramacao-ecu': {
      title: 'Reprogramação ECU',
      description: 'Serviço especializado de reprogramação de centralinas',
      content: '<p>Serviço especializado de reprogramação de centralinas para otimização de desempenho.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'desbloqueio': {
      title: 'Desbloqueio',
      description: 'Serviço de desbloqueio de centralinas',
      content: '<p>Serviço de desbloqueio de centralinas para acesso a funcionalidades avançadas.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'clonagem': {
      title: 'Clonagem',
      description: 'Serviço de clonagem de centralinas',
      content: '<p>Serviço de clonagem de centralinas para backup e recuperação de dados.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'diagnostico': {
      title: 'Diagnóstico',
      description: 'Serviço de diagnóstico avançado',
      content: '<p>Serviço de diagnóstico avançado para identificação de problemas em centralinas.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    }
  },
  'suporte': {
    'faq': {
      title: 'Perguntas Frequentes',
      description: 'Respostas para as perguntas mais frequentes',
      content: '<p>Respostas para as perguntas mais frequentes sobre nossos produtos e serviços.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    }
  }
};
