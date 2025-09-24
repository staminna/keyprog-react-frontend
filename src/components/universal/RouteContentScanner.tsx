import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { useInlineEditor } from './InlineEditorProvider';
import { DOMEditableScanner } from './DOMEditableScanner';

interface RouteMapping {
  path: string;
  collection: string;
  idField: string;
  slugField: string;
}

// Define route mappings for different content types
const ROUTE_MAPPINGS: RouteMapping[] = [
  { path: '/servicos/:slug', collection: 'services', idField: 'id', slugField: 'slug' },
  { path: '/loja/:slug', collection: 'products', idField: 'id', slugField: 'slug' },
  { path: '/noticias/:id', collection: 'news', idField: 'id', slugField: 'id' },
  { path: '/pages/:slug', collection: 'pages', idField: 'id', slugField: 'slug' },
];

// Root level collections
const ROOT_COLLECTIONS = {
  '/': 'hero',
  '/servicos': 'services_page',
  '/loja': 'products_page',
  '/contactos': 'contact_page',
  '/suporte': 'support_page',
};

/**
 * RouteContentScanner scans the current route and makes all content editable
 * It automatically detects the content type based on the route and renders the appropriate editors
 */
export const RouteContentScanner: React.FC = () => {
  const location = useLocation();
  const { isInlineEditingEnabled } = useInlineEditor();
  const [currentMapping, setCurrentMapping] = useState<{collection: string, itemId: string} | null>(null);
  
  useEffect(() => {
    const findContentForCurrentRoute = async () => {
      const path = location.pathname;
      
      // Check if this is a root level page
      if (ROOT_COLLECTIONS[path]) {
        setCurrentMapping({
          collection: ROOT_COLLECTIONS[path],
          itemId: '1' // Root collections typically have ID 1
        });
        return;
      }
      
      // Check for dynamic routes
      for (const mapping of ROUTE_MAPPINGS) {
        const pathPattern = new RegExp(
          `^${mapping.path.replace(/:\w+/g, '([^/]+)')}$`
        );
        
        const match = path.match(pathPattern);
        if (match) {
          const slug = match[1];
          try {
            let item;
            
            // Get the item based on collection type
            if (mapping.collection === 'services') {
              item = await DirectusService.getService(slug);
            } else if (mapping.collection === 'products') {
              // Assuming you have a getProduct method
              item = await DirectusService.getCollectionItem('products', slug);
            } else {
              // Generic approach
              const items = await DirectusService.getCollectionItem(mapping.collection, slug);
              item = items;
            }
            
            if (item) {
              setCurrentMapping({
                collection: mapping.collection,
                itemId: item.id
              });
            }
          } catch (error) {
            console.error(`Error finding content for route ${path}:`, error);
          }
          break;
        }
      }
    };
    
    if (isInlineEditingEnabled) {
      findContentForCurrentRoute();
    }
  }, [location.pathname, isInlineEditingEnabled]);
  
  // This component doesn't render anything visible
  // It just scans the route and sets up the content mapping
  return (
    <>
      <DOMEditableScanner />
    </>
  );
};

export default RouteContentScanner;