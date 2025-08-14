import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import type { DirectusNews } from '@/lib/directus';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Calendar, Clock } from 'lucide-react';

interface NewsDetailProps {
  id?: string; // Optional prop to override URL id
}

const NewsDetail = ({ id: propId }: NewsDetailProps) => {
  const { id: urlId } = useParams<{ id: string }>();
  const id = propId || urlId;
  
  const [news, setNews] = useState<DirectusNews | null>(null);
  const [relatedNews, setRelatedNews] = useState<DirectusNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) {
        setError('No news ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const [newsData, allNews] = await Promise.all([
          DirectusService.getNewsItem(id),
          DirectusService.getNews()
        ]);
        
        if (!newsData) {
          setError('News article not found');
        } else {
          setNews(newsData);
          // Get related news (exclude current article)
          setRelatedNews(
            allNews
              .filter(n => n.id !== newsData.id)
              .slice(0, 3)
          );
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to estimate reading time
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min de leitura`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/noticias" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar às Notícias
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No news found
  if (!news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/noticias" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar às Notícias
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-muted-foreground mb-4">
              Artigo Não Encontrado
            </h1>
            <p className="text-muted-foreground">
              O artigo solicitado não foi encontrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render news article
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link to="/noticias" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar às Notícias
        </Link>

        {/* Article Header */}
        <article className="mb-8">
          {/* Article Title */}
          {news.title && (
            <h1 className="text-4xl font-bold mb-6 text-gradient-primary leading-tight">
              {news.title}
            </h1>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            {news.published_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(news.published_date)}</span>
              </div>
            )}
            {news.content && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{estimateReadingTime(news.content)}</span>
              </div>
            )}
            {news.category && (
              <Badge variant="secondary">{news.category}</Badge>
            )}
          </div>

          {/* Featured Image */}
          {news.image && (
            <div className="mb-8">
              <img
                src={DirectusService.getImageUrl(news.image)}
                alt={news.title || 'News Image'}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Article Summary/Excerpt */}
          {news.summary && (
            <div className="text-lg text-muted-foreground mb-8 p-4 bg-muted rounded-lg border-l-4 border-primary">
              {news.summary}
            </div>
          )}

          {/* Article Content */}
          {news.content && (
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: news.content }} />
            </div>
          )}
        </article>

        {/* Article Footer */}
        <div className="border-t pt-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Publicado em {news.published_date && formatDate(news.published_date)}
            </div>
            {news.tags && (
              <div className="flex flex-wrap gap-2">
                {Array.isArray(news.tags) ? (
                  news.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {news.tags}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Outras Notícias</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/noticias/${relatedArticle.id}`}
                  className="block group"
                >
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {relatedArticle.image && (
                      <img
                        src={DirectusService.getImageUrl(relatedArticle.image)}
                        alt={relatedArticle.title || 'News'}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedArticle.title}
                      </h3>
                      {relatedArticle.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedArticle.summary}
                        </p>
                      )}
                      {relatedArticle.published_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(relatedArticle.published_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
