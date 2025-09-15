import React from 'react';
import { UniversalContentEditor } from './UniversalContentEditor';
import { useInlineEditor } from './InlineEditorProvider';
import { useRolePermissions } from '@/hooks/useRolePermissions';

interface SimpleEditableTextProps {
  collection: string;
  itemId: string | number;
  field: string;
  value: string;
  children?: React.ReactNode;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  placeholder?: string;
}

/**
 * Simple wrapper to make any text content editable inline
 */
export const SimpleEditableText: React.FC<SimpleEditableTextProps> = ({
  collection,
  itemId,
  field,
  value,
  children,
  tag = 'div',
  className = '',
  placeholder = 'Click to edit...',
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { canEditContent } = useRolePermissions();

  const canEdit = isInlineEditingEnabled && canEditContent(collection, field);

  if (!canEdit) {
    const Tag = tag;
    return <Tag className={className}>{children || value}</Tag>;
  }

  return (
    <div 
      className="relative group"
      title={`Editable: ${collection}.${field} (ID: ${itemId})`}
    >
      <UniversalContentEditor
        collection={collection}
        itemId={String(itemId)}
        field={field}
        value={value}
        tag={tag}
        className={className}
        placeholder={placeholder}
      />
      
      {/* Hover label showing collection info */}
      <div className="absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
        {collection}.{field}
      </div>
    </div>
  );
};

export default SimpleEditableText;
