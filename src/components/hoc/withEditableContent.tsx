import React, { ComponentType, useState, useEffect } from 'react';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import { formatContentForDisplay } from '@/utils/contentParserV2';

// Props that the HOC will inject
export interface WithEditableContentProps {
  isEditable: boolean;
  isLoading: boolean;
  parsedContent: string;
  handleEdit: () => void;
  handleSave: (content: string) => Promise<void>;
  handleCancel: () => void;
}

// Props that the wrapped component must provide
export interface EditableComponentProps {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  canEdit?: boolean;
  onContentChange?: (content: string) => void;
}

/**
 * Higher-order component that adds editable content functionality
 * This HOC handles permission checking, content parsing, and editing state
 */
export function withEditableContent<P extends EditableComponentProps>(
  WrappedComponent: ComponentType<P & WithEditableContentProps>
) {
  // Return a new component
  return function WithEditableContent(props: P) {
    const { collection, itemId, field, value = '', canEdit = false, onContentChange } = props;
    
    // State
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [parsedContent, setParsedContent] = useState('');
    
    // Hooks
    const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
    const { canEditContent } = useRolePermissions();
    
    // Check if user has permission to edit this content
    const hasAuthPermission = isInDirectusEditor || isAuthenticated;
    const hasRolePermission = canEditContent(collection, field);
    const isEditable = canEdit && hasAuthPermission && hasRolePermission;
    
    // Parse content on mount and when it changes
    useEffect(() => {
      // Always format content for display
      const formatted = formatContentForDisplay(value || '');
      setParsedContent(formatted);
    }, [value]);
    
    // Handle edit button click
    const handleEdit = () => {
      if (isEditable) {
        setIsEditing(true);
      }
    };
    
    // Handle save
    const handleSave = async (newContent: string) => {
      if (!isEditable) return;
      
      setIsLoading(true);
      
      try {
        // Call onContentChange callback if provided
        if (onContentChange) {
          onContentChange(newContent);
        }
        
        // Format the content for display
        const formatted = formatContentForDisplay(newContent);
        setParsedContent(formatted);
        
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Handle cancel
    const handleCancel = () => {
      setIsEditing(false);
    };
    
    // Pass the new props to the wrapped component
    return (
      <WrappedComponent
        {...props}
        isEditable={isEditable}
        isLoading={isLoading}
        parsedContent={parsedContent}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleCancel={handleCancel}
      />
    );
  };
}

export default withEditableContent;
