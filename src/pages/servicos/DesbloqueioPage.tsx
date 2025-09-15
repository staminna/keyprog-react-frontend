import React from 'react';
import { ServicePageTemplate } from '@/components/universal/ServicePageTemplate';

const DesbloqueioPage: React.FC = () => {
  const fallbackContent = {
    id: 'desbloqueio',
    title: 'Desbloqueio',
    description: 'Serviço de desbloqueio de centralinas e módulos eletrónicos',
    content: '<p>Conteúdo em carregamento...</p>',
    status: 'published'
  };

  return (
    <ServicePageTemplate 
      serviceSlug="desbloqueio" 
      fallbackContent={fallbackContent} 
    />
  );
};

export default DesbloqueioPage;
