import { useCallback } from 'react';
import { useRolePermissions } from './useRolePermissions';
import { useInlineEditor } from '@/components/universal/inline-editor-context';

interface EditableContentConfig {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Hook to manage universal inline editing across all pages
 */
export const useUniversalEditing = () => {
  const { canEditContent } = useRolePermissions();
  const { isInlineEditingEnabled } = useInlineEditor();

  /**
   * Check if content can be edited
   */
  const canEdit = useCallback((collection: string, field: string) => {
    return isInlineEditingEnabled && canEditContent(collection, field);
  }, [isInlineEditingEnabled, canEditContent]);

  /**
   * Create editable content configuration
   */
  const createEditableConfig = useCallback((
    collection: string,
    itemId: string | number,
    field: string,
    options?: Partial<EditableContentConfig>
  ): EditableContentConfig => {
    return {
      collection,
      itemId,
      field,
      tag: 'div',
      className: '',
      ...options,
    };
  }, []);

  /**
   * Auto-detect collection and field from page context
   */
  const autoDetectConfig = useCallback((
    pageSlug?: string,
    elementType?: string,
    className?: string
  ): Partial<EditableContentConfig> => {
    // Default collection based on page context
    let collection = 'pages';
    let itemId: string | number = '1';
    let field = 'content';

    // Detect collection from page slug
    if (pageSlug) {
      if (pageSlug.startsWith('servicos/')) {
        collection = 'sub_menu_content';
        itemId = pageSlug.replace('servicos/', '');
      } else if (pageSlug === 'home' || pageSlug === '') {
        collection = 'hero';
        itemId = '1';
      } else if (pageSlug === 'contact') {
        collection = 'contacts';
        itemId = '1';
      } else {
        collection = 'pages';
        itemId = pageSlug;
      }
    }

    // Detect field from element type and className
    if (elementType === 'h1' || className?.includes('title')) {
      field = 'title';
    } else if (elementType === 'h2' || className?.includes('subtitle')) {
      field = 'subtitle';
    } else if (className?.includes('description')) {
      field = 'description';
    } else if (className?.includes('content')) {
      field = 'content';
    }

    return { collection, itemId, field };
  }, []);

  /**
   * Get collection mapping for different page types
   */
  const getCollectionMapping = useCallback((pageType: string) => {
    const mappings: Record<string, { collection: string; fields: Record<string, string> }> = {
      'hero': {
        collection: 'hero',
        fields: {
          title: 'title',
          subtitle: 'subtitle',
          primaryButtonText: 'primary_button_text',
          primaryButtonLink: 'primary_button_link',
        },
      },
      'contact': {
        collection: 'contacts',
        fields: {
          title: 'title',
          email: 'email',
          phone: 'phone',
          address: 'address',
        },
      },
      'service': {
        collection: 'sub_menu_content',
        fields: {
          title: 'title',
          description: 'description',
          content: 'content',
        },
      },
      'page': {
        collection: 'pages',
        fields: {
          title: 'title',
          content: 'content',
          description: 'description',
        },
      },
      'product': {
        collection: 'products',
        fields: {
          title: 'name',
          description: 'description',
          price: 'price',
          content: 'content',
        },
      },
      'news': {
        collection: 'news',
        fields: {
          title: 'title',
          content: 'content',
          summary: 'summary',
        },
      },
    };

    return mappings[pageType] || mappings['page'];
  }, []);

  return {
    canEdit,
    createEditableConfig,
    autoDetectConfig,
    getCollectionMapping,
    isInlineEditingEnabled,
  };
};

export default useUniversalEditing;
