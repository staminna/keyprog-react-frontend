import React, { useCallback } from 'react';
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

// Define toolbar component
const EditorToolbar: React.FC = () => {
  const { commands } = useRemirrorContext();

  const toggleBold = useCallback(() => commands.toggleBold(), [commands]);
  const toggleItalic = useCallback(() => commands.toggleItalic(), [commands]);
  const toggleH1 = useCallback(() => commands.toggleHeading({ level: 1 }), [commands]);
  const toggleH2 = useCallback(() => commands.toggleHeading({ level: 2 }), [commands]);
  const toggleBulletList = useCallback(() => commands.toggleBulletList(), [commands]);
  const toggleOrderedList = useCallback(() => commands.toggleOrderedList(), [commands]);
  
  const setLink = useCallback(() => {
    const url = window.prompt('Enter link URL');
    if (url) {
      commands.setLink({ href: url });
    }
  }, [commands]);

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-200 rounded-t-md">
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
    </div>
  );
};

export interface RemirrorEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const RemirrorEditor: React.FC<RemirrorEditorProps> = ({
  initialContent = '',
  placeholder = 'Start typing...',
  onChange,
  readOnly = false,
  className = '',
}) => {
  // Create the required extensions
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
      }
    },
    [manager, onChange]
  );

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={state}
          onChange={handleChange}
          autoFocus={!readOnly}
          editable={!readOnly}
          placeholder={placeholder}
        >
          {!readOnly && <EditorToolbar />}
          <EditorComponent />
        </Remirror>
      </ThemeProvider>
    </div>
  );
};

export default RemirrorEditor;
