import React from 'react';
import { InlineRichText, InlineRichTextProps } from '@/components/inline';
import { EditableContent } from './EditableContent';

/**
 * Maps virtual collections to actual Directus collections
 * This helps with handling non-existent collections like "hero" and "contact_info"
 * by mapping them to existing collections like "settings"
 */
interface CollectionMapping {
  [key: string]: {
    collection: string;
    fieldMappings: {
      [key: string]: string;
    };
  };
}

// Define collection mappings - map virtual collections to collections with proper permissions
const COLLECTION_MAPPINGS: CollectionMapping = {
  // Map hero collection to settings (which has proper permissions)
  'hero': {
    collection: 'settings',
    fieldMappings: {
      'title': 'site_title',
      'subtitle': 'site_description',
      'primary_button_text': 'primary_button_text',
      'primary_button_link': 'primary_button_link',
      'image': 'hero_image'
    }
  },
  // Map contact_info collection to settings (which has proper permissions)
  'contact_info': {
    collection: 'settings',
    fieldMappings: {
      'title': 'contact_title',
      'email': 'contact_email',
      'phone': 'contact_phone',
      'chat_hours': 'contact_hours',
      'contact_form_text': 'contact_form_text',
      'contact_form_link': 'contact_form_link',
      'image': 'contact_image'
    }
  },
  // Map header_menu collection
  'header_menu': {
    collection: 'header_menu',
    fieldMappings: {
      'title': 'title',
      'link': 'link',
      'sub_menu': 'sub_menu',
      'order': 'sort'
    }
  },
  // Map footer_menu collection
  'footer_menu': {
    collection: 'footer_menu',
    fieldMappings: {
      'title': 'title',
      'links': 'links',
      'order': 'sort'
    }
  },
  // Map sub_menu_content collection
  'sub_menu_content': {
    collection: 'sub_menu_content',
    fieldMappings: {
      'title': 'title',
      'description': 'description',
      'image': 'image',
      'link': 'link',
      'category': 'category',
      'slug': 'slug',
      'order': 'sort'
    }
  },
  // Map pages collection
  'pages': {
    collection: 'pages',
    fieldMappings: {
      'title': 'title',
      'content': 'content',
      'slug': 'slug',
      'meta_title': 'meta_title',
      'meta_description': 'meta_description'
    }
  }
};

export interface CollectionMapperProps extends Omit<InlineRichTextProps, 'collection' | 'field'> {
  collection: string;
  field: string;
}

/**
 * CollectionMapper component that maps virtual collections to actual Directus collections
 * This helps with handling non-existent collections by mapping them to existing ones
 */
export const CollectionMapper: React.FC<CollectionMapperProps> = ({
  collection,
  field,
  ...props
}) => {
  // Check if we need to map this collection
  const mapping = COLLECTION_MAPPINGS[collection];
  
  if (mapping) {
    // Get the mapped collection and field
    const mappedCollection = mapping.collection;
    const mappedField = mapping.fieldMappings[field] || field;
    
    console.log(`Mapping collection: ${collection} → ${mappedCollection}, field: ${field} → ${mappedField}`);
    
    // Return the EditableContent with mapped collection and field
    return (
      <EditableContent
        {...props}
        collection={mappedCollection}
        field={mappedField}
      />
    );
  }
  
  // If no mapping is needed, pass through as is
  return <InlineRichText {...props} collection={collection} field={field} />;
};

export default CollectionMapper;
