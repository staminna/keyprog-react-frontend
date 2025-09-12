import React, { useState, useCallback } from 'react';
import { useRemirror } from '@remirror/react';
import { BoldExtension, ItalicExtension, HistoryExtension } from 'remirror/extensions';
import { Remirror, EditorComponent, ThemeProvider } from '@remirror/react';
import { DirectusService } from '@/services/directusService';

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
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
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

  // Create the required extensions for simple text editing
  const extensions = useCallback(
    () => [
      new BoldExtension(),
      new ItalicExtension(),
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

  // If not editing, render the content or children
  if (!isEditing) {
    return (
      <div 
        className={`${className} ${canEdit ? 'cursor-pointer hover:bg-gray-50 rounded px-1' : ''}`}
        onClick={handleStartEditing}
      >
        {children || <span dangerouslySetInnerHTML={{ __html: value }} />}
        {canEdit && (
          <span className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100">
            (Click to edit)
          </span>
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
          <EditorComponent />
        </Remirror>
      </ThemeProvider>
      
      <div className="flex justify-end gap-2 mt-2">
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
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default InlineTextEditor;
