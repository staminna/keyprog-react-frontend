import React, { ReactNode, useState } from 'react';
import { useEditableContent } from '@/hooks/useEditableContent';
import { EditableContent } from '@/components/inline';
import useRolePermissions from '@/hooks/useRolePermissions';
import { cn } from '@/lib/utils';
import { PencilIcon } from 'lucide-react';
import './hover-edit.css';

interface PageSectionProps {
  id: string;
  collection: string;
  field: string;
  value: string;
  children?: ReactNode;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * PageSection component that makes any section of a page editable
 * This component can be used across all pages to make specific sections editable
 */
const PageSection: React.FC<PageSectionProps> = ({
  id,
  collection,
  field,
  value,
  children,
  className = '',
  tag: Tag = 'div'
}) => {
  const { editMode, isEditMode, toggleEditMode, canEdit } = useEditableContent();
  const { canEditContent } = useRolePermissions();
  const [isHovering, setIsHovering] = useState(false);
  
  // Check if user has role permission to edit this content
  const hasRolePermission = canEditContent(collection, field);
  const hasEditPermission = canEdit && hasRolePermission;
  
  // Handle mouse events for hover effect
  const handleMouseEnter = () => {
    if (hasEditPermission) {
      setIsHovering(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  // Handle edit icon click
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasEditPermission && !isEditMode) {
      toggleEditMode();
    }
  };
  
  // If in view mode, render the content with hover effect and edit icon
  if (!isEditMode) {
    // If children are provided, use them directly
    if (children) {
      return (
        <Tag 
          className={cn(className, { 'hover-editable': hasEditPermission })} 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
          {isHovering && hasEditPermission && (
            <button 
              className="edit-icon-button" 
              onClick={handleEditClick}
              aria-label="Edit content"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </Tag>
      );
    }
    
    // Otherwise, render the content with proper HTML structure
    return (
      <Tag 
        className={cn(className, { 'hover-editable': hasEditPermission })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span dangerouslySetInnerHTML={{ __html: value }} />
        {isHovering && hasEditPermission && (
          <button 
            className="edit-icon-button" 
            onClick={handleEditClick}
            aria-label="Edit content"
          >
            <PencilIcon size={16} />
          </button>
        )}
      </Tag>
    );
  }
  
  // In edit mode, render with EditableContent
  return (
    <EditableContent
      collection={collection}
      itemId={id}
      field={field}
      value={value}
      canEdit={canEdit}
      className={cn('editable-page-section', className)}
    >
      {children}
    </EditableContent>
  );
};

export default PageSection;
