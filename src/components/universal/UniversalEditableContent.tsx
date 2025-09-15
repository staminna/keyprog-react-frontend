import React, { ReactNode } from 'react';
import { UniversalContentEditor } from './UniversalContentEditor';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useInlineEditor } from './InlineEditorProvider';

interface UniversalEditableContentProps {
  children?: ReactNode;
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  // Auto-detection props
  autoDetect?: boolean;
  fallbackCollection?: string;
  fallbackItemId?: string | number;
}

/**
 * Universal wrapper that makes any content editable inline.
 * Can auto-detect content or use explicit props.
 */
export const UniversalEditableContent: React.FC<UniversalEditableContentProps> = ({
  children,
  collection,
  itemId,
  field,
  value,
  placeholder,
  className = '',
  tag = 'div',
  autoDetect = false,
  fallbackCollection,
  fallbackItemId,
}) => {
  const { canEditContent } = useRolePermissions();
  const { isInlineEditingEnabled } = useInlineEditor();

  // Check if editing is possible
  const canEdit = isInlineEditingEnabled && canEditContent(collection, field);

  // Auto-detect content from children if enabled
  const detectedValue = autoDetect && typeof children === 'string' ? children : value;
  const extractedText = autoDetect && !detectedValue ? extractTextFromChildren(children) : detectedValue;

  // If editing is not possible, render children as-is
  if (!canEdit) {
    return <>{children}</>;
  }

  // Use UniversalContentEditor for editable content
  return (
    <div 
      className="relative group"
      title={`Editable: ${collection}.${field} (ID: ${itemId})`}
    >
      <UniversalContentEditor
        collection={collection}
        itemId={String(itemId)}
        field={field}
        value={extractedText || ''}
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

/**
 * Extract text content from React children for auto-detection
 */
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (typeof children === 'number') {
    return String(children);
  }
  
  if (React.isValidElement(children)) {
    return extractTextFromChildren(children.props.children);
  }
  
  if (Array.isArray(children)) {
    return children.map(child => extractTextFromChildren(child)).join(' ');
  }
  
  return '';
}


export default UniversalEditableContent;
