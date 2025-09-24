import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';

interface RouteContentOptions {
  defaultCollection?: string;
  defaultItemId?: string;
}

/**
 * Hook to get content mapping for the current route
 * This helps components know which collection and item ID to use for editing
 */
export const useRouteContent = (options: RouteContentOptions = {}) => {
  const location = useLocation();
  const [contentMapping, setContentMapping] = useState<{
    collection: string;
    itemId: string;
    slug?: string;
  }>({
    collection: options.defaultCollection || 'hero',
    itemId: options.defaultItemId || '1',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectRouteContent = async () => {
      setIsLoading(true);
      const path = location.pathname;
      
      try {
        // Home page
        if (path === '/') {
          setContentMapping({
            collection: 'hero',
            itemId: '1',
            slug: 'home'
          });
          return;
        }
        
        // Services page or service detail
        if (path.startsWith('/servicos')) {
          if (path === '/servicos') {
            setContentMapping({
              collection: 'services_page',
              itemId: '1',
              slug: 'services'
            });
          } else {
            const slug = path.split('/servicos/')[1];
            const service = await DirectusService.getService(slug);
            if (service) {
              setContentMapping({
                collection: 'services',
                itemId: service.id,
                slug
              });
            }
          }
          return;
        }
        
        // Products page or product detail
        if (path.startsWith('/loja')) {
          if (path === '/loja') {
            setContentMapping({
              collection: 'products_page',
              itemId: '1',
              slug: 'products'
            });
          } else {
            const slug = path.split('/loja/')[1];
            // Assuming you have a getProduct method
            const product = await DirectusService.getCollectionItem('products', slug);
            if (product) {
              setContentMapping({
                collection: 'products',
                itemId: product.id,
                slug
              });
            }
          }
          return;
        }
        
        // News page or news detail
        if (path.startsWith('/noticias')) {
          if (path === '/noticias') {
            setContentMapping({
              collection: 'news_page',
              itemId: '1',
              slug: 'news'
            });
          } else {
            const id = path.split('/noticias/')[1];
            const news = await DirectusService.getNewsItem(id);
            if (news) {
              setContentMapping({
                collection: 'news',
                itemId: news.id,
                slug: id
              });
            }
          }
          return;
        }
        
        // Contact page
        if (path === '/contactos') {
          setContentMapping({
            collection: 'contact_page',
            itemId: '1',
            slug: 'contact'
          });
          return;
        }
        
        // Support page
        if (path === '/suporte') {
          setContentMapping({
            collection: 'support_page',
            itemId: '1',
            slug: 'support'
          });
          return;
        }
        
        // File service page
        if (path === '/file-service') {
          setContentMapping({
            collection: 'file_service_page',
            itemId: '1',
            slug: 'file_service'
          });
          return;
        }
        
        // Simulator page
        if (path === '/simulador') {
          setContentMapping({
            collection: 'simulator_page',
            itemId: '1',
            slug: 'simulator'
          });
          return;
        }
        
        // Dynamic pages
        if (path.startsWith('/pages/')) {
          const slug = path.split('/pages/')[1];
          const page = await DirectusService.getPage(slug);
          if (page) {
            setContentMapping({
              collection: 'pages',
              itemId: page.id,
              slug
            });
          }
          return;
        }
        
        // Default to the provided options if no match
        setContentMapping({
          collection: options.defaultCollection || 'hero',
          itemId: options.defaultItemId || '1',
        });
        
      } catch (error) {
        console.error('Error detecting route content:', error);
        // Fall back to defaults on error
        setContentMapping({
          collection: options.defaultCollection || 'hero',
          itemId: options.defaultItemId || '1',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    detectRouteContent();
  }, [location.pathname, options.defaultCollection, options.defaultItemId]);
  
  return {
    collection: contentMapping.collection,
    itemId: contentMapping.itemId,
    slug: contentMapping.slug,
    isLoading
  };
};

export default useRouteContent;