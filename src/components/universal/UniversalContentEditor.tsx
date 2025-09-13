import React, { useState, useEffect, useCallback } from 'react';
import { TrueInlineEditor } from '@/components/inline/TrueInlineEditor';
import { ContentParser } from '@/components/remirror/ContentParser';
import { formatContentForDisplay } from '@/utils/contentParserV2';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import useAutoRefresh from '@/hooks/useAutoRefresh';
import { useInlineEditor } from '@/components/universal/InlineEditorProvider';
import { Edit3, Check, X, Loader2, RefreshCw } from 'lucide-react';

type UniversalContentEditorProps<T extends React.ElementType> = {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  tag?: T;
  showEditIcon?: boolean;
  onContentChange?: (content: string) => void;
} & Omit<React.ComponentPropsWithoutRef<T>, 'value' | 'onChange'>;

/**
 * Universal Content Editor component that works with any content type
 * Handles doc(paragraph(...)) syntax and supports all content types
 */
export const UniversalContentEditor = <T extends React.ElementType = 'div'>({
  collection,
  itemId,
  field,
  value = '',
  placeholder = 'Click to edit...',
  tag,
  showEditIcon = true,
  onContentChange,
  ...rest
}: UniversalContentEditorProps<T>) => {
  const Tag = tag || 'div';
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [parsedContent, setParsedContent] = useState('');
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const { canEditContent } = useRolePermissions();
  const { isInlineEditingEnabled } = useInlineEditor();

  const canEverEdit = (isInDirectusEditor || isAuthenticated) && canEditContent(collection, field);
  const canEdit = canEverEdit && isInlineEditingEnabled;

  const fetchLatestContent = useCallback(async () => {
    try {
      const item = await DirectusServiceExtension.getCollectionItemSafe(collection, itemId);
      if (item && field in item) {
        return String(item[field] || '');
      }
      return value || '';
    } catch (error) {
      console.error(`Error fetching latest content for ${collection}.${field}:`, error);
      return value || '';
    }
  }, [collection, itemId, field, value]);

  const { data: content, isLoading, isRefreshing, refresh } = useAutoRefresh<string>(
    fetchLatestContent,
    {
      enabled: !isEditing, // Disable polling while editing
      refreshOnWindowFocus: true,
    }
  );

  useEffect(() => {
    if (content !== undefined) {
      const parsed = formatContentForDisplay(content);
      setParsedContent(parsed);
    }
  }, [content]);

  // Handle edit button click
  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleSave = async (newContent: string) => {
    if (!canEdit) return;
    setIsUpdating(true);
    try {
      await DirectusServiceExtension.updateField(collection, itemId, field, newContent);
      if (onContentChange) {
        onContentChange(newContent);
      }
      await refresh(); // Refresh data from server to ensure consistency
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update content:', error);
      // Optionally show an error message to the user
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
  };

  // If editing, show the rich text editor
  if (isEditing) {
    return (
      <div className="relative border-2 border-blue-300 rounded-md p-2 bg-blue-50/20">
        <TrueInlineEditor
          value={content || ''}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // If not editing, show the parsed content with edit button
  return (
    <div className="relative group">
      {/* Content display */}
      <Tag
        {...rest}
        className={`${rest.className || ''} ${canEdit ? 'hover:bg-gray-50 rounded transition-colors duration-200' : ''}`}
        onClick={canEdit ? handleEdit : undefined}
      >
        {parsedContent ? (
          <ContentParser content={parsedContent} />
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </Tag>
      
      <div className="absolute top-0 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {canEdit && showEditIcon && (
          <button
            onClick={handleEdit}
            className="p-1 bg-white rounded-full shadow-sm"
            title="Edit content"
          >
            <Edit3 size={16} className="text-blue-500" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); refresh(); }}
          className="p-1 bg-white rounded-full shadow-sm"
          title="Refresh content"
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {(isLoading || isUpdating) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <Loader2 size={24} className="text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default UniversalContentEditor;
