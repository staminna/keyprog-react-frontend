import React from 'react';
import { ServicePageTemplate } from '@/components/universal/ServicePageTemplate';

const ReparacaoPage: React.FC = () => {
  const fallbackContent = {
    id: 'reparacao',
    title: 'Reparação de Centralinas',
    description: 'Serviços especializados de reparação e recuperação de centralinas danificadas',
    content: '<p>Conteúdo em carregamento...</p>',
    status: 'published'
  };

  return (
    <ServicePageTemplate 
      serviceSlug="reparacao" 
      fallbackContent={fallbackContent} 
    />
  );
};

export default ReparacaoPage;
