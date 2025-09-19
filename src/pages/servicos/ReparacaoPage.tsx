import React from 'react';
import ServicePageTemplate from '@/components/ServicePageTemplate';

const ReparacaoPage: React.FC = () => {
  // Note: We don't have a specific "reparacao" service in Directus yet
  // This will show a "not found" message until we create it
  return <ServicePageTemplate serviceSlug="reparacao" />;
};

export default ReparacaoPage;