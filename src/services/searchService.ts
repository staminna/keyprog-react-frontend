import { DirectusService } from './directusService';
import { directus, readItems } from '@/lib/directus';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'product' | 'service' | 'news' | 'page';
  slug?: string;
  image?: string;
  url: string;
  relevance?: number;
}

export interface SearchFilters {
  type?: string[];
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export class SearchService {
  static async globalSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 20, offset = 0, filters = {}, sortBy = 'relevance' } = options;
    const results: SearchResult[] = [];

    try {
      await DirectusService.authenticate();

      // Search products if not filtered out
      if (!filters.type || filters.type.includes('product')) {
        const products = await this.searchProducts(query, { limit: Math.ceil(limit / 4) });
        results.push(...products);
      }

      // Search services if not filtered out
      if (!filters.type || filters.type.includes('service')) {
        const services = await this.searchServices(query, { limit: Math.ceil(limit / 4) });
        results.push(...services);
      }

      // Search news if not filtered out
      if (!filters.type || filters.type.includes('news')) {
        const news = await this.searchNews(query, { limit: Math.ceil(limit / 4) });
        results.push(...news);
      }

      // Search pages if not filtered out
      if (!filters.type || filters.type.includes('page')) {
        const pages = await this.searchPages(query, { limit: Math.ceil(limit / 4) });
        results.push(...pages);
      }

      // Apply additional filters
      let filteredResults = this.applyFilters(results, filters);

      // Sort results
      filteredResults = this.sortResults(filteredResults, sortBy, options.sortOrder);

      // Apply pagination
      return filteredResults.slice(offset, offset + limit);

    } catch (error) {
      console.error('Error in global search:', error);
      return [];
    }
  }

  private static async searchProducts(query: string, options: { limit?: number } = {}): Promise<SearchResult[]> {
    try {
      const products = await directus.request(
        readItems('products', {
          search: query,
          filter: { status: { _eq: 'published' } },
          limit: options.limit || 10,
          fields: ['id', 'name', 'description', 'slug', 'price', 'images', 'category.name']
        })
      );

      return products.map(product => ({
        id: product.id,
        title: product.name || '',
        description: product.description,
        type: 'product' as const,
        slug: product.slug,
        image: product.images?.[0],
        url: `/loja/produtos/${product.slug}`,
        relevance: this.calculateRelevance(query, product.name, product.description)
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  private static async searchServices(query: string, options: { limit?: number } = {}): Promise<SearchResult[]> {
    try {
      const services = await directus.request(
        readItems('services', {
          search: query,
          filter: { status: { _eq: 'published' } },
          limit: options.limit || 10,
          fields: ['id', 'title', 'description', 'slug', 'image']
        })
      );

      return services.map(service => ({
        id: service.id,
        title: service.title || '',
        description: service.description,
        type: 'service' as const,
        slug: service.slug,
        image: service.image,
        url: `/servicos/detalhes/${service.slug}`,
        relevance: this.calculateRelevance(query, service.title, service.description)
      }));
    } catch (error) {
      console.error('Error searching services:', error);
      return [];
    }
  }

  private static async searchNews(query: string, options: { limit?: number } = {}): Promise<SearchResult[]> {
    try {
      const news = await directus.request(
        readItems('news', {
          search: query,
          filter: { status: { _eq: 'published' } },
          limit: options.limit || 10,
          fields: ['id', 'title', 'summary', 'image', 'published_date'],
          sort: ['-published_date']
        })
      );

      return news.map(article => ({
        id: article.id,
        title: article.title || '',
        description: article.summary,
        type: 'news' as const,
        image: article.image,
        url: `/noticias/${article.id}`,
        relevance: this.calculateRelevance(query, article.title, article.summary)
      }));
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  private static async searchPages(query: string, options: { limit?: number } = {}): Promise<SearchResult[]> {
    try {
      const pages = await directus.request(
        readItems('pages', {
          search: query,
          filter: { status: { _eq: 'published' } },
          limit: options.limit || 10,
          fields: ['id', 'title', 'content', 'slug']
        })
      );

      return pages.map(page => ({
        id: page.id,
        title: page.title || '',
        description: this.extractTextFromContent(page.content),
        type: 'page' as const,
        slug: page.slug,
        url: `/pages/${page.slug}`,
        relevance: this.calculateRelevance(query, page.title, this.extractTextFromContent(page.content))
      }));
    } catch (error) {
      console.error('Error searching pages:', error);
      return [];
    }
  }

  private static calculateRelevance(query: string, title?: string, description?: string): number {
    if (!query || (!title && !description)) return 0;

    const queryLower = query.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    const descriptionLower = (description || '').toLowerCase();

    let relevance = 0;

    // Exact title match gets highest score
    if (titleLower === queryLower) relevance += 100;
    // Title contains query
    else if (titleLower.includes(queryLower)) relevance += 50;
    // Title words match query words
    else {
      const queryWords = queryLower.split(' ');
      const titleWords = titleLower.split(' ');
      const matchingWords = queryWords.filter(word => titleWords.some(titleWord => titleWord.includes(word)));
      relevance += (matchingWords.length / queryWords.length) * 30;
    }

    // Description contains query
    if (descriptionLower.includes(queryLower)) relevance += 20;

    return relevance;
  }

  private static extractTextFromContent(content: unknown): string {
    if (!content) return '';
    if (typeof content === 'string') return content.substring(0, 200);
    if (typeof content === 'object') {
      return JSON.stringify(content).substring(0, 200);
    }
    return '';
  }

  private static applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = results;

    if (filters.category) {
      // This would need to be implemented based on your data structure
      // For now, we'll skip category filtering in search results
    }

    if (filters.dateFrom || filters.dateTo) {
      // Filter by date for news items
      filtered = filtered.filter(result => {
        if (result.type !== 'news') return true;
        // Date filtering logic would go here
        return true;
      });
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      // Filter by price for products
      filtered = filtered.filter(result => {
        if (result.type !== 'product') return true;
        // Price filtering logic would go here
        return true;
      });
    }

    return filtered;
  }

  private static sortResults(results: SearchResult[], sortBy: string, sortOrder: string = 'desc'): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = (b.relevance || 0) - (a.relevance || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          // This would need actual date fields
          comparison = 0;
          break;
        case 'price':
          // This would need actual price fields
          comparison = 0;
          break;
        default:
          comparison = (b.relevance || 0) - (a.relevance || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  static async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      await DirectusService.authenticate();

      const suggestions = new Set<string>();

      // Get product suggestions
      const products = await directus.request(
        readItems('products', {
          filter: {
            name: { _icontains: query },
            status: { _eq: 'published' }
          },
          limit: limit,
          fields: ['name']
        })
      );

      products.forEach(product => {
        if (product.name) suggestions.add(product.name);
      });

      // Get service suggestions
      const services = await directus.request(
        readItems('services', {
          filter: {
            title: { _icontains: query },
            status: { _eq: 'published' }
          },
          limit: limit,
          fields: ['title']
        })
      );

      services.forEach(service => {
        if (service.title) suggestions.add(service.title);
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
}
