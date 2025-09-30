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
  
  // Don't show any UI - inline editor handles everything
  return <>{children}</>;
};

export default EditableContentWrapper;
