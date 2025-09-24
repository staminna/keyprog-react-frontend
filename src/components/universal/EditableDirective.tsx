import React, { useEffect, useRef } from 'react';
import { UniversalContentEditor } from './UniversalContentEditor';
import { useInlineEditor } from './InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRouteContent from '@/hooks/useRouteContent';

interface EditableDirectiveProps {
  children: React.ReactNode;
  field: string;
  collection?: string;
  itemId?: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  placeholder?: string;
}

/**
 * EditableDirective provides a directive-based approach for marking any HTML element as editable
 * Usage: <Editable field="title">My Title</Editable>
 */
export const Editable: React.FC<EditableDirectiveProps> = ({
  children,
  field,
  collection: propCollection,
  itemId: propItemId,
  tag = 'span',
  className = '',
  placeholder = 'Click to edit...'
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;
  
  // Get route content mapping if collection/itemId not provided
  const { collection: routeCollection, itemId: routeItemId } = useRouteContent();
  
  // Use provided values or fall back to route content
  const collection = propCollection || routeCollection;
  const itemId = propItemId || routeItemId;
  
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
  
  if (!canEdit || !collection || !itemId) {
    return <>{children}</>;
  }
  
  return (
    <UniversalContentEditor
      collection={collection}
      itemId={itemId}
      field={field}
      value={textContent}
      tag={tag}
      className={className}
      placeholder={placeholder}
    />
  );
};

/**
 * EditableSection wraps a section of content and makes all text nodes editable
 * It automatically registers the section with Directus
 */
export const EditableSection: React.FC<{
  children: React.ReactNode;
  sectionId: string;
  collection?: string;
  itemId?: string;
  className?: string;
}> = ({
  children,
  sectionId,
  collection: propCollection,
  itemId: propItemId,
  className = ''
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;
  
  // Get route content mapping if collection/itemId not provided
  const { collection: routeCollection, itemId: routeItemId } = useRouteContent();
  
  // Use provided values or fall back to route content
  const collection = propCollection || routeCollection;
  const itemId = propItemId || routeItemId;
  
  // Reference to the section element
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Register the section with Directus on mount
  useEffect(() => {
    if (canEdit && sectionRef.current) {
      // Add a data attribute to identify the section
      sectionRef.current.setAttribute('data-editable-section', sectionId);
      sectionRef.current.setAttribute('data-editable-collection', collection);
      sectionRef.current.setAttribute('data-editable-item-id', itemId);
      
      // Add a hover effect to indicate the section is editable
      sectionRef.current.classList.add('editable-section');
    }
  }, [canEdit, sectionId, collection, itemId]);
  
  return (
    <div ref={sectionRef} className={`editable-section-wrapper ${className}`}>
      {children}
    </div>
  );
};

export default Editable;