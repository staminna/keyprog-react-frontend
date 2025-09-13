import React, { useState } from 'react';
import { useEditableContent } from '@/hooks/useEditableContent';
import { EditableImage } from '@/components/inline';
import useRolePermissions from '@/hooks/useRolePermissions';
import { cn } from '@/lib/utils';
import './preview-mode.css';

interface PageImageProps {
  id: string;
  collection: string;
  field: string;
  value: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  previewValue?: string;
}

/**
 * PageImage component that makes any image on a page editable
 * This component can be used across all pages to make specific images editable
 */
const PageImage: React.FC<PageImageProps> = ({
  id,
  collection,
  field,
  value,
  alt = '',
  className = '',
  imgClassName = '',
  previewValue
}) => {
  const { editMode, isEditMode, isPreviewMode, canEdit } = useEditableContent();
  const { canEditContent } = useRolePermissions();
  const [localPreviewValue, setLocalPreviewValue] = useState<string | undefined>(previewValue);
  
  // Check if user has role permission to edit this content
  const hasRolePermission = canEditContent(collection, field);
  const hasEditPermission = canEdit && hasRolePermission;
  
  // Handle image updates during editing
  const handleImageUpdate = (newValue: string) => {
    setLocalPreviewValue(newValue);
  };
  
  // Determine which value to display
  const displayValue = isPreviewMode && localPreviewValue !== undefined ? localPreviewValue : value;
  
  // If in view mode or preview mode, just render the image
  if (!isEditMode) {
    return (
      <div className={cn(className, { 'preview-content': isPreviewMode })}>
        {displayValue ? (
          <img 
            src={displayValue} 
            alt={alt} 
            className={cn(imgClassName, { 'preview-image': isPreviewMode })} 
          />
        ) : (
          <div className={cn('bg-gray-100 flex items-center justify-center', imgClassName)}>
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
    );
  }
  
  // In edit mode, render with EditableImage
  return (
    <EditableImage
      collection={collection}
      itemId={id}
      field={field}
      value={value}
      canEdit={canEdit}
      className={cn('editable-page-image', imgClassName)}
      onContentChange={handleImageUpdate}
    />
  );
};

export default PageImage;
