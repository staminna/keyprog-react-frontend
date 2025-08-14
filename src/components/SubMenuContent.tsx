import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/SEOHead';

const SubMenuContent: React.FC = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['sub-menu-content', category, slug],
    queryFn: async () => {
      if (!category || !slug) return null;
      try {
        // Use a more flexible approach to fetch content
        const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/items/sub_menu_content?filter[category][_eq]=${category}&filter[slug][_eq]=${slug}&filter[status][_eq]=published`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
          }
        });
        const result = await response.json();
        return result.data?.[0] || null;
      } catch (error) {
        console.error('Error fetching sub-menu content:', error);
        return null;
      }
    },
    enabled: !!category && !!slug
  });

  if (isLoading) {
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo não encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>O conteúdo solicitado não foi encontrado ou não está disponível.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${content.title} - Keyprog`}
        description={content.description || `${content.title} - Keyprog`}
        keywords={`${content.title}, ${category}, keyprog`}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            {content.description && (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {content.description}
              </p>
            )}
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
              {content.content ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4">{content.title}</h2>
                  <p className="text-muted-foreground">
                    Conteúdo em desenvolvimento. Em breve teremos mais informações disponíveis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <a 
              href={`/${category}`}
              className="inline-flex items-center text-primary hover:underline"
            >
              ← Voltar para {category === 'loja' ? 'Loja' : category === 'servicos' ? 'Serviços' : 'Suporte'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubMenuContent;
