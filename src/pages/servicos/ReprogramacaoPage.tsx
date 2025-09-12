import React, { useState, useEffect, useContext } from 'react';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { AuthContext } from '@/contexts/auth-context';

interface ReprogramacaoContent {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image?: string;
  status: string;
}

const ReprogramacaoPage: React.FC = () => {
  const [content, setContent] = useState<ReprogramacaoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Try to get content from Directus
        const result = await DirectusService.getSubMenuContent('servicos', 'reprogramacao');
        
        if (result) {
          setContent(result as unknown as ReprogramacaoContent);
        } else {
          // Fallback to static content if not found in Directus
          setContent({
            id: 'reprogramacao',
            title: 'Reprogramação ECU',
            description: 'Serviço especializado de reprogramação de centralinas para otimização de desempenho',
            content: `<h2>Reprogramação Profissional de ECU</h2>
<p>A nossa equipa de especialistas utiliza as mais avançadas tecnologias para reprogramar centralinas eletrónicas de veículos, oferecendo melhorias significativas em desempenho, economia de combustível e dirigibilidade.</p>

<h3>Benefícios da Reprogramação:</h3>
<ul>
  <li><strong>Aumento de potência</strong> - Otimização dos mapas de injeção e ignição para extrair mais potência do motor.</li>
  <li><strong>Maior torque</strong> - Melhoria na curva de torque para uma condução mais agradável e responsiva.</li>
  <li><strong>Economia de combustível</strong> - Ajustes nos parâmetros de combustão para melhorar a eficiência energética.</li>
  <li><strong>Melhor resposta do acelerador</strong> - Eliminação de atrasos na resposta do acelerador para uma condução mais precisa.</li>
  <li><strong>Remoção de limitações de fábrica</strong> - Eliminação de restrições impostas pelo fabricante que limitam o desempenho.</li>
</ul>

<h3>Tipos de Reprogramação:</h3>
<ul>
  <li><strong>Stage 1</strong> - Otimização básica sem modificações de hardware, ideal para veículos de série.</li>
  <li><strong>Stage 2</strong> - Reprogramação avançada para veículos com modificações moderadas (filtro de ar, escape, etc.).</li>
  <li><strong>Stage 3</strong> - Reprogramação completa para veículos com modificações significativas de hardware.</li>
  <li><strong>Reprogramação Específica</strong> - Soluções personalizadas para necessidades específicas (economia, desempenho, etc.).</li>
</ul>

<h3>Nosso Processo:</h3>
<ol>
  <li>Avaliação inicial do veículo e das suas necessidades</li>
  <li>Backup completo da programação original (para possível restauração)</li>
  <li>Leitura e análise dos mapas da centralina</li>
  <li>Desenvolvimento de mapas personalizados para o seu veículo</li>
  <li>Reprogramação da centralina com os novos mapas</li>
  <li>Testes extensivos para garantir estabilidade e desempenho</li>
  <li>Ajustes finais com base nos resultados dos testes</li>
</ol>

<p>Trabalhamos com todas as marcas e modelos, garantindo resultados seguros e eficientes. Cada reprogramação é personalizada para o seu veículo específico, considerando modificações existentes e objetivos de desempenho.</p>

<h3>Garantia de Satisfação</h3>
<p>Oferecemos garantia em todos os nossos serviços de reprogramação e a possibilidade de restaurar a programação original a qualquer momento, se desejado.</p>

<p>Agende já a reprogramação da centralina do seu veículo e experimente uma nova dimensão de desempenho e eficiência!</p>`,
            status: 'published'
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching reprogramacao content:', err);
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
        keywords={`${content.title}, reprogramação, ECU, centralinas, serviços, keyprog`}
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

export default ReprogramacaoPage;
