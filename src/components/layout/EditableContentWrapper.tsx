import React, { ReactNode, useEffect } from 'react';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Button } from '@/components/ui/button';
import { Pencil, X } from 'lucide-react';

interface EditableContentWrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component that adds editing functionality to all pages
 */
const EditableContentWrapper: React.FC<EditableContentWrapperProps> = ({ children }) => {
  const { isEditing, setIsEditing, toggleEditing, canEdit } = useEditableContent();
  
  // Add keyboard shortcuts for toggling editing mode
  useEffect(() => {
    if (!canEdit) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts if Ctrl/Cmd key is pressed
      if (!(event.ctrlKey || event.metaKey)) return;
      
      if (event.key === 'e') { // Ctrl/Cmd + E: Toggle editing
        toggleEditing();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canEdit, toggleEditing]);
  
  return (
    <div className="editable-content-wrapper">
      {/* Only show edit toggle if user can edit */}
      {canEdit && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={toggleEditing}
            variant={isEditing ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 shadow-lg"
            title="Ctrl/Cmd + E"
          >
            {isEditing ? (
              <>
                <X size={16} />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Pencil size={16} />
                <span>Edit Content</span>
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Add a visual indicator when editing is active */}
      {isEditing && (
        <div className="fixed top-0 left-0 w-full bg-blue-500 text-white text-center py-1 text-sm z-40 flex items-center justify-center">
          <span>Editing Mode Active - Hover over content to edit</span>
          <div className="ml-4 flex items-center">
            <span className="text-xs mr-1">Press</span>
            <kbd className="mx-1 bg-blue-600 text-white px-1.5 py-0.5 text-xs rounded">Ctrl/⌘+E</kbd>
            <span className="mx-1">to exit</span>
          </div>
        </div>
      )}
      
      {/* Render children with additional padding when editing is active */}
      <div className={isEditing ? "pt-8" : ""}>
        {children}
      </div>
    </div>
  );
};

export default EditableContentWrapper;
