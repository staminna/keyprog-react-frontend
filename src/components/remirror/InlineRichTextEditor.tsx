import React, { useState, useCallback } from 'react';
import { useRemirror } from '@remirror/react';
import { 
  BoldExtension, 
  ItalicExtension, 
  HeadingExtension, 
  LinkExtension,
  ListExtension,
  ImageExtension,
  TextColorExtension,
  TextHighlightExtension,
  HistoryExtension
} from 'remirror/extensions';
import { Remirror, EditorComponent, ThemeProvider, useRemirrorContext } from '@remirror/react';
import { DirectusService } from '@/services/directusService';

// Define toolbar component
const EditorToolbar: React.FC = () => {
  const { commands } = useRemirrorContext();

  const toggleBold = useCallback(() => commands.toggleBold(), [commands]);
  const toggleItalic = useCallback(() => commands.toggleItalic(), [commands]);
  const toggleH1 = useCallback(() => commands.toggleHeading({ level: 1 }), [commands]);
  const toggleH2 = useCallback(() => commands.toggleHeading({ level: 2 }), [commands]);
  const toggleH3 = useCallback(() => commands.toggleHeading({ level: 3 }), [commands]);
  const toggleBulletList = useCallback(() => commands.toggleBulletList(), [commands]);
  const toggleOrderedList = useCallback(() => commands.toggleOrderedList(), [commands]);
  
  const setLink = useCallback(() => {
    const url = window.prompt('Enter link URL');
    if (url) {
      commands.setLink({ href: url });
    }
  }, [commands]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url) {
      commands.insertImage({ src: url });
    }
  }, [commands]);

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-200">
      <button 
        onClick={toggleBold}
        className="p-1 hover:bg-gray-200 rounded"
        title="Bold"
      >
        <span className="font-bold">B</span>
      </button>
      <button 
        onClick={toggleItalic}
        className="p-1 hover:bg-gray-200 rounded"
        title="Italic"
      >
        <span className="italic">I</span>
      </button>
      <button 
        onClick={toggleH1}
        className="p-1 hover:bg-gray-200 rounded"
        title="Heading 1"
      >
        <span className="font-bold">H1</span>
      </button>
      <button 
        onClick={toggleH2}
        className="p-1 hover:bg-gray-200 rounded"
        title="Heading 2"
      >
        <span className="font-bold">H2</span>
      </button>
      <button 
        onClick={toggleH3}
        className="p-1 hover:bg-gray-200 rounded"
        title="Heading 3"
      >
        <span className="font-bold">H3</span>
      </button>
      <button 
        onClick={toggleBulletList}
        className="p-1 hover:bg-gray-200 rounded"
        title="Bullet List"
      >
        <span>• List</span>
      </button>
      <button 
        onClick={toggleOrderedList}
        className="p-1 hover:bg-gray-200 rounded"
        title="Ordered List"
      >
        <span>1. List</span>
      </button>
      <button 
        onClick={setLink}
        className="p-1 hover:bg-gray-200 rounded"
        title="Add Link"
      >
        <span className="underline">Link</span>
      </button>
      <button 
        onClick={addImage}
        className="p-1 hover:bg-gray-200 rounded"
        title="Add Image"
      >
        <span>Image</span>
      </button>
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
  onCancel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Create the required extensions for rich text editing
  const extensions = useCallback(
    () => [
      new BoldExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      new LinkExtension({ autoLink: true }),
      new ListExtension(),
      new ImageExtension({ enableResizing: true }),
      new TextColorExtension(),
      new TextHighlightExtension(),
      new HistoryExtension(),
    ],
    []
  );

  // Set up the editor
  const { manager, state } = useRemirror({
    extensions,
    content: value,
    stringHandler: 'html',
    selection: 'end',
  });

  const handleStartEditing = () => {
    if (canEdit) {
      setIsEditing(true);
      setEditedValue(value);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!canEdit || !itemId) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update the item in Directus
      await DirectusService.updateCollectionItem(collection, itemId, { [field]: editedValue });
      
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

  // If not editing, render the content or children
  if (!isEditing) {
    return (
      <div 
        className={`${className} ${canEdit ? 'cursor-pointer hover:bg-gray-50 rounded p-2' : ''}`}
        onClick={handleStartEditing}
      >
        {children || (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
        )}
        {canEdit && (
          <div className="mt-2 text-sm text-gray-400 opacity-0 group-hover:opacity-100">
            Click to edit
          </div>
        )}
      </div>
    );
  }

  // If editing, render the editor
  return (
    <div className={`${className} border border-gray-300 rounded-md`}>
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={state}
          onChange={handleChange}
          autoFocus={true}
        >
          <EditorToolbar />
          <div className="p-4">
            <EditorComponent />
          </div>
        </Remirror>
      </ThemeProvider>
      
      <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      {error && (
        <div className="p-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

export default InlineRichTextEditor;
