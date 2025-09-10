import React from 'react';
import { SearchResult } from '@/services/searchService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DirectusService } from '@/services/directusService';
import { Link } from 'react-router-dom';
import { Package, Wrench, Newspaper, FileText, ExternalLink } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
}

const getTypeIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return <Package className="h-4 w-4" />;
    case 'service':
      return <Wrench className="h-4 w-4" />;
    case 'news':
      return <Newspaper className="h-4 w-4" />;
    case 'page':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return 'Produto';
    case 'service':
      return 'Serviço';
    case 'news':
      return 'Notícia';
    case 'page':
      return 'Página';
    default:
      return 'Conteúdo';
  }
};

const getTypeBadgeColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return 'bg-green-100 text-green-800';
    case 'service':
      return 'bg-blue-100 text-blue-800';
    case 'news':
      return 'bg-purple-100 text-purple-800';
    case 'page':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          Não encontramos resultados para "{query}". Tente:
        </p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Verificar a ortografia</li>
          <li>• Usar termos mais gerais</li>
          <li>• Tentar palavras-chave diferentes</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
        </p>
      </div>

      {results.map((result) => (
        <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Link to={result.url} className="block group">
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {result.image ? (
                    <img
                      src={DirectusService.getImageUrl(result.image)}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {getTypeIcon(result.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {result.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getTypeBadgeColor(result.type)}`}
                    >
                      <span className="flex items-center gap-1">
                        {getTypeIcon(result.type)}
                        {getTypeLabel(result.type)}
                      </span>
                    </Badge>
                    {result.relevance && result.relevance > 50 && (
                      <Badge variant="outline" className="text-xs">
                        Alta relevância
                      </Badge>
                    )}
                  </div>

                  {result.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.description}
                    </p>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    {result.url}
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
