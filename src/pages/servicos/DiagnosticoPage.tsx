import React from 'react';
import { ServicePageTemplate } from '@/components/universal/ServicePageTemplate';

const DiagnosticoPage: React.FC = () => {
  const fallbackContent = {
    id: 'diagnostico',
    title: 'Diagnóstico Avançado',
    description: 'Serviço especializado de diagnóstico para veículos de todas as marcas',
    content: '<p>Conteúdo em carregamento...</p>',
    status: 'published'
  };

  return (
    <ServicePageTemplate 
      serviceSlug="diagnostico" 
      fallbackContent={fallbackContent} 
    />
  );
};

export default DiagnosticoPage;
