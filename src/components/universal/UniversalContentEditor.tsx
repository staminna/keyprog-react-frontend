import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrueInlineEditor } from '@/components/inline/TrueInlineEditor';
import { ContentParser } from '@/components/remirror/ContentParser';
import { formatContentForDisplay } from '@/utils/contentParserV2';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useInlineEditor } from '@/components/universal/inline-editor-context';
import { useGlobalEditingState } from '@/hooks/global-editing-utils';
import { usePersistentContent } from '@/hooks/usePersistentContent';
import { Edit3, Check, X, Loader2, RefreshCw } from 'lucide-react';

type UniversalContentEditorProps<T extends React.ElementType> = {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  tag?: T;
  showEditIcon?: boolean;
  alwaysEditing?: boolean; // New prop to always show editor
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
  alwaysEditing = false,
  onContentChange,
  ...rest
}: UniversalContentEditorProps<T>) => {
  const Tag = tag || 'div';
  const [isEditing, setIsEditing] = useState(false);
  const { canEdit: userCanEdit, user } = useUnifiedAuth();
  const { isInlineEditingEnabled } = useInlineEditor();
  const globalEditingState = useGlobalEditingState();
  
  // Check if we're in Directus Visual Editor
  const isInDirectusEditor = useMemo(() => {
    try {
      const isInIframe = window.self !== window.top;
      const referrer = document.referrer;
      return isInIframe && (referrer.includes('localhost:8065') || referrer.includes('/admin/'));
    } catch {
      return false;
    }
  }, []);
  
  // Create unique session ID for this editor instance
  const sessionId = `${collection}-${itemId}-${field}`;
  
  // Use persistent content instead of auto-refresh
  const {
    content,
    isLoading,
    isSaving,
    lastSaved,
    error,
    updateContent,
    saveToServer,
    refreshFromServer,
    discardChanges,
  } = usePersistentContent({
    collection,
    itemId,
    field,
    initialValue: value,
  });
  
  const [parsedContent, setParsedContent] = useState('');

  // Unified permission check - ONLY Administrator and Editor roles can edit
  const canEdit = useMemo(() => {
    // userCanEdit already checks for admin/editor roles in UnifiedAuthContext
    const hasPermission = isInDirectusEditor || userCanEdit;
    const editingEnabled = isInlineEditingEnabled;
    const result = hasPermission && editingEnabled;
    
    // Debug logging disabled to reduce console noise
    // Uncomment below for debugging permission issues
    /*
    if (process.env.NODE_ENV === 'development') {
      const logKey = `canEdit-${collection}-${field}`;
      const prevResult = (window as any)[logKey];
      if (prevResult !== result) {
        console.log('🔐 UniversalContentEditor canEdit check:', {
          collection,
          field,
          userRole: user?.role,
          isInDirectusEditor,
          userCanEdit,
          isInlineEditingEnabled,
          hasPermission,
          editingEnabled,
          canEdit: result
        });
        (window as any)[logKey] = result;
      }
    }
    */
    
    return result;
  }, [isInDirectusEditor, userCanEdit, isInlineEditingEnabled]);


  // Auto-enable editing mode if alwaysEditing is true
  useEffect(() => {
    if (alwaysEditing && canEdit && !isEditing && !isLoading) {
      console.log('🔄 Auto-enabling edit mode (alwaysEditing=true)');
      setIsEditing(true);
      globalEditingState.startEditing(sessionId);
    }
  }, [alwaysEditing, canEdit, isEditing, isLoading, globalEditingState, sessionId]);

  useEffect(() => {
    if (content !== undefined && !isEditing) {
      const parsed = formatContentForDisplay(content);
      setParsedContent(parsed);
    }
  }, [content, isEditing]);

  // Initialize content on mount if not already set - memoized to prevent unnecessary effects
  const initialParsedContent = useMemo(() => {
    if (!parsedContent && value && !isEditing) {
      return formatContentForDisplay(value);
    }
    return null;
  }, [value, parsedContent, isEditing]);
  
  useEffect(() => {
    if (initialParsedContent) {
      setParsedContent(initialParsedContent);
    }
  }, [initialParsedContent]);

  // Handle edit button click - memoized to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    // Reduced logging
    if (canEdit) {
      console.log('✅ Starting edit mode:', { collection, field });
      setIsEditing(true);
      globalEditingState.startEditing(sessionId);
    } else {
      console.log('❌ Edit prevented - permissions denied');
    }
  }, [canEdit, globalEditingState, sessionId, collection, field]);

  const handleSave = async (newContent: string) => {
    if (!canEdit) {
      console.warn('❌ Cannot save, permissions denied');
      return;
    }
    
    globalEditingState.startUpdating(sessionId);
    
    try {
      // Update content using persistent storage
      updateContent(newContent);
      const success = await saveToServer(newContent);
      
      if (success) {
        // Immediately update local state with the new content
        const parsed = formatContentForDisplay(newContent);
        setParsedContent(parsed);
        
        // Call the onChange callback if provided
        if (onContentChange) {
          onContentChange(newContent);
        }
        
        // Exit editing mode
        setIsEditing(false);
        globalEditingState.stopEditing(sessionId);
      }
      
    } catch (error) {
      console.error('UniversalContentEditor: Failed to update content:', error);
    } finally {
      globalEditingState.stopUpdating(sessionId);
    }
  };

  // Handle cancel - memoized to prevent unnecessary re-renders
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    globalEditingState.stopEditing(sessionId);
  }, [globalEditingState, sessionId]);

  // If editing, show the rich text editor
  if (isEditing) {
    return (
      <TrueInlineEditor
        value={content || ''}
        onSave={handleSave}
        onCancel={handleCancel}
        className={rest.className || ''}
      />
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 size={16} className="animate-spin text-gray-400" />
      </div>
    );
  }

  // If not editing, show the parsed content with edit button and status indicators
  return (
    <div className="relative group">
      {/* Content display */}
      <Tag
        {...rest}
        className={`${rest.className || ''} ${canEdit ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-400 transition-outline' : ''}`}
        onClick={canEdit ? handleEdit : undefined}
        style={{ position: 'relative', ...rest.style }}
      >
        {parsedContent ? (
          <ContentParser content={parsedContent} />
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </Tag>
      
      {/* Status indicators */}
      {(isSaving || error) && (
        <div className="absolute -top-2 -right-2 flex items-center space-x-1">
          {isSaving && (
            <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded flex items-center">
              <Loader2 size={10} className="animate-spin mr-1" />
              Saving
            </div>
          )}
          {error && (
            <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded" title={error}>
              Error
            </div>
          )}
        </div>
      )}
      
      {/* Manual refresh button for editors */}
      {canEdit && !isEditing && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refreshFromServer();
            }}
            className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            title="Refresh from server"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UniversalContentEditor;
