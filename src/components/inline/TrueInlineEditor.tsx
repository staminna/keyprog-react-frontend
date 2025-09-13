import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface TrueInlineEditorProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

export const TrueInlineEditor: React.FC<TrueInlineEditorProps> = ({ value, onSave, onCancel }) => {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.innerText);
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        className="outline-none border-2 border-blue-500 rounded-md p-2 bg-white"
        onBlur={(e) => setContent(e.currentTarget.innerText)}
      >
        {value}
      </div>
      <div className="absolute top-0 right-0 -mt-8 flex space-x-1">
        <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded-full shadow-lg">
          <Check size={16} />
        </button>
        <button onClick={onCancel} className="p-1 bg-red-500 text-white rounded-full shadow-lg">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};