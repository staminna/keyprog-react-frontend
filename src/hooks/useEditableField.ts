import { useState, useEffect } from 'react';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import { formatContentForDisplay, cleanContentForSaving } from '@/utils/contentParserV2';

interface UseEditableFieldOptions {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  canEdit?: boolean;
  onContentChange?: (content: string) => void;
}

interface UseEditableFieldResult {
  isEditing: boolean;
  isLoading: boolean;
  isEditable: boolean;
  parsedContent: string;
  content: string;
  startEditing: () => void;
  cancelEditing: () => void;
  saveContent: (newContent: string) => Promise<void>;
}

/**
 * Custom hook for editable fields
 * Handles permissions, content parsing, and editing state
 */
export function useEditableField({
  collection,
  itemId,
  field,
  value = '',
  canEdit = false,
  onContentChange
}: UseEditableFieldOptions): UseEditableFieldResult {
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(value);
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
    setContent(value || '');
  }, [value]);
  
  // Start editing
  const startEditing = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  // Save content
  const saveContent = async (newContent: string) => {
    if (!isEditable || !itemId) return;
    
    setIsLoading(true);
    
    try {
      // Clean content before saving
      const cleanedContent = cleanContentForSaving(newContent);
      
      // Update content in Directus
      await DirectusServiceExtension.updateField(collection, itemId, field, cleanedContent);
      
      // Update local state
      setContent(newContent);
      setParsedContent(formatContentForDisplay(newContent));
      
      // Call onContentChange callback if provided
      if (onContentChange) {
        onContentChange(newContent);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isEditing,
    isLoading,
    isEditable,
    parsedContent,
    content,
    startEditing,
    cancelEditing,
    saveContent
  };
}

export default useEditableField;
