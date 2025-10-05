import React, { useState, useRef, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

interface TrueInlineEditorProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  className?: string;
}

export const TrueInlineEditor: React.FC<TrueInlineEditorProps> = ({ value, onSave, onCancel, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialValue] = useState(value);

  useEffect(() => {
    if (editorRef.current && !hasChanges) {
      console.log('📝 TrueInlineEditor: Initializing editor with value:', value?.substring(0, 50));
      
      editorRef.current.innerHTML = value || '';
      
      const attemptFocus = (attempt = 1) => {
        if (!editorRef.current) return;
        
        try {
          editorRef.current.focus();
          
          const range = document.createRange();
          const selection = window.getSelection();
          
          if (!selection) return;
          
          if (editorRef.current.childNodes.length > 0) {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            range.setStart(editorRef.current, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          console.log('✅ Editor focused and cursor positioned (attempt', attempt, ')');
        } catch (error) {
          console.error(`❌ Focus attempt ${attempt} failed:`, error);
          if (attempt < 5) {
            setTimeout(() => attemptFocus(attempt + 1), attempt * 100);
          }
        }
      };
      
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
      }
    }
  };

  const handleCancel = () => {
    if (editorRef.current) {
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
    setHasChanges(true);
    
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
        .inline-editor-active {
          border-right: 2px solid currentColor !important;
          animation: blink-cursor 1s infinite;
          background: transparent !important;
          outline: 2px solid rgba(59, 130, 246, 0.5) !important;
          outline-offset: 2px;
        }
      `}</style>
      <div className="relative inline-block w-full">
        <div
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          tabIndex={0}
          className={`outline-none cursor-text inline-editor-active ${className}`}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onClick={() => {
            console.log('🖱️ Editor clicked, focusing...');
            editorRef.current?.focus();
          }}
          style={{ 
            minHeight: '1em',
            width: '100%',
            display: 'inline-block',
            background: 'transparent',
            caretColor: 'currentColor',
            color: 'inherit',
            userSelect: 'text',
            WebkitUserSelect: 'text',
            padding: '4px',
            margin: '-4px' // Compensate for padding to maintain original layout
          }}
        />
        
        {/* The save/cancel buttons were here. They are removed as per user request. */}
      </div>
    </>
  );
};