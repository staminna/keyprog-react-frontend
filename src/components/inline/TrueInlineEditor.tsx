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
      console.log('📝 TrueInlineEditor: Initializing editor with value:', value?.substring(0, 50));
      
      // Only set content if we haven't made changes yet
      editorRef.current.innerHTML = value || '';
      
      // Improved focus with error handling and retry
      const attemptFocus = (attempt = 1) => {
        if (!editorRef.current) {
          console.error('❌ Editor ref lost');
          return;
        }
        
        try {
          // Force focus
          editorRef.current.focus();
          
          // Ensure it's actually focused
          if (document.activeElement !== editorRef.current) {
            console.warn('⚠️ Element not focused, forcing...');
            editorRef.current.focus();
          }
          
          // Place cursor at the end of the text
          const range = document.createRange();
          const selection = window.getSelection();
          
          if (!selection) {
            console.error('❌ No window.getSelection available');
            return;
          }
          
          if (editorRef.current.childNodes.length > 0) {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // If no content, just set cursor at start
            range.setStart(editorRef.current, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          console.log('✅ Editor focused and cursor positioned (attempt', attempt, ')');
          console.log('Active element:', document.activeElement === editorRef.current ? 'EDITOR' : document.activeElement?.tagName);
        } catch (error) {
          console.error(`❌ Focus attempt ${attempt} failed:`, error);
          
          // Retry up to 5 times with increasing delays
          if (attempt < 5) {
            setTimeout(() => attemptFocus(attempt + 1), attempt * 100);
          }
        }
      };
      
      // Initial attempt with 100ms delay to ensure DOM is ready
      setTimeout(() => attemptFocus(), 100);
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
    console.log('✏️ Input detected:', e.currentTarget.innerText.substring(0, 20));
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
          tabIndex={0}
          className={`outline-none cursor-text blinking-cursor text-gray-900 ${className}`}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onClick={() => {
            console.log('🖱️ Editor clicked, focusing...');
            editorRef.current?.focus();
          }}
          style={{ 
            minHeight: '1em',
            caretColor: '#111827',
            WebkitTextFillColor: '#111827',
            color: '#111827',
            userSelect: 'text',
            WebkitUserSelect: 'text'
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