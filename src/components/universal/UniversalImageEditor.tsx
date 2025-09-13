import React, { useState, useRef, useEffect } from 'react';
import { useInlineEditor } from '@/components/universal/InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRolePermissions from '@/hooks/useRolePermissions';
import { UploadService } from '@/services/uploadService';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { Edit3, Loader2 } from 'lucide-react';

interface UniversalImageEditorProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  collection: string;
  itemId: string | number;
  field: string;
  src?: string;
}

export const UniversalImageEditor: React.FC<UniversalImageEditorProps> = ({
  collection,
  itemId,
  field,
  src,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const { canEditContent } = useRolePermissions();

  const canEverEdit = (isInDirectusEditor || isAuthenticated) && canEditContent(collection, field);
  const canEdit = canEverEdit && isInlineEditingEnabled;

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleEditClick = () => {
    if (canEdit) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedFile = await UploadService.uploadFile(file);
      await DirectusServiceExtension.updateField(collection, itemId, field, uploadedFile.id);
      const newSrc = UploadService.getFileUrl(uploadedFile.id);
      setCurrentSrc(newSrc);
    } catch (error) {
      console.error('Failed to upload and update image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group" onClick={handleEditClick}>
      <img src={currentSrc} {...rest} />
      
      {canEdit && (
        <>
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            {!isUploading && (
              <Edit3 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </> 
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Loader2 size={32} className="text-white animate-spin" />
        </div>
      )}
    </div>
  );
};

export default UniversalImageEditor;
