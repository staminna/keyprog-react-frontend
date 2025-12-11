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
      { title: 'Clonagem', link: '/servicos/clonagem' },
      { title: 'Depósito AdBlue', link: '/servicos/adblue' },
      { title: 'Programação Chaves', link: '/servicos/chaves' },
      { title: 'Desbloqueio', link: '/servicos/desbloqueio' },
      { title: 'Airbag Reset', link: '/servicos/airbag' },
      { title: 'Diagnóstico', link: '/servicos/diagnostico' },
      { title: 'Quadrantes', link: '/servicos/quadrantes' },
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
      { title: 'Clonagem', url: '/servicos/clonagem' },
      { title: 'Depósito AdBlue', url: '/servicos/adblue' },
      { title: 'Programação Chaves', url: '/servicos/chaves' },
      { title: 'Desbloqueio', url: '/servicos/desbloqueio' },
      { title: 'Airbag Reset', url: '/servicos/airbag' },
      { title: 'Diagnóstico', url: '/servicos/diagnostico' },
      { title: 'Quadrantes', url: '/servicos/quadrantes' },
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
    },
    'airbag': {
      title: 'Airbag Reset',
      description: 'Serviço especializado de reset e reparação de módulos de airbag',
      content: `<h2>Reset e Reparação de Módulos de Airbag</h2>
<p>Oferecemos serviços especializados de reset, reparação e programação de módulos de airbag para todos os tipos de veículos. Após um acidente ou ativação dos airbags, os módulos ficam bloqueados com códigos de colisão (crash data) que impedem o seu funcionamento normal.</p>

<h3>Serviços de Airbag:</h3>
<ul>
  <li><strong>Reset de Crash Data</strong> - Limpeza dos dados de colisão armazenados no módulo após um acidente, restaurando o funcionamento normal do sistema.</li>
  <li><strong>Reparação de Módulos</strong> - Diagnóstico e reparação de avarias em módulos de airbag danificados.</li>
  <li><strong>Eliminação de Luz de Airbag</strong> - Identificação e resolução de problemas que causam a luz de aviso de airbag no painel.</li>
  <li><strong>Programação de Novos Módulos</strong> - Codificação e adaptação de módulos de airbag novos ou usados ao seu veículo.</li>
  <li><strong>Diagnóstico Completo</strong> - Análise detalhada de todo o sistema SRS (Supplemental Restraint System).</li>
</ul>

<h3>Vantagens do Nosso Serviço:</h3>
<ul>
  <li>Economia significativa em comparação com a substituição completa do módulo</li>
  <li>Processo rápido e eficiente - na maioria dos casos em menos de 24 horas</li>
  <li>Compatibilidade com todas as marcas e modelos</li>
  <li>Garantia em todos os serviços realizados</li>
  <li>Restauração completa das funcionalidades de segurança</li>
</ul>

<h3>Processo de Reset de Airbag:</h3>
<ol>
  <li>Remoção do módulo de airbag do veículo</li>
  <li>Diagnóstico completo para identificar todos os códigos de erro</li>
  <li>Limpeza dos dados de colisão da memória do módulo</li>
  <li>Teste e verificação do funcionamento correto</li>
  <li>Reinstalação no veículo</li>
  <li>Verificação final do sistema SRS completo</li>
</ol>

<h3>Importante:</h3>
<p>O sistema de airbag é um componente crítico de segurança. Após qualquer acidente ou ativação, é essencial garantir que todo o sistema está a funcionar corretamente. Confie este serviço a profissionais especializados para garantir a sua segurança e dos seus passageiros.</p>

<p>Contacte-nos hoje para obter um orçamento gratuito para o reset ou reparação do módulo de airbag do seu veículo.</p>`,
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'adblue': {
      title: 'Soluções AdBlue',
      description: 'Serviços especializados para sistemas AdBlue e SCR',
      content: `<h2>Soluções Profissionais para Sistemas AdBlue</h2>
<p>Oferecemos serviços especializados para sistemas AdBlue (SCR - Selective Catalytic Reduction), resolvendo problemas e avarias que podem imobilizar o seu veículo ou causar limitações de desempenho.</p>

<h3>Serviços AdBlue:</h3>
<ul>
  <li><strong>Diagnóstico de Sistema SCR</strong> - Identificação precisa de avarias no sistema AdBlue, incluindo sensores, bombas, injetores e depósito.</li>
  <li><strong>Reparação de Componentes</strong> - Substituição e reparação de componentes avariados do sistema SCR.</li>
  <li><strong>Reset de Contadores</strong> - Reinicialização de contadores e adaptações após substituição de componentes.</li>
  <li><strong>Emulação de Sistema AdBlue</strong> - Instalação de emuladores homologados para veículos com sistemas irrecuperáveis.</li>
  <li><strong>Limpeza e Manutenção</strong> - Serviços preventivos para evitar avarias no sistema.</li>
</ul>

<h3>Problemas Comuns que Resolvemos:</h3>
<ul>
  <li>Luz de aviso AdBlue acesa no painel</li>
  <li>Mensagens de limitação de velocidade ou arranque</li>
  <li>Consumo excessivo de AdBlue</li>
  <li>Sistema não reconhece o AdBlue adicionado</li>
  <li>Bombas e injetores avariados</li>
  <li>Sensores de nível e qualidade defeituosos</li>
  <li>Cristalização no sistema</li>
</ul>

<h3>Por que o Sistema AdBlue Avaria?</h3>
<p>Os sistemas AdBlue são sensíveis e podem apresentar problemas por diversos motivos:</p>
<ul>
  <li>Qualidade do AdBlue utilizado</li>
  <li>Contaminação do depósito</li>
  <li>Exposição a temperaturas extremas</li>
  <li>Falta de manutenção preventiva</li>
  <li>Percursos curtos frequentes que não permitem a regeneração adequada</li>
</ul>

<h3>Vantagens do Nosso Serviço:</h3>
<ul>
  <li>Diagnóstico preciso com equipamentos de última geração</li>
  <li>Soluções definitivas para problemas recorrentes</li>
  <li>Preços competitivos comparados com concessionários</li>
  <li>Garantia em todos os serviços realizados</li>
  <li>Atendimento rápido para minimizar o tempo de imobilização</li>
</ul>

<h3>Marcas e Modelos:</h3>
<p>Trabalhamos com todas as marcas que utilizam sistemas AdBlue/SCR, incluindo:</p>
<ul>
  <li>Audi, BMW, Mercedes-Benz, Volkswagen, Volvo</li>
  <li>Peugeot, Citroën, Renault, Fiat</li>
  <li>Ford, Opel, Seat, Skoda</li>
  <li>Camiões e veículos comerciais de todas as marcas</li>
</ul>

<p>Não deixe que problemas com o sistema AdBlue imobilizem o seu veículo. Contacte-nos para um diagnóstico e orçamento sem compromisso.</p>`,
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'chaves': {
      title: 'Programação de Chaves',
      description: 'Serviço especializado de programação e duplicação de chaves automóveis',
      content: `<h2>Programação Profissional de Chaves Automóveis</h2>
<p>Oferecemos serviços completos de programação, duplicação e reparação de chaves para veículos de todas as marcas e modelos. Utilizamos equipamentos profissionais e software atualizado para garantir resultados perfeitos.</p>

<h3>Serviços de Chaves:</h3>
<ul>
  <li><strong>Programação de Chaves Novas</strong> - Codificação de chaves originais ou aftermarket para o seu veículo.</li>
  <li><strong>Duplicação de Chaves</strong> - Criação de cópias funcionais de chaves existentes.</li>
  <li><strong>Chaves Perdidas (All Keys Lost)</strong> - Programação de novas chaves quando todas as originais foram perdidas.</li>
  <li><strong>Reparação de Comandos</strong> - Substituição de carcaças, botões e componentes eletrónicos de comandos.</li>
  <li><strong>Programação de Imobilizador</strong> - Sincronização entre chave e sistema de imobilização do veículo.</li>
  <li><strong>Chaves de Proximidade (Keyless)</strong> - Programação de sistemas de acesso e arranque sem chave.</li>
</ul>

<h3>Tipos de Chaves que Trabalhamos:</h3>
<ul>
  <li>Chaves convencionais com transponder</li>
  <li>Comandos com chave integrada</li>
  <li>Cartões de proximidade (Renault, etc.)</li>
  <li>Smart Keys / Keyless Entry</li>
  <li>Chaves de emergência</li>
  <li>Chaves para motas e scooters</li>
</ul>

<h3>Marcas Suportadas:</h3>
<p>Trabalhamos com todas as principais marcas automóveis:</p>
<ul>
  <li><strong>Europeias:</strong> Audi, BMW, Mercedes, Volkswagen, Volvo, Peugeot, Citroën, Renault, Fiat, Seat, Skoda, Opel</li>
  <li><strong>Asiáticas:</strong> Toyota, Honda, Nissan, Mazda, Hyundai, Kia, Suzuki, Mitsubishi</li>
  <li><strong>Americanas:</strong> Ford, Chevrolet, Jeep, Dodge</li>
</ul>

<h3>Vantagens do Nosso Serviço:</h3>
<ul>
  <li>Preços até 70% mais baixos que concessionários oficiais</li>
  <li>Serviço rápido - maioria dos casos resolvidos no próprio dia</li>
  <li>Chaves de qualidade com garantia incluída</li>
  <li>Possibilidade de deslocação ao local do cliente</li>
  <li>Equipa experiente e certificada</li>
</ul>

<h3>Processo de Programação:</h3>
<ol>
  <li>Identificação do veículo e sistema de imobilização</li>
  <li>Leitura do código PIN/código de segurança</li>
  <li>Preparação da chave (corte e transponder)</li>
  <li>Programação no sistema do veículo</li>
  <li>Teste completo de todas as funções</li>
  <li>Entrega com garantia</li>
</ol>

<h3>Situações de Emergência:</h3>
<p>Perdeu todas as chaves? O comando deixou de funcionar? Não consegue ligar o carro? Contacte-nos imediatamente - oferecemos serviço de urgência para situações críticas.</p>

<p>Solicite já o seu orçamento gratuito e poupe na programação de chaves do seu veículo!</p>`,
      not_found_message: DEFAULT_NOT_FOUND_MESSAGE
    },
    'quadrantes': {
      title: 'Reparação de Quadrantes',
      description: 'Serviço especializado de reparação e programação de quadrantes e painéis de instrumentos',
      content: `<h2>Reparação Profissional de Quadrantes e Painéis de Instrumentos</h2>
<p>Oferecemos serviços especializados de reparação, reconstrução e programação de quadrantes e painéis de instrumentos para veículos de todas as marcas. Resolvemos desde problemas simples de iluminação até avarias complexas de eletrónica.</p>

<h3>Serviços de Quadrantes:</h3>
<ul>
  <li><strong>Reparação de Pixéis</strong> - Substituição de displays LCD com pixéis danificados ou linhas em falta.</li>
  <li><strong>Substituição de Displays</strong> - Instalação de novos ecrãs LCD/TFT em painéis de instrumentos.</li>
  <li><strong>Reparação de Iluminação</strong> - Substituição de LEDs e lâmpadas do painel.</li>
  <li><strong>Correção de Quilometragem</strong> - Ajuste de quilometragem em casos de substituição de quadrante (com documentação legal).</li>
  <li><strong>Reparação de Ponteiros</strong> - Calibração e substituição de ponteiros avariados ou imprecisos.</li>
  <li><strong>Programação de Quadrantes</strong> - Codificação de quadrantes novos ou usados ao veículo.</li>
</ul>

<h3>Problemas que Resolvemos:</h3>
<ul>
  <li>Display com pixéis mortos ou linhas em falta</li>
  <li>Iluminação parcial ou totalmente inoperante</li>
  <li>Ponteiros que não funcionam corretamente</li>
  <li>Indicadores de combustível ou temperatura avariados</li>
  <li>Quadrante completamente inoperante</li>
  <li>Luzes de aviso sempre acesas</li>
  <li>Problemas de comunicação com outros módulos</li>
</ul>

<h3>Tipos de Displays que Reparamos:</h3>
<ul>
  <li>Displays LCD monocromáticos</li>
  <li>Ecrãs TFT a cores</li>
  <li>Displays de computador de bordo</li>
  <li>Ecrãs de informação multimédia integrados</li>
  <li>Virtual Cockpit / Digital Cluster</li>
</ul>

<h3>Marcas Especializadas:</h3>
<ul>
  <li><strong>Audi/VW:</strong> Quadrantes com pixéis em falta, FIS avariado</li>
  <li><strong>Mercedes:</strong> Display do computador de bordo, W203, W211, W220</li>
  <li><strong>BMW:</strong> Pixéis do rádio e climatização, quadrantes E39, E46, E60</li>
  <li><strong>Peugeot/Citroën:</strong> Display central, ponteiros avariados</li>
  <li><strong>Renault:</strong> Display do computador de bordo</li>
  <li><strong>Fiat/Alfa:</strong> Pixéis e iluminação</li>
</ul>

<h3>Vantagens do Nosso Serviço:</h3>
<ul>
  <li>Reparação mais económica que substituição completa</li>
  <li>Manutenção da quilometragem original</li>
  <li>Componentes de qualidade com garantia</li>
  <li>Tempo de reparação reduzido</li>
  <li>Técnicos especializados em eletrónica automóvel</li>
</ul>

<h3>Processo de Reparação:</h3>
<ol>
  <li>Diagnóstico completo do quadrante</li>
  <li>Identificação de todos os componentes avariados</li>
  <li>Orçamento detalhado antes da reparação</li>
  <li>Reparação com componentes de qualidade</li>
  <li>Testes extensivos de todas as funções</li>
  <li>Reinstalação e verificação no veículo</li>
</ol>

<h3>Nota Importante:</h3>
<p>A alteração de quilometragem só é realizada em casos legais e documentados, como substituição de quadrantes avariados ou importação de veículos. Exigimos sempre documentação que comprove a quilometragem real do veículo.</p>

<p>Contacte-nos para um diagnóstico gratuito e descubra como podemos dar nova vida ao quadrante do seu veículo!</p>`,
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
