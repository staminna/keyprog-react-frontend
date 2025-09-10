import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchService, SearchResult, SearchFilters } from '@/services/searchService';
import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const query = searchParams.get('q') || '';

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await SearchService.globalSearch(searchQuery, {
        limit: 50,
        filters,
        sortBy: 'relevance'
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  const handleSearch = (newQuery: string, searchResults: SearchResult[]) => {
    setSearchParams({ q: newQuery });
    setResults(searchResults);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[] | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Re-search with new filters
    if (query) {
      performSearch(query);
    }
  };

  const clearFilters = () => {
    setFilters({});
    if (query) {
      performSearch(query);
    }
  };

  const getResultStats = () => {
    const stats = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const stats = getResultStats();
  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pesquisa</h1>
          <SearchBar
            placeholder="Pesquisar produtos, serviços, notícias..."
            onSearch={handleSearch}
            autoFocus={!query}
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                  </Button>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpar filtros
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Content Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Tipo de Conteúdo</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'product', label: 'Produtos', count: stats.product || 0 },
                      { value: 'service', label: 'Serviços', count: stats.service || 0 },
                      { value: 'news', label: 'Notícias', count: stats.news || 0 },
                      { value: 'page', label: 'Páginas', count: stats.page || 0 }
                    ].map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={filters.type?.includes(type.value) || false}
                          onCheckedChange={(checked) => {
                            const currentTypes = filters.type || [];
                            const newTypes = checked
                              ? [...currentTypes, type.value]
                              : currentTypes.filter(t => t !== type.value);
                            handleFilterChange('type', newTypes.length > 0 ? newTypes : undefined);
                          }}
                        />
                        <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                          <span className="flex items-center justify-between">
                            <span>{type.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {type.count}
                            </Badge>
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Results Summary */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Resumo dos Resultados</Label>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Total: {results.length} resultados</p>
                    {Object.entries(stats).map(([type, count]) => (
                      <p key={type} className="flex justify-between">
                        <span className="capitalize">{type}s:</span>
                        <span>{count}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {query ? (
              <SearchResults 
                results={results} 
                query={query} 
                isLoading={isLoading}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Comece a pesquisar
                  </h3>
                  <p className="text-gray-500">
                    Digite algo na barra de pesquisa para encontrar produtos, serviços, notícias e mais.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
