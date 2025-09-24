import React, { useEffect, useState } from 'react';
import { UniversalContentEditor } from './UniversalContentEditor';
import { useInlineEditor } from './InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRouteContent from '@/hooks/useRouteContent';

interface EditableTextNodeProps {
  children: React.ReactNode;
  field?: string;
  collection?: string;
  itemId?: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * EditableTextNode makes any text node editable, even within complex HTML structures
 * It automatically detects the current route and collection if not specified
 */
export const EditableTextNode: React.FC<EditableTextNodeProps> = ({
  children,
  field,
  collection: propCollection,
  itemId: propItemId,
  className = '',
  tag = 'span'
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;
  
  // Get route content mapping if collection/itemId not provided
  const { collection: routeCollection, itemId: routeItemId } = useRouteContent();
  
  // Use provided values or fall back to route content
  const collection = propCollection || routeCollection;
  const itemId = propItemId || routeItemId;
  
  // Generate a field name if not provided
  const [generatedField, setGeneratedField] = useState<string | undefined>(field);
  
  useEffect(() => {
    if (!field) {
      // Generate a field name based on the content and location
      const content = React.Children.toArray(children).join('');
      const hash = Math.abs(hashCode(content)).toString(16).substring(0, 8);
      setGeneratedField(`auto_text_${hash}`);
    }
  }, [field, children]);
  
  // Simple hash function for generating field names
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
  
  // Extract text content from children
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
  
  if (!canEdit || !collection || !itemId || !generatedField) {
    return <>{children}</>;
  }
  
  return (
    <UniversalContentEditor
      collection={collection}
      itemId={itemId}
      field={generatedField}
      value={textContent}
      tag={tag}
      className={className}
    />
  );
};

export default EditableTextNode;