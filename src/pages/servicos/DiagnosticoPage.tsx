import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { AuthContext } from '@/contexts/auth-context';
import { useContext } from 'react';

interface DiagnosticoContent {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image?: string;
  status: string;
}

const DiagnosticoPage: React.FC = () => {
  const [content, setContent] = useState<DiagnosticoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Try to get content from Directus
        const result = await DirectusService.getSubMenuContent('servicos', 'diagnostico');
        
        if (result) {
          setContent(result as unknown as DiagnosticoContent);
        } else {
          // Fallback to static content if not found in Directus
          setContent({
            id: 'diagnostico',
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
            status: 'published'
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching diagnostico content:', err);
        setError('Falha ao carregar o conteúdo. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

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
        keywords={`${content.title}, diagnóstico, serviços, keyprog`}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {isAuthenticated ? (
                <span className="border-b border-dashed border-gray-300 cursor-pointer">
                  {content.title}
                </span>
              ) : (
                content.title
              )}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isAuthenticated ? (
                <span className="border-b border-dashed border-gray-300 cursor-pointer">
                  {content.description}
                </span>
              ) : (
                content.description
              )}
            </p>
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
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
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

export default DiagnosticoPage;
