import React, { useState, useRef } from 'react';
import { DirectusService } from '@/services/directusService';
import { UploadService, BackendSyncOptions } from '@/services/uploadService';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import { Image, Upload, X, RefreshCw } from 'lucide-react';

export interface InlineImageProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  children?: React.ReactNode;
  className?: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  forceEditable?: boolean;
  /**
   * Backend endpoint to sync with after upload
   */
  backendSyncEndpoint?: string;
  /**
   * Additional data to send to the backend
   */
  backendSyncData?: Record<string, unknown>;
  /**
   * Whether to wait for backend response before completing
   */
  waitForBackendSync?: boolean;
}

export const InlineImage: React.FC<InlineImageProps> = ({
  value,
  collection,
  itemId,
  field,
  canEdit = false,
  children,
  className = '',
  onSave,
  onCancel,
  forceEditable = false,
  backendSyncEndpoint,
  backendSyncData,
  waitForBackendSync = false
}) => {
  // Check if we're in Directus editor context or authenticated
  const { isInDirectusEditor, isAuthenticated, isLoading: isLoadingContext } = useDirectusEditorContext();
  
  // Determine if editing should be allowed
  // Allow editing if:
  // 1. It's forced editable (for testing)
  // 2. User has edit permission AND either:
  //    a. We're in Directus Visual Editor, OR
  //    b. User is authenticated with Directus
  const isEditable = forceEditable || (canEdit && (isInDirectusEditor || isAuthenticated));
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSyncingWithBackend, setIsSyncingWithBackend] = useState(false);
  const [backendSyncStatus, setBackendSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    if (isEditable) {
      setIsEditing(true);
      setEditedValue(value);
      setError(null);
      setPreviewUrl(value ? DirectusService.getImageUrl(value) : null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Store the file for later upload
    setEditedValue('pending-upload');
  };

  const handleSave = async () => {
    if (!isEditable || !itemId) return;

    setIsSaving(true);
    setError(null);

    try {
      // Check if we need to upload a file
      if (editedValue === 'pending-upload' && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        
        // Prepare backend sync options if needed
        const syncOptions: BackendSyncOptions | undefined = backendSyncEndpoint ? {
          syncWithBackend: true,
          backendEndpoint: backendSyncEndpoint,
          additionalData: {
            collection,
            itemId,
            field,
            ...backendSyncData
          },
          waitForBackendResponse: waitForBackendSync
        } : undefined;
        
        try {
          // Upload the file to Directus with backend sync
          setIsSyncingWithBackend(!!backendSyncEndpoint);
          if (backendSyncEndpoint) setBackendSyncStatus('syncing');
          
          const uploadedFile = await UploadService.uploadFile(file, undefined, syncOptions);
          
          // Update the value with the file ID
          setEditedValue(uploadedFile.id);
          
          // Update the item in Directus
          await DirectusService.updateCollectionItem(collection, itemId, { [field]: uploadedFile.id });
          
          // Handle backend sync status
          if (backendSyncEndpoint) {
            if (uploadedFile.backendResponse) {
              setBackendSyncStatus('success');
              console.log('Backend sync successful:', uploadedFile.backendResponse);
            } else {
              // If we didn't wait for response but sync was requested, assume it's in progress
              setBackendSyncStatus(!waitForBackendSync ? 'syncing' : 'error');
            }
          }
          
          // Call onSave callback if provided
          if (onSave) {
            onSave(uploadedFile.id);
          }
        } catch (uploadError) {
          console.error('Upload with backend sync failed:', uploadError);
          if (backendSyncEndpoint) setBackendSyncStatus('error');
          throw uploadError;
        } finally {
          setIsSyncingWithBackend(false);
        }
      } else if (editedValue !== value) {
        // Update the item in Directus with the current value
        await DirectusService.updateCollectionItem(collection, itemId, { [field]: editedValue });
        
        // Sync with backend if endpoint is provided
        if (backendSyncEndpoint) {
          try {
            setIsSyncingWithBackend(true);
            setBackendSyncStatus('syncing');
            
            // Call backend endpoint directly
            const response = await fetch(backendSyncEndpoint, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fileId: editedValue,
                collection,
                itemId,
                field,
                ...backendSyncData
              })
            });
            
            if (response.ok) {
              setBackendSyncStatus('success');
              console.log('Backend sync successful for existing file');
            } else {
              setBackendSyncStatus('error');
              console.error('Backend sync failed for existing file:', await response.text());
            }
          } catch (syncError) {
            console.error('Backend sync failed:', syncError);
            setBackendSyncStatus('error');
          } finally {
            setIsSyncingWithBackend(false);
          }
        }
        
        // Call onSave callback if provided
        if (onSave) {
          onSave(editedValue);
        }
      }
      
      setIsEditing(false);
      
      // Clean up any object URLs to prevent memory leaks
      if (previewUrl && !previewUrl.includes('assets/')) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    
    // Clean up any object URLs to prevent memory leaks
    if (previewUrl && !previewUrl.includes('assets/')) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setEditedValue('');
  };

  // Determine container class based on state
  const containerClass = `${className} ${
    isEditing ? 'remirror-image-container editing' : 'remirror-image-container'
  } ${
    isSaving ? 'saving' : ''
  }`;

  // Show a message if not editable but user has edit permission
  if (!isLoadingContext && !isEditable && canEdit) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        {value && (
          <img 
            src={DirectusService.getImageUrl(value)} 
            alt="Content" 
            className="max-w-full h-auto rounded-md mb-2" 
          />
        )}
        <p className="text-sm mt-2">
          {isAuthenticated ? 
            "You don't have permission to edit this content." : 
            "Please authenticate with Directus to edit this content."}
        </p>
      </div>
    );
  }

  // If not editing, render the image or children
  if (!isEditing) {
    return (
      <div 
        className={`${containerClass} ${isEditable ? 'cursor-pointer hover:bg-gray-50 rounded p-2 transition-all duration-200' : ''}`}
        onClick={handleStartEditing}
      >
        {/* Authentication status indicator */}
        {isEditable && (
          <div className={`auth-status-indicator ${isInDirectusEditor ? 'auth-status-directus' : isAuthenticated ? 'auth-status-authenticated' : 'auth-status-editable'}`}>
            {isInDirectusEditor ? 'Directus Editor' : isAuthenticated ? 'Authenticated' : 'Editable'}
          </div>
        )}
        
        {children || (
          value ? (
            <img 
              src={DirectusService.getImageUrl(value)} 
              alt="Content" 
              className="max-w-full h-auto rounded-md" 
            />
          ) : (
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md text-gray-400">
              <Image size={32} />
              <span className="ml-2">No image</span>
            </div>
          )
        )}
        
        {isEditable && (
          <div className="mt-2 text-sm text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to edit
          </div>
        )}
      </div>
    );
  }

  // If editing, render the image editor
  return (
    <div className={containerClass}>
      <div className="p-4 border border-gray-200 rounded-md">
        {/* Image preview */}
        {previewUrl ? (
          <div className="relative mb-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-full h-auto rounded-md" 
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-md text-gray-400 cursor-pointer hover:bg-gray-200 transition-colors mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} />
            <span className="mt-2">Click to upload image</span>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSaving || isSyncingWithBackend}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center"
            disabled={isSaving || isSyncingWithBackend}
          >
            {isSaving ? (
              <>
                <span className="mr-2">Saving...</span>
              </>
            ) : isSyncingWithBackend ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
        
        {/* Backend sync status indicator */}
        {backendSyncStatus === 'success' && (
          <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md">
            Successfully synced with backend
          </div>
        )}
        {backendSyncStatus === 'error' && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded-md">
            Failed to sync with backend
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-2 text-red-500 text-sm bg-red-50 rounded-b-md mt-1">{error}</div>
      )}
    </div>
  );
};

export default InlineImage;
