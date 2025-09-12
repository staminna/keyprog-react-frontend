import React, { useState, useEffect, useContext } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { AuthContext } from '@/contexts/auth-context';

interface ClonagemContent {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image?: string;
  status: string;
}

const ClonagemPage: React.FC = () => {
  const [content, setContent] = useState<ClonagemContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Try to get content from Directus
        const result = await DirectusService.getSubMenuContent('servicos', 'clonagem');
        
        if (result) {
          setContent(result as unknown as ClonagemContent);
        } else {
          // Fallback to static content if not found in Directus
          setContent({
            id: 'clonagem',
            title: 'Clonagem',
            description: 'Serviço de clonagem de centralinas e módulos eletrónicos',
            content: `<h2>Clonagem de Centralinas e Módulos Eletrónicos</h2>
<p>Nosso serviço de clonagem permite criar cópias exatas de centralinas e módulos eletrónicos, garantindo backup seguro de dados e configurações.</p>

<h3>Benefícios do serviço de clonagem:</h3>
<ul>
  <li><strong>Backup completo de dados e configurações</strong> - Preservamos todas as informações originais da centralina.</li>
  <li><strong>Substituição de centralinas danificadas sem perda de dados</strong> - Transferimos todas as configurações para a nova unidade.</li>
  <li><strong>Transferência de configurações entre módulos</strong> - Compatibilizamos módulos diferentes para funcionar no seu veículo.</li>
  <li><strong>Preservação de chaves e códigos de segurança</strong> - Mantemos todos os códigos de segurança originais.</li>
  <li><strong>Restauração rápida em caso de falhas</strong> - Possibilidade de restaurar configurações em caso de problemas futuros.</li>
</ul>

<h3>Tipos de clonagem que realizamos:</h3>
<ul>
  <li>Clonagem de ECU (Unidade de Controle do Motor)</li>
  <li>Clonagem de BSI (Body System Interface)</li>
  <li>Clonagem de módulos de imobilizador</li>
  <li>Clonagem de módulos de conforto</li>
  <li>Clonagem de módulos de airbag</li>
  <li>Clonagem de painéis de instrumentos</li>
</ul>

<h3>Processo de Clonagem:</h3>
<ol>
  <li>Diagnóstico inicial do módulo original</li>
  <li>Extração completa dos dados</li>
  <li>Verificação da integridade dos dados</li>
  <li>Preparação do módulo de destino</li>
  <li>Transferência dos dados e configurações</li>
  <li>Testes de funcionamento e verificação de compatibilidade</li>
  <li>Instalação e configuração final no veículo</li>
</ol>

<p>Trabalhamos com equipamentos de última geração para garantir clonagens perfeitas e seguras, mantendo todas as funcionalidades originais do veículo.</p>

<p>Contacte-nos para saber mais sobre as possibilidades de clonagem para o seu veículo específico.</p>`,
            status: 'published'
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching clonagem content:', err);
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
        keywords={`${content.title}, clonagem, centralinas, serviços, keyprog`}
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

export default ClonagemPage;
