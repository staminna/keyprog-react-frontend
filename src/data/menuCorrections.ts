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
      { title: 'Reprogramação ECU', link: '/servicos/reprogramacao' },
      { title: 'Desbloqueio', link: '/servicos/desbloqueio' },
      { title: 'Clonagem', link: '/servicos/clonagem' },
      { title: 'Diagnóstico', link: '/servicos/diagnostico' },
      { title: 'Reparação', link: '/servicos/reparacao' }
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
      { title: 'Reprogramação ECU', url: '/servicos/reprogramacao' },
      { title: 'Desbloqueio', url: '/servicos/desbloqueio' },
      { title: 'Clonagem', url: '/servicos/clonagem' },
      { title: 'Diagnóstico', url: '/servicos/diagnostico' },
      { title: 'Reparação', url: '/servicos/reparacao' }
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
    'reprogramacao': {
      title: 'Reprogramação ECU',
      description: 'Serviço especializado de reprogramação de centralinas',
      content: '<p>Serviço especializado de reprogramação de centralinas para otimização de desempenho.</p><p>Nossa equipe de especialistas utiliza as mais avançadas tecnologias para reprogramar centralinas eletrônicas de veículos, oferecendo melhorias significativas em desempenho, economia de combustível e dirigibilidade.</p><p>Trabalhamos com todas as marcas e modelos, garantindo resultados seguros e eficientes.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'reparacao': {
      title: 'Reparação de Centralinas',
      description: 'Serviço de reparação e recuperação de centralinas danificadas',
      content: '<p>Oferecemos serviços especializados de reparação e recuperação de centralinas danificadas para todos os tipos de veículos.</p><p>Nossa equipe técnica possui ampla experiência na identificação e correção de falhas em módulos eletrônicos automotivos, incluindo:</p><ul><li>Reparação de centralinas com danos elétricos</li><li>Recuperação de centralinas com problemas de software</li><li>Substituição de componentes danificados</li><li>Restauração de backups e configurações</li></ul><p>Todos os serviços incluem garantia e suporte técnico pós-reparação.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'desbloqueio': {
      title: 'Desbloqueio',
      description: 'Serviço de desbloqueio de centralinas e módulos eletrônicos',
      content: '<p>Nosso serviço de desbloqueio permite acesso a funcionalidades avançadas e remoção de limitações em centralinas e módulos eletrônicos automotivos.</p><p>Realizamos desbloqueios para:</p><ul><li>Acesso a funções ocultas do veículo</li><li>Remoção de limitações de velocidade</li><li>Desbloqueio de centralinas protegidas</li><li>Remoção de bloqueios de imobilizador</li><li>Desbloqueio de rádios e sistemas de entretenimento</li></ul><p>Todos os procedimentos são realizados com segurança, preservando a integridade dos sistemas eletrônicos do veículo e respeitando as normas legais aplicáveis.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'clonagem': {
      title: 'Clonagem',
      description: 'Serviço de clonagem de centralinas e módulos eletrônicos',
      content: '<p>Nosso serviço de clonagem permite criar cópias exatas de centralinas e módulos eletrônicos, garantindo backup seguro de dados e configurações.</p><p>Benefícios do serviço de clonagem:</p><ul><li>Backup completo de dados e configurações</li><li>Substituição de centralinas danificadas sem perda de dados</li><li>Transferência de configurações entre módulos</li><li>Preservação de chaves e códigos de segurança</li><li>Restauração rápida em caso de falhas</li></ul><p>Trabalhamos com equipamentos de última geração para garantir clonagens perfeitas e seguras, mantendo todas as funcionalidades originais do veículo.</p>',
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'diagnostico': {
      title: 'Diagnóstico',
      description: 'Serviço de diagnóstico avançado para identificação de problemas em centralinas',
      content: '<p>Nosso serviço de diagnóstico avançado utiliza equipamentos de última geração para identificar com precisão problemas em centralinas e sistemas eletrônicos automotivos.</p><p>Oferecemos:</p><ul><li>Leitura e interpretação de códigos de erro</li><li>Diagnóstico completo de sistemas eletrônicos</li><li>Análise de desempenho e eficiência</li><li>Verificação de compatibilidade de componentes</li><li>Testes de funcionamento em tempo real</li></ul><p>Nossos técnicos especializados são capazes de identificar problemas complexos que muitas vezes passam despercebidos em diagnósticos convencionais, garantindo soluções eficazes para seu veículo.</p>',
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
