import React, { useState, useCallback } from 'react';
import { useRemirror } from '@remirror/react';
import { BoldExtension } from '@remirror/extension-bold';
import { ItalicExtension } from '@remirror/extension-italic';
import { HistoryExtension } from '@remirror/extension-history';
import { Remirror, EditorComponent, ThemeProvider, useRemirrorContext } from '@remirror/react';
import { DirectusService } from '@/services/directusService';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

// Import custom styles
import './styles.css';

// Import icons
import { Bold, Italic, RotateCcw, RotateCw } from 'lucide-react';

export interface InlineTextEditorProps {
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
}

// Simple toolbar component for text editor
const TextEditorToolbar: React.FC = () => {
  const { commands, active } = useRemirrorContext();

  // Text formatting commands
  const toggleBold = useCallback(() => commands.toggleBold(), [commands]);
  const toggleItalic = useCallback(() => commands.toggleItalic(), [commands]);

  // Undo/Redo commands
  const undo = useCallback(() => commands.undo(), [commands]);
  const redo = useCallback(() => commands.redo(), [commands]);

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

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  value,
  collection,
  itemId,
  field,
  canEdit = false,
  children,
  className = '',
  onSave,
  onCancel,
  forceEditable = false
}) => {
  // Check if we're in Directus editor context
  const { isInDirectusEditor, isLoading: isLoadingContext } = useDirectusEditorContext();
  
  // Determine if editing should be allowed
  const isEditable = forceEditable || (canEdit && isInDirectusEditor);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Create the required extensions for simple text editing
  const extensions = useCallback(
    () => [
      new BoldExtension({}),
      new ItalicExtension({}),
      new HistoryExtension({}),
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
      // Update the item in Directus
      await DirectusService.updateCollectionItem(collection, itemId, { [field]: editedValue });
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(editedValue);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving inline text:', err);
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
      // Get plain text content from the editor state
      const text = manager.createState({
        content: state,
        stringHandler: 'text',
      }).doc.textContent;
      
      setEditedValue(text);
    },
    [manager]
  );

  // Determine container class based on state
  const containerClass = `${className} ${
    isEditing ? 'remirror-editor-container editing' : ''
  } ${
    isSaving ? 'saving' : ''
  }`;

  // Show a message if not in Directus editor and not forced editable
  if (!isLoadingContext && !isEditable && canEdit) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        <span dangerouslySetInnerHTML={{ __html: value }} />
        <p className="text-sm mt-2">Editing is only available within the Directus Visual Editor.</p>
      </div>
    );
  }

  // If not editing, render the content or children
  if (!isEditing) {
    return (
      <div 
        className={`${className} ${isEditable ? 'cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-all duration-200' : ''}`}
        onClick={handleStartEditing}
      >
        {children || <span dangerouslySetInnerHTML={{ __html: value }} />}
        {isEditable && (
          <span className="ml-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            (Click to edit)
          </span>
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
          <TextEditorToolbar />
          <div className="remirror-editor-content">
            <EditorComponent />
          </div>
        </Remirror>
      </ThemeProvider>
      
      <div className="remirror-action-buttons">
        <button
          onClick={handleCancel}
          className="remirror-action-button remirror-cancel-button"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="remirror-action-button remirror-save-button"
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="remirror-saving-indicator">Saving...</span>
          ) : (
            'Save'
          )}
        </button>
      </div>
      
      {error && (
        <div className="p-2 text-red-500 text-sm bg-red-50 rounded-b-md">{error}</div>
      )}
    </div>
  );
};

export default InlineTextEditor;
