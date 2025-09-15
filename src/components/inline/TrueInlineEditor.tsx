import React, { useState, useRef, useEffect } from 'react';
import { Save } from 'lucide-react';

interface TrueInlineEditorProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  className?: string;
}

export const TrueInlineEditor: React.FC<TrueInlineEditorProps> = ({ value, onSave, onCancel, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialValue] = useState(value); // Store initial value to prevent updates during editing

  useEffect(() => {
    if (editorRef.current && !hasChanges) {
      // Only set content if we haven't made changes yet
      editorRef.current.innerHTML = value;
      
      // Focus and select all text for immediate editing
      editorRef.current.focus();
      
      // Place cursor at the end of the text
      setTimeout(() => {
        if (editorRef.current) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    }
  }, [value, hasChanges]);

  const handleSave = async () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerText.trim();
      
      try {
        await onSave(newContent);
        setHasChanges(false);
      } catch (error) {
        console.error('Save failed:', error);
        // Keep hasChanges true so user can retry
      }
    }
  };

  const handleCancel = () => {
    if (editorRef.current) {
      // Reset to initial value on cancel
      editorRef.current.innerHTML = initialValue;
    }
    setHasChanges(false);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Track changes
    setHasChanges(true);
    
    // Prevent empty content
    const target = e.currentTarget;
    if (target.innerText.trim() === '') {
      target.innerHTML = '&nbsp;';
    }
  };

  return (
    <>
      <style>{`
        @keyframes blink-cursor {
          0%, 50% { border-right-color: transparent; }
          51%, 100% { border-right-color: currentColor; }
        }
        .blinking-cursor {
          border-right: 2px solid currentColor;
          animation: blink-cursor 1s infinite;
        }
      `}</style>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          className={`outline-none cursor-text blinking-cursor ${className}`}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          style={{ 
            minHeight: '1em',
            caretColor: 'currentColor',
            WebkitTextFillColor: 'currentColor',
            color: 'inherit'
          }}
        />
        
        {hasChanges && (
          <div className="absolute -top-8 right-0 flex items-center space-x-1 z-10">
            <button
              onClick={handleSave}
              className="p-1 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
              title="Save changes (Enter)"
            >
              <Save size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};