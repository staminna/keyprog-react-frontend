import React from 'react';
import { ServicePageTemplate } from '@/components/universal/ServicePageTemplate';

const ClonagemPage: React.FC = () => {
  const fallbackContent = {
    id: 'clonagem',
    title: 'Clonagem',
    description: 'Serviço de clonagem de centralinas e módulos eletrónicos',
    content: '<p>Conteúdo em carregamento...</p>',
    status: 'published'
  };

  return (
    <ServicePageTemplate 
      serviceSlug="clonagem" 
      fallbackContent={fallbackContent} 
    />
  );
};

export default ClonagemPage;