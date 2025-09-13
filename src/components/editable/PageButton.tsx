import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Button, ButtonProps } from '@/components/ui/button';
import { EditableContent } from '@/components/inline';
import useRolePermissions from '@/hooks/useRolePermissions';
import { cn } from '@/lib/utils';
import './preview-mode.css';

interface PageButtonProps extends Omit<ButtonProps, 'children'> {
  id: string;
  collection: string;
  field: string;
  value: string;
  linkTo?: string;
  className?: string;
  previewValue?: string;
}

/**
 * PageButton component that makes any button on a page editable
 * This component can be used across all pages to make specific buttons editable
 */
const PageButton: React.FC<PageButtonProps> = ({
  id,
  collection,
  field,
  value,
  linkTo,
  className = '',
  previewValue,
  ...buttonProps
}) => {
  const { editMode, isEditMode, isPreviewMode, canEdit } = useEditableContent();
  const { canEditContent } = useRolePermissions();
  const [localPreviewValue, setLocalPreviewValue] = useState<string | undefined>(previewValue);
  
  // Check if user has role permission to edit this content
  const hasRolePermission = canEditContent(collection, field);
  const hasEditPermission = canEdit && hasRolePermission;
  
  // Handle button text updates during editing
  const handleTextUpdate = (newValue: string) => {
    setLocalPreviewValue(newValue);
  };
  
  // Determine which value to display
  const displayValue = isPreviewMode && localPreviewValue !== undefined ? localPreviewValue : value;
  
  // If in view mode or preview mode, just render the button
  if (!isEditMode) {
    const ButtonContent = () => <>{displayValue}</>;
    
    if (linkTo) {
      return (
        <Button 
          asChild 
          className={cn(className, { 'preview-button': isPreviewMode })} 
          {...buttonProps}
        >
          <Link to={linkTo}>
            <ButtonContent />
          </Link>
        </Button>
      );
    }
    
    return (
      <Button 
        className={cn(className, { 'preview-button': isPreviewMode })} 
        {...buttonProps}
      >
        <ButtonContent />
      </Button>
    );
  }
  
  // In edit mode, render with EditableContent
  return (
    <div className="relative">
      <Button
        className={cn('pointer-events-none', className)}
        {...buttonProps}
      >
        {value}
      </Button>
      
      <div className="absolute inset-0">
        <EditableContent
          collection={collection}
          itemId={id}
          field={field}
          value={value}
          canEdit={canEdit}
          className="w-full h-full opacity-0"
          onContentChange={handleTextUpdate}
        />
      </div>
    </div>
  );
};

export default PageButton;
