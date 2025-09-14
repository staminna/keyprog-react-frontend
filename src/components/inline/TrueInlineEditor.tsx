import React, { useState, useRef, useEffect } from 'react';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        className="outline-none cursor-text"
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      >
        {value}
      </div>
    </div>
  );
};