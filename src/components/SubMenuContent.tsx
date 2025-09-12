import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MenuService } from '@/services/menuService';
import { DirectusSubMenuContent } from '@/lib/directus';
import NotFoundContent from '@/components/NotFoundContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/SEOHead';

const SubMenuContent: React.FC = () => {
  // Extract parameters from URL
  const params = useParams<{ slug: string; category?: string }>();
  const slug = params.slug;
  // For routes like /servicos/:slug, the category is not in the params but in the URL path
  // So we need to extract it from the URL
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/');
  const category = params.category || (pathParts.length > 1 ? pathParts[1] : undefined);
  const [contentData, setContentData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        console.log(`SubMenuContent: Fetching content for category=${category}, slug=${slug}`);
        const content = await MenuService.getSubMenuContent(category, slug);
        console.log('SubMenuContent: Received content:', content);
        setContentData(content);
        setError(null);
      } catch (err) {
        console.error('Error fetching submenu content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (category && slug) {
      console.log(`SubMenuContent: Starting fetch for ${category}/${slug}`);
      fetchContent();
    } else {
      console.error(`SubMenuContent: Missing parameters - category=${category}, slug=${slug}`);
      setError('Missing URL parameters');
      setLoading(false);
    }
  }, [category, slug]);

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

  if (error) {
    return (
      <div className="container py-12">
        <NotFoundContent 
          title="Erro ao carregar conteúdo"
          message={error}
          backLink={`/${category}`}
          backText={`Voltar para ${category === 'servicos' ? 'Serviços' : category === 'loja' ? 'Loja' : 'Suporte'}`}
        />
      </div>
    );
  }

  if (!contentData) {
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
        title={`${contentData.title as string} - Keyprog`}
        description={(contentData.description as string) || `${contentData.title as string} - Keyprog`}
        keywords={`${contentData.title as string}, ${category}, keyprog`}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{contentData.title as string}</h1>
            {contentData.description && (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {contentData.description as string}
              </p>
            )}
          </div>

          {/* Featured Image */}
          {contentData.featured_image && (
            <div className="mb-8">
              <img 
                src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${contentData.featured_image as string}`}
                alt={contentData.title as string}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <Card>
            <CardContent className="p-8">
              {contentData.content ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: contentData.content as string }}
                />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4">{contentData.title as string}</h2>
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
