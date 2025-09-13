import React, { useState } from 'react';
import { InlineRichText, InlineRichTextProps } from '@/components/inline';
import { FloatingEditIcon } from './FloatingEditIcon';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';

export interface EditableContentProps extends InlineRichTextProps {
  showEditIcon?: boolean;
  onContentChange?: (content: string) => void;
}

/**
 * Enhanced InlineRichText component with floating edit icon
 * This component wraps the standard InlineRichText and adds a floating edit icon
 * that appears when hovering over the content
 */
export const EditableContent: React.FC<EditableContentProps> = ({
  showEditIcon = true,
  canEdit = false,
  className = '',
  children,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const { canEditContent } = useRolePermissions();
  
  // Determine if editing should be enabled based on authentication and role permissions
  const hasAuthPermission = canEdit && (isInDirectusEditor || isAuthenticated);
  const hasRolePermission = canEditContent(props.collection, props.field);
  const isEditable = hasAuthPermission && hasRolePermission;
  
  // Handle edit button click
  const handleEdit = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };
  
  // Handle save or cancel
  const handleSaveOrCancel = (content?: string) => {
    setIsEditing(false);
    
    // If content is provided and onContentChange callback exists, call it
    if (content && props.onContentChange) {
      props.onContentChange(content);
    }
  };
  
  // If not editable or edit icon disabled, just render the InlineRichText
  if (!isEditable || !showEditIcon) {
    return <InlineRichText canEdit={canEdit} className={className} {...props} />;
  }
  
  // If already editing, render the InlineRichText with callbacks
  if (isEditing) {
    return (
      <div className="editing-container relative">
        <div className="editing-indicator absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-sm z-10">
          Editing
        </div>
        <div className="border-2 border-blue-300 rounded-md p-2 bg-blue-50/20">
          <InlineRichText 
            canEdit={canEdit} 
            className={`${className} editing`} 
            onSave={(content) => handleSaveOrCancel(content)}
            onCancel={() => handleSaveOrCancel()}
            {...props} 
          />
        </div>
      </div>
    );
  }
  
  // Render with always visible edit icon
  return (
    <div className={`editable-content-container relative p-1 rounded-md transition-all bg-indigo-50/10 border-2 border-dashed border-indigo-200/30 ${className}`}>
      <div className="editable-content">
        {children || (
          <div 
            className="prose prose-lg max-w-none rounded p-1" 
            dangerouslySetInnerHTML={{ __html: props.value }}
          />
        )}
      </div>
      
      <div className="absolute top-0 right-0">
        <FloatingEditIcon onEdit={handleEdit} />
      </div>
      
      <div className="absolute bottom-1 right-1 text-xs text-indigo-400">
        Click to edit
      </div>
    </div>
  );
};

export default EditableContent;
