import React, { ReactNode, ReactElement, cloneElement, isValidElement } from 'react';
import { useInlineEditor } from './inline-editor-context';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { UniversalEditableContent } from './UniversalEditableContent';

interface UniversalPageWrapperProps {
  children: ReactNode;
  collection?: string;
  itemId?: string | number;
  autoDetect?: boolean;
}

/**
 * Universal page wrapper that automatically enables inline editing for content
 * This component scans the page content and makes common elements editable
 */
export const UniversalPageWrapper: React.FC<UniversalPageWrapperProps> = ({
  children,
  collection = 'pages',
  itemId = '1',
  autoDetect = true, // Enabled by default for universal editing
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { canEditContent } = useRolePermissions();

  // If inline editing is not enabled, render children as-is
  if (!isInlineEditingEnabled || !canEditContent(collection, 'content')) {
    return <>{children}</>;
  }

  // If auto-detection is disabled, render children as-is
  if (!autoDetect) {
    return <>{children}</>;
  }

  /**
   * Recursively enhance children to make them editable
   */
  const enhanceChildren = (node: ReactNode, depth = 0): ReactNode => {
    // Prevent infinite recursion
    if (depth > 10) return node;

    if (isValidElement(node)) {
      const element = node as ReactElement;
      
      // Skip if element is already wrapped by our editing components
      if (isEditingComponent(element)) {
        return node;
      }
      
      // Check if this is a text element that should be made editable
      if (shouldMakeEditable(element)) {
        const field = inferFieldName(element);
        const elementItemId = inferItemId(element, itemId);
        const detectedCollection = inferCollection(element, collection);
        
        return (
          <UniversalEditableContent
            collection={detectedCollection}
            itemId={elementItemId}
            field={field}
            value={extractTextContent(element)}
            tag={element.type as keyof JSX.IntrinsicElements}
            className={element.props.className}
            autoDetect={true}
          >
            {element.props.children}
          </UniversalEditableContent>
        );
      }

      // Recursively process children
      if (element.props.children) {
        const enhancedChildren = React.Children.map(element.props.children, (child) =>
          enhanceChildren(child, depth + 1)
        );
        
        return cloneElement(element, {}, enhancedChildren);
      }
    }

    return node;
  };

  return <>{enhanceChildren(children)}</>;
};

/**
 * Check if element is already an editing component
 */
function isEditingComponent(element: ReactElement): boolean {
  const componentName = element.type?.toString();
  return componentName?.includes('UniversalEditableContent') || 
         componentName?.includes('SimpleEditableText') ||
         componentName?.includes('UniversalContentEditor');
}

/**
 * Determine if an element should be made editable
 */
function shouldMakeEditable(element: ReactElement): boolean {
  const editableTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'];
  const tagName = typeof element.type === 'string' ? element.type : '';
  const className = element.props.className || '';
  
  // Skip elements that are likely navigation or UI components
  if (className.includes('nav') || className.includes('menu') || 
      className.includes('button') || className.includes('link')) {
    return false;
  }
  
  // Check if it's an editable tag and has text content
  return editableTags.includes(tagName) && hasTextContent(element);
}

/**
 * Check if element has direct text content
 */
function hasTextContent(element: ReactElement): boolean {
  const { children } = element.props;
  return typeof children === 'string' && children.trim().length > 5; // Minimum 5 chars
}

/**
 * Infer field name from element properties
 */
function inferFieldName(element: ReactElement): string {
  const tagName = typeof element.type === 'string' ? element.type : 'content';
  const className = element.props.className || '';
  
  // Try to infer field name from class names or tag
  if (className.includes('title') || tagName === 'h1') return 'title';
  if (className.includes('subtitle') || tagName === 'h2') return 'subtitle';
  if (className.includes('description') || tagName === 'p') return 'description';
  if (tagName.startsWith('h')) return 'heading';
  
  return 'content';
}

/**
 * Infer collection from element context
 */
function inferCollection(element: ReactElement, defaultCollection: string): string {
  const className = element.props.className || '';
  const dataCollection = element.props['data-collection'];
  
  if (dataCollection) return dataCollection;
  if (className.includes('hero')) return 'hero';
  if (className.includes('service')) return 'sub_menu_content';
  if (className.includes('contact')) return 'contact_info';
  
  return defaultCollection;
}

/**
 * Infer item ID from element or use default
 */
function inferItemId(element: ReactElement, defaultId: string | number): string {
  const id = element.props.id || element.props['data-id'];
  return id ? String(id) : String(defaultId);
}

/**
 * Extract text content from element
 */
function extractTextContent(element: ReactElement): string {
  const { children } = element.props;
  return typeof children === 'string' ? children : '';
}

export default UniversalPageWrapper;
