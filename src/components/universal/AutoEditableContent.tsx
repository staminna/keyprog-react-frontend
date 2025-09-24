import React from 'react';
import { UniversalContentEditor } from './UniversalContentEditor';
import { useInlineEditor } from './InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

interface AutoEditableContentProps {
  children: React.ReactNode;
  collection: string;
  field: string;
  itemId?: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  placeholder?: string;
}

/**
 * AutoEditableContent makes any content editable with minimal configuration
 * It automatically detects the content type and renders the appropriate editor
 */
export const AutoEditableContent: React.FC<AutoEditableContentProps> = ({
  children,
  collection,
  field,
  itemId = '1',
  tag = 'div',
  className = '',
  placeholder = 'Click to edit...',
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;

  // Extract text content from children to use as value
  const extractTextContent = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
      return children;
    }
    
    if (Array.isArray(children)) {
      return children.map(extractTextContent).join('');
    }
    
    if (React.isValidElement(children)) {
      return extractTextContent(children.props.children);
    }
    
    return '';
  };

  const textContent = extractTextContent(children);

  if (!canEdit) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <UniversalContentEditor
        collection={collection}
        itemId={itemId}
        field={field}
        value={textContent}
        tag={tag}
        className={className}
        placeholder={placeholder}
      />
      
      {/* Hover label showing collection info */}
      <div className="absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
        {collection}.{field} (ID: {itemId})
      </div>
    </div>
  );
};

export default AutoEditableContent;