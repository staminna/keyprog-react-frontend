import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { Upload, Edit3, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';

export interface InlineImageProps {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  className?: string;
  imageClassName?: string;
  showEditIcon?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  onError?: (error: Error) => void;
  onSuccess?: (value: string) => void;
}

export const InlineImage: React.FC<InlineImageProps> = ({
  collection,
  itemId,
  field,
  value: initialValue,
  placeholder = 'Click to upload image...',
  className = '',
  imageClassName = '',
  showEditIcon = true,
  maxWidth = 800,
  maxHeight = 600,
  onError,
  onSuccess
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    value,
    isEditing,
    isSaving,
    hasChanges,
    error,
    updateValue,
    save,
    revert,
    startEditing,
    stopEditing
  } = useInlineEdit({
    collection,
    itemId,
    field,
    debounceMs: 0, // No debounce for images
    optimistic: false, // Wait for upload completion
    onError,
    onSuccess
  });

  const displayValue = initialValue !== undefined ? initialValue : value;

  const handleClick = () => {
    if (!isEditing) {
      startEditing();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      stopEditing();
      return;
    }

    if (!file.type.startsWith('image/')) {
      onError?.(new Error('Please select an image file'));
      stopEditing();
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Directus files
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const fileId = result.data.id;

      // Update the field with the file ID
      updateValue(fileId);
      onSuccess?.(fileId);
    } catch (error) {
      console.error('Upload failed:', error);
      onError?.(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setIsUploading(false);
      stopEditing();
    }
  };

  const getImageUrl = (fileId: string) => {
    if (!fileId) return '';
    if (fileId.startsWith('http')) return fileId;
    return `${import.meta.env.VITE_DIRECTUS_URL}/assets/${fileId}?width=${maxWidth}&height=${maxHeight}&fit=cover`;
  };

  const baseClassName = cn(
    'inline-block transition-all duration-200',
    className
  );

  if (isEditing || isUploading) {
    return (
      <div className={cn(baseClassName, 'relative')}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-blue-600">Uploading image...</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-600">Select an image to upload</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute -right-8 top-0 flex flex-col gap-1">
          <button
            onClick={() => {
              revert();
              stopEditing();
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClassName,
        'cursor-pointer group relative',
        'hover:opacity-80 transition-opacity',
        !displayValue && 'border-2 border-dashed border-gray-300 hover:border-blue-300'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayValue ? (
        <img
          src={getImageUrl(displayValue)}
          alt="Editable content"
          className={cn(
            'max-w-full h-auto rounded',
            imageClassName
          )}
          style={{ maxWidth, maxHeight }}
        />
      ) : (
        <div className="flex items-center justify-center p-8 rounded bg-gray-50">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{placeholder}</p>
          </div>
        </div>
      )}
      
      {/* Edit indicator */}
      {showEditIcon && (isHovered || isSaving) && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
          {isSaving ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <Edit3 className="h-4 w-4 text-gray-600 group-hover:text-blue-500" />
          )}
        </div>
      )}

      {/* Change indicator */}
      {hasChanges && !isEditing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full" />
      )}
    </div>
  );
};

export default InlineImage;
