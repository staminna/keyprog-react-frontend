import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { DirectusNews } from '@/lib/directus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const Noticias = () => {
  const [news, setNews] = useState<DirectusNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await DirectusService.getNews();
        setNews(newsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <>
      <SEOHead 
        title="Notícias - Keyprog"
        description="Atualizações do setor, novidades de produtos e casos de estudo."
        keywords="notícias, blog, atualizações, keyprog"
      />
      
      <main className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">Notícias</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Atualizações do setor, novidades de produtos e casos de estudo.
          </p>
        </div>
        
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card key={item.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow group">
                {item.image && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img 
                      src={DirectusService.getImageUrl(item.image)}
                      alt={item.title || 'News image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                
                <CardHeader>
                  {item.published_date && (
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.published_date)}
                    </CardDescription>
                  )}
                  
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  
                  {item.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.summary}
                    </p>
                  )}
                  
                  {item.category && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Tag className="h-3 w-3" />
                        {item.category}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                
                <CardFooter className="mt-auto pt-0">
                  <Button asChild variant="outline" className="w-full group">
                    <Link to={`/noticias/${item.id}`}>
                      Ler Mais
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Sem notícias disponíveis</h3>
            <p className="text-muted-foreground">
              Volte em breve para novidades e atualizações.
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default Noticias;