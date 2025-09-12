import React, { useState, useEffect, useContext } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { AuthContext } from '@/contexts/auth-context';

interface ReparacaoContent {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image?: string;
  status: string;
}

const ReparacaoPage: React.FC = () => {
  const [content, setContent] = useState<ReparacaoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Try to get content from Directus
        const result = await DirectusService.getSubMenuContent('servicos', 'reparacao');
        
        if (result) {
          setContent(result as unknown as ReparacaoContent);
        } else {
          // Fallback to static content if not found in Directus
          setContent({
            id: 'reparacao',
            title: 'Reparação de Centralinas',
            description: 'Serviços especializados de reparação e recuperação de centralinas danificadas',
            content: `<h2>Reparação Profissional de Centralinas</h2>
<p>Oferecemos serviços especializados de reparação e recuperação de centralinas danificadas para todos os tipos de veículos, com garantia de qualidade e eficiência.</p>

<h3>Serviços de Reparação:</h3>
<ul>
  <li><strong>Reparação de centralinas com danos elétricos</strong> - Identificamos e substituímos componentes eletrónicos danificados, restaurando o funcionamento da centralina.</li>
  <li><strong>Recuperação de centralinas com problemas de software</strong> - Corrigimos erros de software, atualizamos firmware e restauramos configurações corrompidas.</li>
  <li><strong>Substituição de componentes danificados</strong> - Substituímos microprocessadores, memórias, transistores e outros componentes com tecnologia de ponta.</li>
  <li><strong>Restauração de backups e configurações</strong> - Recuperamos dados e configurações importantes para garantir o funcionamento correto após a reparação.</li>
  <li><strong>Reparação de imobilizadores e sistemas de segurança</strong> - Solucionamos problemas em sistemas de imobilização e segurança do veículo.</li>
</ul>

<h3>Vantagens do nosso serviço:</h3>
<ul>
  <li>Economia significativa em comparação com a substituição completa da centralina</li>
  <li>Manutenção das configurações originais do veículo</li>
  <li>Reparação rápida e eficiente, minimizando o tempo de inatividade do veículo</li>
  <li>Garantia em todos os serviços realizados</li>
  <li>Suporte técnico pós-reparação</li>
</ul>

<h3>Processo de Reparação:</h3>
<ol>
  <li>Diagnóstico completo da centralina para identificar todos os problemas</li>
  <li>Desmontagem cuidadosa e inspeção detalhada dos componentes</li>
  <li>Backup dos dados e configurações (quando possível)</li>
  <li>Reparação ou substituição dos componentes danificados</li>
  <li>Testes rigorosos para garantir o funcionamento correto</li>
  <li>Reinstalação e configuração no veículo</li>
  <li>Verificação final de todos os sistemas afetados</li>
</ol>

<p>Confie a reparação da centralina do seu veículo a especialistas com anos de experiência e equipamentos de última geração. Contacte-nos hoje mesmo para obter um orçamento personalizado.</p>`,
            status: 'published'
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching reparacao content:', err);
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
        keywords={`${content.title}, reparação, centralinas, serviços, keyprog`}
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

export default ReparacaoPage;
