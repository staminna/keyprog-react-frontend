import React, { useState, useEffect, useContext } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { AuthContext } from '@/contexts/auth-context';

interface DesbloqueioContent {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image?: string;
  status: string;
}

const DesbloqueioPage: React.FC = () => {
  const [content, setContent] = useState<DesbloqueioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Try to get content from Directus
        const result = await DirectusService.getSubMenuContent('servicos', 'desbloqueio');
        
        if (result) {
          setContent(result as unknown as DesbloqueioContent);
        } else {
          // Fallback to static content if not found in Directus
          setContent({
            id: 'desbloqueio',
            title: 'Desbloqueio',
            description: 'Serviço de desbloqueio de centralinas e módulos eletrônicos',
            content: `<h2>Desbloqueio de Centralinas e Módulos Eletrónicos</h2>
<p>Nosso serviço de desbloqueio permite acesso a funcionalidades avançadas e remoção de limitações em centralinas e módulos eletrónicos automotivos.</p>

<h3>Serviços de Desbloqueio:</h3>
<ul>
  <li><strong>Acesso a funções ocultas do veículo</strong> - Desbloqueamos funcionalidades que estão presentes no seu veículo mas foram desativadas pelo fabricante.</li>
  <li><strong>Remoção de limitações de velocidade</strong> - Eliminamos limitações artificiais impostas pelos fabricantes.</li>
  <li><strong>Desbloqueio de centralinas protegidas</strong> - Acesso a centralinas bloqueadas para permitir modificações ou reparações.</li>
  <li><strong>Remoção de bloqueios de imobilizador</strong> - Solucionamos problemas com sistemas de imobilização que impedem o funcionamento do veículo.</li>
  <li><strong>Desbloqueio de rádios e sistemas de entretenimento</strong> - Restauramos o acesso a sistemas multimédia bloqueados.</li>
</ul>

<h3>Vantagens do nosso serviço:</h3>
<ul>
  <li>Procedimentos realizados por técnicos especializados</li>
  <li>Equipamentos de última geração</li>
  <li>Preservação da integridade dos sistemas eletrónicos</li>
  <li>Conformidade com as normas legais aplicáveis</li>
  <li>Garantia em todos os serviços</li>
</ul>

<h3>Processo de Desbloqueio:</h3>
<ol>
  <li>Diagnóstico inicial para identificar o tipo de bloqueio</li>
  <li>Análise da viabilidade técnica e legal do desbloqueio</li>
  <li>Backup dos dados originais para segurança</li>
  <li>Procedimento de desbloqueio com equipamentos especializados</li>
  <li>Testes de funcionamento e verificação de estabilidade</li>
  <li>Entrega do veículo com todas as funcionalidades desbloqueadas</li>
</ol>

<p>Todos os procedimentos são realizados com segurança, preservando a integridade dos sistemas eletrónicos do veículo e respeitando as normas legais aplicáveis.</p>

<p>Entre em contacto connosco para avaliarmos as possibilidades de desbloqueio para o seu veículo específico.</p>`,
            status: 'published'
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching desbloqueio content:', err);
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
        keywords={`${content.title}, desbloqueio, centralinas, serviços, keyprog`}
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

export default DesbloqueioPage;
