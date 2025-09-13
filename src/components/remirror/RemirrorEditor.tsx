import React, { useCallback, useState, useEffect } from 'react';
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
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

// Import custom styles
import './styles.css';

// Import icons
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Type, Highlighter, 
  RotateCcw, RotateCw, AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';

// Define toolbar component with enhanced styling
const EditorToolbar: React.FC = () => {
  const { commands, active } = useRemirrorContext();

  // Text formatting commands
  const toggleBold = useCallback(() => commands.toggleBold(), [commands]);
  const toggleItalic = useCallback(() => commands.toggleItalic(), [commands]);
  const toggleH1 = useCallback(() => commands.toggleHeading({ level: 1 }), [commands]);
  const toggleH2 = useCallback(() => commands.toggleHeading({ level: 2 }), [commands]);
  
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

  // Image command
  const insertImage = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url) {
      commands.insertImage({ src: url, alt: 'Image' });
    }
  }, [commands]);

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

export interface RemirrorEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  className?: string;
  forceEditable?: boolean; // Override to allow editing outside of Directus editor (for testing)
}

export const RemirrorEditor: React.FC<RemirrorEditorProps> = ({
  initialContent = '',
  placeholder = 'Start typing...',
  onChange,
  readOnly = false,
  className = '',
  forceEditable = false, // Override for testing purposes
}) => {
  // Check if we're in Directus editor context
  const { isInDirectusEditor, isLoading: isLoadingContext } = useDirectusEditorContext();
  
  // Track editor state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine if editing should be allowed
  const canEdit = forceEditable || isInDirectusEditor;

  // Create the required extensions
  const extensions = useCallback(
    () => [
      new BoldExtension({}),
      new ItalicExtension({}),
      new HeadingExtension({}),
      new LinkExtension({ autoLink: true }),
      new BulletListExtension({}),
      new OrderedListExtension({}),
      new ImageExtension({ enableResizing: true }),
      new TextColorExtension({}),
      new TextHighlightExtension({}),
      new HistoryExtension({}),
    ],
    []
  );

  // Set up the editor
  const { manager, state, setState } = useRemirror({
    extensions,
    content: initialContent,
    stringHandler: 'html',
    selection: 'end',
  });

  // Handle content change
  const handleChange = useCallback(
    ({ state }) => {
      if (onChange) {
        // Get HTML content from the editor state
        const html = manager.createState({
          content: state,
          stringHandler: 'html',
        }).doc.toString();
        
        onChange(html);
        setIsEditing(true);
      }
    },
    [manager, onChange]
  );

  // Handle save action
  const handleSave = useCallback(() => {
    setIsSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 800);
  }, []);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // Reset to initial content
    setState(manager.createState({
      content: initialContent,
      stringHandler: 'html',
    }));
  }, [initialContent, manager, setState]);

  // Determine container class based on state
  const containerClass = `remirror-editor-container ${
    isEditing ? 'editing' : ''
  } ${
    isSaving ? 'saving' : ''
  } ${className}`;

  // Show a message if not in Directus editor and not forced editable
  if (!isLoadingContext && !canEdit && !readOnly) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        <p>Editing is only available within the Directus Visual Editor.</p>
        <p className="text-sm mt-2">This component is in read-only mode outside of the Directus environment.</p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={state}
          onChange={handleChange}
          autoFocus={!readOnly && canEdit}
          editable={!readOnly && canEdit}
          placeholder={placeholder}
        >
          {!readOnly && canEdit && <EditorToolbar />}
          <div className="remirror-editor-content">
            <EditorComponent />
          </div>
          {!readOnly && canEdit && isEditing && (
            <div className="remirror-action-buttons">
              <button 
                className="remirror-action-button remirror-cancel-button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="remirror-action-button remirror-save-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="remirror-saving-indicator">Saving...</span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )}
        </Remirror>
      </ThemeProvider>
    </div>
  );
};

export default RemirrorEditor;
