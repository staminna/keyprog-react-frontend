import React, { useState, useEffect } from 'react';
import { InlineRichText } from '@/components/inline';
import { InlineImage } from '@/components/inline';
import { InlineSelect } from '@/components/inline';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import { MCPService } from '@/services/mcpService';
import { EDITABLE_CONFIG } from '@/config/mcp-config';

export interface EditableContentProps {
  // Content type (text, richText, image, select)
  type: 'text' | 'richText' | 'image' | 'select';
  
  // Collection and item information
  collection: string;
  itemId: string;
  field: string;
  
  // Content value
  value: string;
  
  // For select type
  options?: Array<{ value: string; label: string }>;
  
  // Styling
  className?: string;
  
  // Callbacks
  onSave?: (value: string) => void;
  onError?: (error: Error) => void;
  
  // Backend sync options
  backendSyncEndpoint?: string;
  backendSyncData?: Record<string, unknown>;
  waitForBackendSync?: boolean;
  
  // Children for fallback rendering
  children?: React.ReactNode;
}

/**
 * Enhanced EditableContent component that works in both Directus and React environments
 * 
 * This component automatically detects whether it's running in Directus Visual Editor
 * or as a standalone React component, and provides appropriate editing capabilities.
 */
export const EditableContent: React.FC<EditableContentProps> = ({
  type,
  collection,
  itemId,
  field,
  value,
  options,
  className = '',
  onSave,
  onError,
  backendSyncEndpoint,
  backendSyncData,
  waitForBackendSync = false,
  children
}) => {
  // Get Directus editor context
  const { 
    isInDirectusEditor, 
    isAuthenticated, 
    isLoading,
    authChecked 
  } = useDirectusEditorContext();
  
  // Local state
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [contentValue, setContentValue] = useState(value);
  
  // Determine if editing should be allowed based on configuration and context
  useEffect(() => {
    if (isLoading || !authChecked) return;
    
    const canEdit = (
      // Allow editing in Directus Visual Editor if configured
      (isInDirectusEditor && EDITABLE_CONFIG.AUTH.ALLOW_DIRECTUS_EDITOR) ||
      // Allow editing when authenticated with Directus if configured
      (isAuthenticated && EDITABLE_CONFIG.AUTH.ALLOW_DIRECTUS_AUTH) ||
      // Allow editing without authentication if configured
      (!EDITABLE_CONFIG.AUTH.REQUIRE_AUTH)
    );
    
    setIsEditable(canEdit);
  }, [isInDirectusEditor, isAuthenticated, isLoading, authChecked]);
  
  // Handle save with MCP server integration
  const handleSave = async (newValue: string) => {
    if (!isEditable) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Update the content value
      setContentValue(newValue);
      
      // Save to Directus via MCP server
      await MCPService.updateItem(collection, itemId, { [field]: newValue });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(newValue);
      }
    } catch (err) {
      console.error('Error saving content:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded"></div>;
  }
  
  // Render appropriate editor based on type
  switch (type) {
    case 'text':
    case 'richText':
      return (
        <InlineRichText
          collection={collection}
          itemId={itemId}
          field={field}
          value={contentValue}
          canEdit={isEditable}
          className={className}
          onSave={handleSave}
          backendSyncEndpoint={backendSyncEndpoint}
          backendSyncData={backendSyncData}
          waitForBackendSync={waitForBackendSync}
        >
          {children}
        </InlineRichText>
      );
      
    case 'image':
      return (
        <InlineImage
          collection={collection}
          itemId={itemId}
          field={field}
          value={contentValue}
          canEdit={isEditable}
          className={className}
          onSave={handleSave}
          backendSyncEndpoint={backendSyncEndpoint}
          backendSyncData={backendSyncData}
          waitForBackendSync={waitForBackendSync}
        >
          {children}
        </InlineImage>
      );
      
    case 'select':
      if (!options || options.length === 0) {
        console.error('Options are required for select type');
        return <>{children || contentValue}</>;
      }
      
      return (
        <InlineSelect
          collection={collection}
          itemId={itemId}
          field={field}
          value={contentValue}
          options={options}
          canEdit={isEditable}
        />
      );
      
    default:
      console.error(`Unsupported editable content type: ${type}`);
      return <>{children || contentValue}</>;
  }
};

export default EditableContent;
