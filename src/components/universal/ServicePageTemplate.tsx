import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { SimpleEditableText } from './SimpleEditableText';

interface ServiceContent {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image?: string;
  status: string;
}

interface ServicePageTemplateProps {
  serviceSlug: string;
  fallbackContent: ServiceContent;
}

/**
 * Universal template for all service pages with inline editing
 */
export const ServicePageTemplate: React.FC<ServicePageTemplateProps> = ({
  serviceSlug,
  fallbackContent,
}) => {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const result = await DirectusService.getService(serviceSlug);
        
        if (result) {
          setContent({
            id: result.id,
            title: result.title,
            description: result.description || '',
            content: result.content || '',
            status: result.status || 'published'
          });
        } else {
          setContent(fallbackContent);
        }
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${serviceSlug} content:`, err);
        setError('Falha ao carregar o conteúdo. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [serviceSlug, fallbackContent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container py-12">
        <NotFoundContent 
          title="Erro ao carregar conteúdo"
          message={error || "O conteúdo solicitado não foi encontrado ou não está disponível."}
          backLink="/servicos"
          backText="Voltar para Serviços"
        />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${content.title} - Keyprog`}
        description={content.description || `${content.title} - Keyprog`}
        keywords={`${content.title}, ${serviceSlug}, serviços, keyprog`}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <SimpleEditableText
              collection="services"
              itemId={content.id}
              field="title"
              value={content.title}
              tag="h1"
              className="text-4xl font-bold mb-4"
              placeholder="Enter service title..."
            />
            
            <SimpleEditableText
              collection="services"
              itemId={content.id}
              field="description"
              value={content.description}
              tag="p"
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              placeholder="Enter service description..."
            />
          </div>

          {/* Featured Image */}
          {content.featured_image && (
            <div className="mb-8">
              <img 
                src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${content.featured_image}`}
                alt={content.title}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <Card>
            <CardContent className="p-8">
              <SimpleEditableText
                collection="services"
                itemId={content.id}
                field="content"
                value={content.content}
                tag="div"
                className="prose prose-lg max-w-none"
                placeholder="Enter service content..."
              >
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              </SimpleEditableText>
            </CardContent>
          </Card>

          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <a 
              href="/servicos"
              className="inline-flex items-center text-primary hover:underline"
            >
              ← Voltar para Serviços
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePageTemplate;
