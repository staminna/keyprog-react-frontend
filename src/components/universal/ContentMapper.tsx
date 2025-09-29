import React, { useEffect, useState } from 'react';
import { UniversalContentEditor } from './UniversalContentEditor';
import { DirectusService } from '@/services/directusService';
import { useInlineEditor } from './inline-editor-context';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

interface ContentMapperProps {
  collection: string;
  field: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  placeholder?: string;
  fallback?: string;
  children?: React.ReactNode;
}

/**
 * ContentMapper automatically maps content from Directus to React components
 * It handles finding the correct item ID based on the current route
 */
export const ContentMapper: React.FC<ContentMapperProps> = ({
  collection,
  field,
  tag = 'div',
  className = '',
  placeholder = 'Click to edit...',
  fallback = '',
  children
}) => {
  const [itemId, setItemId] = useState<string | null>(null);
  const [content, setContent] = useState<string>(fallback);
  const [loading, setLoading] = useState(true);
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;

  useEffect(() => {
    const findContentForCurrentRoute = async () => {
      try {
        setLoading(true);
        const path = window.location.pathname;
        
        // Extract slug from path based on collection type
        let slug = '';
        let targetCollection = collection;
        
        if (path === '/') {
          // Home page - use hero collection
          targetCollection = 'hero';
          slug = 'home';
        } else if (path.startsWith('/servicos/')) {
          // Service detail page
          slug = path.split('/servicos/')[1];
          targetCollection = 'services';
        } else if (path.startsWith('/loja/')) {
          // Product detail page
          slug = path.split('/loja/')[1];
          targetCollection = 'products';
        } else {
          // Other pages - use the last segment as slug
          const segments = path.split('/').filter(Boolean);
          slug = segments.length > 0 ? segments[segments.length - 1] : 'home';
        }
        
        // Find the item based on slug
        let item;
        if (targetCollection === 'hero') {
          item = await DirectusService.getHero();
          setItemId('1'); // Hero always has ID 1
        } else if (targetCollection === 'services') {
          item = await DirectusService.getService(slug);
        } else {
          // Generic approach for other collections
          const items = await DirectusService.getCollectionItem(targetCollection, slug);
          item = items;
        }
        
        if (item) {
          setItemId(item.id || '1');
          setContent(item[field] || fallback);
        }
      } catch (error) {
        console.error(`Error finding content for ${collection}.${field}:`, error);
        setContent(fallback);
      } finally {
        setLoading(false);
      }
    };
    
    findContentForCurrentRoute();
  }, [collection, field, fallback]);
  
  if (loading) {
    return <div className={`animate-pulse bg-gray-200 ${className}`}>{placeholder}</div>;
  }
  
  if (!itemId || !canEdit) {
    const Tag = tag as React.ElementType;
    return <Tag className={className}>{children || content || placeholder}</Tag>;
  }
  
  return (
    <UniversalContentEditor
      collection={collection}
      itemId={itemId}
      field={field}
      value={content}
      tag={tag}
      className={className}
      placeholder={placeholder}
    />
  );
};

export default ContentMapper;