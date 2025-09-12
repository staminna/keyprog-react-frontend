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
      description: 'Serviço especializado de reprogramação de centralinas para otimização de desempenho',
      content: `<h2>Reprogramação Profissional de ECU</h2>
<p>A nossa equipa de especialistas utiliza as mais avançadas tecnologias para reprogramar centralinas eletrónicas de veículos, oferecendo melhorias significativas em desempenho, economia de combustível e dirigibilidade.</p>

<h3>Benefícios da Reprogramação:</h3>
<ul>
  <li><strong>Aumento de potência</strong> - Otimização dos mapas de injeção e ignição para extrair mais potência do motor.</li>
  <li><strong>Maior torque</strong> - Melhoria na curva de torque para uma condução mais agradável e responsiva.</li>
  <li><strong>Economia de combustível</strong> - Ajustes nos parâmetros de combustão para melhorar a eficiência energética.</li>
  <li><strong>Melhor resposta do acelerador</strong> - Eliminação de atrasos na resposta do acelerador para uma condução mais precisa.</li>
  <li><strong>Remoção de limitações de fábrica</strong> - Eliminação de restrições impostas pelo fabricante que limitam o desempenho.</li>
</ul>

<h3>Tipos de Reprogramação:</h3>
<ul>
  <li><strong>Stage 1</strong> - Otimização básica sem modificações de hardware, ideal para veículos de série.</li>
  <li><strong>Stage 2</strong> - Reprogramação avançada para veículos com modificações moderadas (filtro de ar, escape, etc.).</li>
  <li><strong>Stage 3</strong> - Reprogramação completa para veículos com modificações significativas de hardware.</li>
  <li><strong>Reprogramação Específica</strong> - Soluções personalizadas para necessidades específicas (economia, desempenho, etc.).</li>
</ul>

<h3>Nosso Processo:</h3>
<ol>
  <li>Avaliação inicial do veículo e das suas necessidades</li>
  <li>Backup completo da programação original (para possível restauração)</li>
  <li>Leitura e análise dos mapas da centralina</li>
  <li>Desenvolvimento de mapas personalizados para o seu veículo</li>
  <li>Reprogramação da centralina com os novos mapas</li>
  <li>Testes extensivos para garantir estabilidade e desempenho</li>
  <li>Ajustes finais com base nos resultados dos testes</li>
</ol>

<p>Trabalhamos com todas as marcas e modelos, garantindo resultados seguros e eficientes. Cada reprogramação é personalizada para o seu veículo específico, considerando modificações existentes e objetivos de desempenho.</p>

<h3>Garantia de Satisfação</h3>
<p>Oferecemos garantia em todos os nossos serviços de reprogramação e a possibilidade de restaurar a programação original a qualquer momento, se desejado.</p>

<p>Agende já a reprogramação da centralina do seu veículo e experimente uma nova dimensão de desempenho e eficiência!</p>`,
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'reparacao': {
      title: 'Reparação de Centralinas',
      description: 'Serviços especializados de reparação e recuperação de centralinas danificadas',
      content: `<h2>Reparação Profissional de Centralinas</h2>
<p>Oferecemos serviços especializados de reparação e recuperação de centralinas danificadas para todos os tipos de veículos, com garantia de qualidade e eficiência.</p>

<h3>Serviços de Reparação:</h3>
<ul>
  <li><strong>Reparação de centralinas com danos elétricos</strong> - Identificamos e substituímos componentes eletrónicos danificados, restaurando o funcionamento da centralina.</li>
  <li><strong>Recuperação de centralinas com problemas de software</strong> - Corrigimos erros de software, atualizamos firmware e restauramos configurações corrompidas.</li>
  <li><strong>Substituição de componentes danificados</strong> - Substituímos microprocessadores, memórias, transistores e outros componentes com tecnologia de ponta.</li>
  <li><strong>Restauração de backups e configurações</strong> - Recuperamos dados e configurações importantes para garantir o funcionamento correto após a reparação.</li>
  <li><strong>Reparação de imobilizadores e sistemas de segurança</strong> - Solucionamos problemas em sistemas de imobilização e segurança do veículo.</li>
</ul>

<h3>Vantagens do nosso serviço:</h3>
<ul>
  <li>Economia significativa em comparação com a substituição completa da centralina</li>
  <li>Manutenção das configurações originais do veículo</li>
  <li>Reparação rápida e eficiente, minimizando o tempo de inatividade do veículo</li>
  <li>Garantia em todos os serviços realizados</li>
  <li>Suporte técnico pós-reparação</li>
</ul>

<h3>Processo de Reparação:</h3>
<ol>
  <li>Diagnóstico completo da centralina para identificar todos os problemas</li>
  <li>Desmontagem cuidadosa e inspeção detalhada dos componentes</li>
  <li>Backup dos dados e configurações (quando possível)</li>
  <li>Reparação ou substituição dos componentes danificados</li>
  <li>Testes rigorosos para garantir o funcionamento correto</li>
  <li>Reinstalação e configuração no veículo</li>
  <li>Verificação final de todos os sistemas afetados</li>
</ol>

<p>Confie a reparação da centralina do seu veículo a especialistas com anos de experiência e equipamentos de última geração. Contacte-nos hoje mesmo para obter um orçamento personalizado.</p>`,
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
      title: 'Diagnóstico Avançado',
      description: 'Serviço especializado de diagnóstico para veículos de todas as marcas',
      content: `<h2>Diagnóstico Avançado de Veículos</h2>
<p>O nosso serviço de diagnóstico avançado utiliza equipamentos de última geração para identificar com precisão problemas em centralinas e sistemas eletrónicos automotivos.</p>

<h3>O que oferecemos:</h3>
<ul>
  <li><strong>Leitura e interpretação de códigos de erro</strong> - Identificamos e interpretamos todos os códigos de erro armazenados na centralina do seu veículo.</li>
  <li><strong>Diagnóstico completo de sistemas eletrónicos</strong> - Analisamos todos os sistemas eletrónicos do veículo para identificar falhas e anomalias.</li>
  <li><strong>Análise de desempenho e eficiência</strong> - Avaliamos o desempenho e a eficiência do motor e outros sistemas críticos.</li>
  <li><strong>Verificação de compatibilidade de componentes</strong> - Garantimos que todos os componentes eletrónicos estão a funcionar em harmonia.</li>
  <li><strong>Testes em tempo real</strong> - Realizamos testes dinâmicos para identificar problemas que só ocorrem durante o funcionamento do veículo.</li>
</ul>

<h3>Por que escolher o nosso serviço de diagnóstico?</h3>
<p>Os nossos técnicos especializados são capazes de identificar problemas complexos que muitas vezes passam despercebidos em diagnósticos convencionais, garantindo soluções eficazes para o seu veículo.</p>

<p>Trabalhamos com todas as marcas e modelos, utilizando equipamentos profissionais e software atualizado para garantir diagnósticos precisos e completos.</p>

<h3>Processo de Diagnóstico</h3>
<ol>
  <li>Análise inicial e recolha de informações sobre o problema</li>
  <li>Conexão do equipamento de diagnóstico à centralina do veículo</li>
  <li>Leitura e análise de códigos de erro</li>
  <li>Testes específicos nos sistemas afetados</li>
  <li>Elaboração de relatório detalhado com as anomalias encontradas</li>
  <li>Recomendação de soluções e orçamento para reparação</li>
</ol>

<p>Não deixe que problemas eletrónicos comprometam o desempenho e a segurança do seu veículo. Agende já o seu diagnóstico avançado e conte com a nossa experiência para identificar e resolver qualquer problema.</p>`,
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
