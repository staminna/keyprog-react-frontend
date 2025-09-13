import React, { useState } from 'react';
import { useDirectusContent } from '@/hooks/useDirectusContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Save } from 'lucide-react';

interface DirectusContentExampleProps {
  collection: string;
  itemId?: string | number;
  slug?: string;
  fields: string[];
  title?: string;
  className?: string;
}

/**
 * Example component demonstrating bidirectional data flow with Directus
 * Uses the useDirectusContent hook for real-time synchronization
 */
export const DirectusContentExample: React.FC<DirectusContentExampleProps> = ({
  collection,
  itemId,
  slug,
  fields,
  title = 'Directus Content',
  className = ''
}) => {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  
  // Use our custom hook for bidirectional data flow
  const {
    data,
    isLoading,
    error,
    refresh,
    updateField,
    canEdit,
    isSyncing
  } = useDirectusContent({
    collection,
    itemId,
    slug,
    autoSync: true,
    syncInterval: 30000 // 30 seconds
  });
  
  // Toggle edit mode for a specific field
  const toggleEditMode = (field: string) => {
    if (editMode[field]) {
      // Save changes when exiting edit mode
      handleSave(field);
    } else {
      // Enter edit mode with current value
      setEditValues({
        ...editValues,
        [field]: data && data[field] ? String(data[field]) : ''
      });
    }
    
    setEditMode({
      ...editMode,
      [field]: !editMode[field]
    });
  };
  
  // Handle input change
  const handleChange = (field: string, value: string) => {
    setEditValues({
      ...editValues,
      [field]: value
    });
  };
  
  // Save changes to Directus
  const handleSave = async (field: string) => {
    if (!data) return;
    
    const value = editValues[field];
    const success = await updateField(field, value);
    
    if (success) {
      console.log(`Successfully updated ${field}`);
    } else {
      console.error(`Failed to update ${field}`);
    }
  };
  
  // Format field name for display
  const formatFieldName = (field: string) => {
    return field
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Determine if a field should be rendered as a textarea
  const isTextareaField = (field: string, value: unknown) => {
    if (typeof value !== 'string') return false;
    
    // Fields that typically contain longer text
    const textareaFields = ['content', 'description', 'body', 'text', 'details'];
    
    // Check if field name contains any of the textarea fields
    const isNameMatch = textareaFields.some(textField => field.includes(textField));
    
    // Check if content is long enough to warrant a textarea
    const isLongContent = typeof value === 'string' && value.length > 100;
    
    return isNameMatch || isLongContent;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 text-red-700 p-4 rounded-md ${className}`}>
        <p className="mb-2">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // Render no data state
  if (!data) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md ${className}`}>
        <p>No data available</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={refresh}
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        
        <div className="flex items-center gap-2">
          {isSyncing && (
            <span className="text-xs text-gray-500 flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Syncing...
            </span>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isSyncing}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {fields.map(field => {
          const value = data[field];
          const isEditing = editMode[field] || false;
          const isTextarea = isTextareaField(field, value);
          
          return (
            <div key={field} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  {formatFieldName(field)}
                </label>
                
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEditMode(field)}
                    disabled={isSyncing}
                  >
                    {isEditing ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      'Edit'
                    )}
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                isTextarea ? (
                  <Textarea
                    value={editValues[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full"
                    rows={5}
                  />
                ) : (
                  <Input
                    value={editValues[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full"
                  />
                )
              ) : (
                <div className="mt-1 text-gray-900 bg-gray-50 p-2 rounded min-h-[2rem]">
                  {typeof value === 'string' ? (
                    value.includes('\n') ? (
                      value.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < value.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))
                    ) : (
                      value
                    )
                  ) : (
                    JSON.stringify(value)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
        Collection: {collection} {itemId && `• ID: ${itemId}`} {slug && `• Slug: ${slug}`}
      </div>
    </div>
  );
};

export default DirectusContentExample;
