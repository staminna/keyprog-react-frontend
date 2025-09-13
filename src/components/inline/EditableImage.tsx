import React, { useState } from 'react';
import { InlineImage, InlineImageProps } from '@/components/inline';
import { FloatingEditIcon } from './FloatingEditIcon';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import { Image as ImageIcon } from 'lucide-react';
import './floating-edit-icon.css';

export interface EditableImageProps extends Omit<InlineImageProps, 'className'> {
  showEditIcon?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
}

/**
 * Enhanced InlineImage component with floating edit icon
 * This component wraps the standard InlineImage and adds a floating edit icon
 * that appears when hovering over the image
 */
export const EditableImage: React.FC<EditableImageProps> = ({
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
  const handleSaveOrCancel = (imageUrl?: string) => {
    setIsEditing(false);
    
    // If imageUrl is provided and onContentChange callback exists, call it
    if (imageUrl && props.onContentChange) {
      props.onContentChange(imageUrl);
    }
  };
  
  // If not editable or edit icon disabled, just render the InlineImage
  if (!isEditable || !showEditIcon) {
    return <InlineImage canEdit={canEdit} className={className} {...props} />;
  }
  
  // If already editing, render the InlineImage with callbacks
  if (isEditing) {
    return (
      <div className="editing-container relative">
        <div className="editing-indicator absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-sm z-10 flex items-center">
          <ImageIcon size={12} className="mr-1" /> Editing Image
        </div>
        <div className="border-2 border-blue-300 rounded-md p-2 bg-blue-50/20">
          <InlineImage 
            canEdit={canEdit} 
            className={`${className} editing`} 
            onUpload={(imageUrl) => handleSaveOrCancel(imageUrl)}
            {...props} 
          />
        </div>
      </div>
    );
  }
  
  // Check if there's an image to display
  const hasImage = props.value && props.value.length > 0;
  
  // Render with always visible edit icon
  return (
    <div className="editable-image-container relative border-2 border-dashed border-indigo-200 rounded-md p-1 bg-indigo-50/10">
      <div className={`editable-image ${hasImage ? '' : 'empty-image'}`}>
        <InlineImage 
          {...props}
          canEdit={false} // Disable default editing behavior
          className={`${className} ${hasImage ? '' : 'border-2 border-dashed border-gray-300'}`}
        />
        
        {!hasImage && (
          <div className="flex items-center justify-center h-full w-full absolute inset-0">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="absolute top-2 right-2">
        <FloatingEditIcon onEdit={handleEdit} />
      </div>
      
      <div className="absolute bottom-1 right-1 text-xs text-indigo-400">
        Click to edit image
      </div>
    </div>
  );
};

export default EditableImage;
