import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRemirror } from '@remirror/react';
import { BoldExtension } from '@remirror/extension-bold';
import { ItalicExtension } from '@remirror/extension-italic';
import { HeadingExtension } from '@remirror/extension-heading';
import { LinkExtension } from '@remirror/extension-link';
import { BulletListExtension, OrderedListExtension } from '@remirror/extension-list';
import { ImageExtension } from '@remirror/extension-image';
import { TextColorExtension } from '@remirror/extension-text-color';
import { TextHighlightExtension } from '@remirror/extension-text-highlight';
import { HistoryExtension } from '@remirror/extension-history';
import { Remirror, EditorComponent, ThemeProvider, useRemirrorContext } from '@remirror/react';
import { DirectusService } from '@/services/directusService';
import { DirectusServiceExtension } from '@/services/directusServiceExtension';
import { UploadService, BackendSyncOptions } from '@/services/uploadService';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import { parseDocParagraphSyntax, cleanContentForSaving, hasDocParagraphSyntax, formatContentForDisplay } from '@/utils/contentParserV2';

// Import custom styles
import './styles.css';

// Import icons
import { 
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Type, Highlighter, 
  RotateCcw, RotateCw, AlignLeft, AlignCenter, AlignRight,
  Upload, ExternalLink, RefreshCw
} from 'lucide-react';

// Define toolbar component with enhanced styling
interface EditorToolbarProps {
  backendSyncEndpoint?: string;
  backendSyncData?: Record<string, unknown>;
  waitForBackendSync?: boolean;
  collection?: string;
  itemId?: string;
  field?: string;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  backendSyncEndpoint,
  backendSyncData,
  waitForBackendSync,
  collection,
  itemId,
  field
}) => {
  const { commands, active } = useRemirrorContext();

  // Text formatting commands
  const toggleBold = useCallback(() => commands.toggleBold(), [commands]);
  const toggleItalic = useCallback(() => commands.toggleItalic(), [commands]);
  const toggleH1 = useCallback(() => commands.toggleHeading({ level: 1 }), [commands]);
  const toggleH2 = useCallback(() => commands.toggleHeading({ level: 2 }), [commands]);
  const toggleH3 = useCallback(() => commands.toggleHeading({ level: 3 }), [commands]);
  
  // List commands
  const toggleBulletList = useCallback(() => commands.toggleBulletList?.(), [commands]);
  const toggleOrderedList = useCallback(() => commands.toggleOrderedList?.(), [commands]);
  
  // Link command
  const setLink = useCallback(() => {
    const url = window.prompt('Enter link URL');
    if (url) {
      commands.setLink({ href: url });
    }
  }, [commands]);

  // Image command - enhanced with file upload support and backend sync
  const insertImage = useCallback(() => {
    // Create a modal dialog for image options
    const dialog = document.createElement('div');
    dialog.className = 'remirror-image-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dialog.style.zIndex = '9999';
    dialog.style.width = '400px';
    dialog.style.maxWidth = '90vw';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Insert Image';
    title.style.marginTop = '0';
    title.style.marginBottom = '16px';
    dialog.appendChild(title);
    
    // Create tabs for URL and Upload
    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.marginBottom = '16px';
    tabContainer.style.borderBottom = '1px solid #eee';
    
    const urlTab = document.createElement('button');
    urlTab.textContent = 'URL';
    urlTab.style.padding = '8px 16px';
    urlTab.style.border = 'none';
    urlTab.style.backgroundColor = 'transparent';
    urlTab.style.cursor = 'pointer';
    urlTab.style.borderBottom = '2px solid #6366f1';
    
    const uploadTab = document.createElement('button');
    uploadTab.textContent = 'Upload';
    uploadTab.style.padding = '8px 16px';
    uploadTab.style.border = 'none';
    uploadTab.style.backgroundColor = 'transparent';
    uploadTab.style.cursor = 'pointer';
    
    tabContainer.appendChild(urlTab);
    tabContainer.appendChild(uploadTab);
    dialog.appendChild(tabContainer);
    
    // URL input container
    const urlContainer = document.createElement('div');
    urlContainer.style.display = 'block';
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Enter image URL';
    urlInput.style.width = '100%';
    urlInput.style.padding = '8px';
    urlInput.style.marginBottom = '16px';
    urlInput.style.boxSizing = 'border-box';
    urlInput.style.border = '1px solid #ddd';
    urlInput.style.borderRadius = '4px';
    
    urlContainer.appendChild(urlInput);
    dialog.appendChild(urlContainer);
    
    // Upload input container
    const uploadContainer = document.createElement('div');
    uploadContainer.style.display = 'none';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.marginBottom = '16px';
    
    const uploadStatus = document.createElement('div');
    uploadStatus.style.marginBottom = '16px';
    uploadStatus.style.fontSize = '14px';
    
    uploadContainer.appendChild(fileInput);
    uploadContainer.appendChild(uploadStatus);
    dialog.appendChild(uploadContainer);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '8px';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.border = '1px solid #ddd';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.backgroundColor = 'white';
    cancelButton.style.cursor = 'pointer';
    
    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert';
    insertButton.style.padding = '8px 16px';
    insertButton.style.border = 'none';
    insertButton.style.borderRadius = '4px';
    insertButton.style.backgroundColor = '#6366f1';
    insertButton.style.color = 'white';
    insertButton.style.cursor = 'pointer';
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(insertButton);
    dialog.appendChild(buttonContainer);
    
    // Add event listeners for tabs
    urlTab.addEventListener('click', () => {
      urlTab.style.borderBottom = '2px solid #6366f1';
      uploadTab.style.borderBottom = 'none';
      urlContainer.style.display = 'block';
      uploadContainer.style.display = 'none';
    });
    
    uploadTab.addEventListener('click', () => {
      uploadTab.style.borderBottom = '2px solid #6366f1';
      urlTab.style.borderBottom = 'none';
      urlContainer.style.display = 'none';
      uploadContainer.style.display = 'block';
    });
    
    // Cancel button closes the dialog
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    // Insert button handles insertion based on active tab
    insertButton.addEventListener('click', async () => {
      if (urlContainer.style.display === 'block') {
        // URL mode
        const url = urlInput.value.trim();
        if (url) {
          commands.insertImage({ src: url, alt: 'Image' });
          document.body.removeChild(dialog);
        }
      } else {
        // Upload mode
        const file = fileInput.files?.[0];
        if (file) {
          try {
            insertButton.disabled = true;
            insertButton.textContent = 'Uploading...';
            uploadStatus.textContent = 'Uploading image...';
            uploadStatus.style.color = '#6366f1';
            
            // Prepare backend sync options if needed
            const syncOptions: BackendSyncOptions | undefined = backendSyncEndpoint ? {
              syncWithBackend: true,
              backendEndpoint: backendSyncEndpoint,
              additionalData: {
                collection,
                itemId,
                field,
                type: 'image',
                ...backendSyncData
              },
              waitForBackendResponse: waitForBackendSync
            } : undefined;
            
            // Upload the file using our service with backend sync
            const uploadedFile = await UploadService.uploadFile(file, undefined, syncOptions);
            const imageUrl = UploadService.getFileUrl(uploadedFile.id);
            
            // Insert the image with the uploaded URL
            commands.insertImage({ 
              src: imageUrl, 
              alt: file.name,
              title: file.name,
              width: uploadedFile.width,
              height: uploadedFile.height
            });
            
            // Log backend sync status if applicable
            if (backendSyncEndpoint && uploadedFile.backendResponse) {
              console.log('Backend sync successful for image:', uploadedFile.backendResponse);
            }
            
            document.body.removeChild(dialog);
          } catch (error) {
            console.error('Image upload failed:', error);
            uploadStatus.textContent = 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error');
            uploadStatus.style.color = 'red';
            insertButton.disabled = false;
            insertButton.textContent = 'Insert';
          }
        }
      }
    });
    
    // Add the dialog to the body
    document.body.appendChild(dialog);
    
    // Focus the URL input
    urlInput.focus();
  }, [commands, backendSyncEndpoint, backendSyncData, waitForBackendSync, collection, itemId, field]);

  // Undo/Redo commands
  const undo = useCallback(() => commands.undo(), [commands]);
  const redo = useCallback(() => commands.redo(), [commands]);

  // Alignment commands
  const alignLeft = useCallback(() => commands.leftAlign?.(), [commands]);
  const alignCenter = useCallback(() => commands.centerAlign?.(), [commands]);
  const alignRight = useCallback(() => commands.rightAlign?.(), [commands]);

  return (
    <div className="remirror-toolbar">
      {/* Text formatting group */}
      <div className="remirror-toolbar-group">
        <button 
          onClick={toggleBold}
          className={`remirror-toolbar-button ${active.bold() ? 'active' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          onClick={toggleItalic}
          className={`remirror-toolbar-button ${active.italic() ? 'active' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
      </div>

      {/* Heading group */}
      <div className="remirror-toolbar-group">
        <button 
          onClick={toggleH1}
          className={`remirror-toolbar-button ${active.heading({ level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button 
          onClick={toggleH2}
          className={`remirror-toolbar-button ${active.heading({ level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button 
          onClick={toggleH3}
          className={`remirror-toolbar-button ${active.heading({ level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      {/* List group */}
      <div className="remirror-toolbar-group">
        <button 
          onClick={toggleBulletList}
          className={`remirror-toolbar-button ${active.bulletList?.() ? 'active' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button 
          onClick={toggleOrderedList}
          className={`remirror-toolbar-button ${active.orderedList?.() ? 'active' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* Insert group */}
      <div className="remirror-toolbar-group">
        <button 
          onClick={setLink}
          className={`remirror-toolbar-button ${active.link() ? 'active' : ''}`}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        <button 
          onClick={insertImage}
          className="remirror-toolbar-button"
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* Alignment group */}
      <div className="remirror-toolbar-group">
        <button 
          onClick={alignLeft}
          className="remirror-toolbar-button"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button 
          onClick={alignCenter}
          className="remirror-toolbar-button"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button 
          onClick={alignRight}
          className="remirror-toolbar-button"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* History group */}
      <div className="remirror-toolbar-group">
        <button 
          onClick={undo}
          className="remirror-toolbar-button"
          title="Undo"
        >
          <RotateCcw size={16} />
        </button>
        <button 
          onClick={redo}
          className="remirror-toolbar-button"
          title="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>
    </div>
  );
};

export interface InlineRichTextEditorProps {
  value: string;
  collection: string;
  itemId: string;
  field: string;
  canEdit?: boolean;
  children?: React.ReactNode;
  className?: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  forceEditable?: boolean; // Override to allow editing outside of Directus editor (for testing)
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

export const InlineRichTextEditor: React.FC<InlineRichTextEditorProps> = ({
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
  // Parse doc(paragraph(...)) syntax if present
  const [parsedValue, setParsedValue] = useState(value);
  
  // Parse value on mount and when it changes
  useEffect(() => {
    // Always format the content for display, regardless of syntax
    setParsedValue(formatContentForDisplay(value));
  }, [value]);
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
  const [isSyncingWithBackend, setIsSyncingWithBackend] = useState(false);
  const [backendSyncStatus, setBackendSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Create the required extensions for rich text editing
  const extensions = useCallback(
    () => [
      new BoldExtension({}),
      new ItalicExtension({}),
      new HeadingExtension({}),
      new LinkExtension({ autoLink: true }),
      new BulletListExtension({}),
      new OrderedListExtension({}),
      new ImageExtension({ 
        enableResizing: true,
        // Allow images to be dragged and resized
      }),
      new TextColorExtension({}),
      new TextHighlightExtension({}),
      new HistoryExtension({}),
    ],
    []
  );

  // Set up the editor
  const { manager, state } = useRemirror({
    extensions,
    content: parsedValue,
    stringHandler: 'html',
    selection: 'end',
  });

  const handleStartEditing = () => {
    if (isEditable) {
      setIsEditing(true);
      setEditedValue(value);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!isEditable || !itemId) return;

    setIsSaving(true);
    setError(null);
    
    try {
      // Always clean content before saving to ensure no doc(paragraph(...)) syntax
      const cleanedValue = cleanContentForSaving(editedValue);
      
      // Update the item in Directus using the extension for proper permission handling
      await DirectusServiceExtension.updateField(collection, itemId, field, cleanedValue);
      
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
              content: editedValue,
              collection,
              itemId,
              field,
              type: 'richtext',
              ...backendSyncData
            })
          });
          
          if (response.ok) {
            setBackendSyncStatus('success');
            console.log('Backend sync successful for rich text');
          } else {
            setBackendSyncStatus('error');
            console.error('Backend sync failed for rich text:', await response.text());
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
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving rich text:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleChange = useCallback(
    ({ state }) => {
      // Get HTML content from the editor state
      const html = manager.createState({
        content: state,
        stringHandler: 'html',
      }).doc.toString();
      
      setEditedValue(html);
    },
    [manager]
  );

  // Determine container class based on state
  const containerClass = `${className} ${
    isEditing ? 'remirror-editor-container editing' : ''
  } ${
    isSaving ? 'saving' : ''
  }`;

  // Show a message if not editable but user has edit permission
  if (!isLoadingContext && !isEditable && canEdit) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
        <p className="text-sm mt-2">
          {isAuthenticated ? 
            "You don't have permission to edit this content." : 
            "Please authenticate with Directus to edit this content."}
        </p>
      </div>
    );
  }

  // If not editing, render the content or children
  if (!isEditing) {
    return (
      <div 
        className={`${className} ${isEditable ? 'cursor-pointer hover:bg-gray-50 rounded p-2 transition-all duration-200' : ''}`}
        onClick={handleStartEditing}
      >
        {/* Authentication status indicator */}
        {isEditable && (
          <div className={`auth-status-indicator ${isInDirectusEditor ? 'auth-status-directus' : isAuthenticated ? 'auth-status-authenticated' : 'auth-status-editable'}`}>
            {isInDirectusEditor ? 'Directus Editor' : isAuthenticated ? 'Authenticated' : 'Editable'}
          </div>
        )}
        
        {children || (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parsedValue }} />
        )}
        
        {isEditable && (
          <div className="mt-2 text-sm text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to edit
          </div>
        )}
      </div>
    );
  }

  // If editing, render the editor
  return (
    <div className={containerClass}>
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={state}
          onChange={handleChange}
          autoFocus={true}
        >
          <EditorToolbar 
            backendSyncEndpoint={backendSyncEndpoint}
            backendSyncData={backendSyncData}
            waitForBackendSync={waitForBackendSync}
            collection={collection}
            itemId={itemId}
            field={field}
          />
          <div className="remirror-editor-content">
            <EditorComponent />
          </div>
        </Remirror>
      </ThemeProvider>
      
      <div className="remirror-action-buttons">
        <button
          onClick={handleCancel}
          className="remirror-action-button remirror-cancel-button"
          disabled={isSaving || isSyncingWithBackend}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="remirror-action-button remirror-save-button"
          disabled={isSaving || isSyncingWithBackend}
        >
          {isSaving ? (
            <span className="remirror-saving-indicator">Saving...</span>
          ) : isSyncingWithBackend ? (
            <span className="remirror-syncing-indicator">
              <RefreshCw size={16} className="inline-block mr-1 animate-spin" /> Syncing...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </div>
      
      {/* Backend sync status indicator */}
      {backendSyncStatus === 'success' && (
        <div className="p-2 text-green-600 text-sm bg-green-50 rounded-md mt-2">
          Successfully synced with backend
        </div>
      )}
      {backendSyncStatus === 'error' && (
        <div className="p-2 text-red-600 text-sm bg-red-50 rounded-md mt-2">
          Failed to sync with backend
        </div>
      )}
      
      {error && (
        <div className="p-2 text-red-500 text-sm bg-red-50 rounded-b-md">{error}</div>
      )}
    </div>
  );
};

export default InlineRichTextEditor;
