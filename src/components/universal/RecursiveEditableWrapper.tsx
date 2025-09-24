import React from 'react';
import { EditableTextNode } from './EditableTextNode';
import { useInlineEditor } from './InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

interface RecursiveEditableWrapperProps {
  children: React.ReactNode;
  collection?: string;
  itemId?: string;
  baseFieldPrefix?: string;
  excludeClasses?: string[];
  excludeTags?: string[];
}

/**
 * RecursiveEditableWrapper recursively traverses the component tree
 * and makes all text nodes editable
 */
export const RecursiveEditableWrapper: React.FC<RecursiveEditableWrapperProps> = ({
  children,
  collection,
  itemId,
  baseFieldPrefix = 'content',
  excludeClasses = ['no-edit'],
  excludeTags = ['button', 'input', 'textarea', 'select', 'option']
}) => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;
  
  if (!canEdit) {
    return <>{children}</>;
  }
  
  // Process a single child node
  const processNode = (child: React.ReactNode, index: number): React.ReactNode => {
    // Handle text nodes directly
    if (typeof child === 'string' && child.trim()) {
      return (
        <EditableTextNode
          key={`editable-${index}`}
          collection={collection}
          itemId={itemId}
          field={`${baseFieldPrefix}_${index}`}
        >
          {child}
        </EditableTextNode>
      );
    }
    
    // Skip non-element nodes
    if (!React.isValidElement(child)) {
      return child;
    }
    
    const element = child as React.ReactElement;
    
    // Skip excluded elements
    const elementType = element.type as string;
    if (typeof elementType === 'string' && excludeTags.includes(elementType)) {
      return element;
    }
    
    // Skip elements with excluded classes
    const className = element.props.className || '';
    if (excludeClasses.some(cls => className.includes(cls))) {
      return element;
    }
    
    // Process children recursively
    if (element.props.children) {
      return React.cloneElement(
        element,
        { ...element.props, key: `wrapper-${index}` },
        React.Children.map(element.props.children, (grandchild, grandchildIndex) => 
          processNode(grandchild, index * 1000 + grandchildIndex)
        )
      );
    }
    
    return element;
  };
  
  return (
    <>
      {React.Children.map(children, (child, index) => processNode(child, index))}
    </>
  );
};

export default RecursiveEditableWrapper;