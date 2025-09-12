import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { Edit3, Check, X, Loader2, Bold, Italic, Link } from 'lucide-react';

export interface InlineRichTextProps {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  displayClassName?: string;
  showEditIcon?: boolean;
  autoFocus?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (value: string) => void;
}

export const InlineRichText: React.FC<InlineRichTextProps> = ({
  collection,
  itemId,
  field,
  value: initialValue,
  placeholder = 'Click to edit...',
  className = '',
  editClassName = '',
  displayClassName = '',
  showEditIcon = true,
  autoFocus = true,
  onError,
  onSuccess
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    value,
    isEditing,
    isSaving,
    hasChanges,
    error,
    updateValue,
    save,
    revert,
    startEditing,
    stopEditing
  } = useInlineEdit({
    collection,
    itemId,
    field,
    debounceMs: 1000,
    optimistic: true,
    onError,
    onSuccess
  });

  const displayValue = initialValue !== undefined ? initialValue : value;

  useEffect(() => {
    if (isEditing && autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditing, autoFocus]);

  const handleClick = () => {
    if (!isEditing) {
      startEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      revert();
      stopEditing();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      stopEditing();
    }
  };

  const handleBlur = () => {
    // Delay to allow toolbar clicks
    setTimeout(() => {
      if (!editorRef.current?.contains(document.activeElement)) {
        stopEditing();
      }
    }, 100);
  };

  const handleInput = () => {
    if (editorRef.current) {
      updateValue(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const baseClassName = cn(
    'inline-block min-w-[2rem] transition-all duration-200',
    className
  );

  if (isEditing) {
    return (
      <div className={cn(baseClassName, 'relative')}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 mb-2 p-2 bg-gray-50 border rounded-t">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url);
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Link"
          >
            <Link className="h-4 w-4" />
          </button>
          
          <div className="flex-1" />
          
          {isSaving ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <>
              {hasChanges && (
                <button
                  type="button"
                  onClick={save}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                  title="Save changes"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  revert();
                  stopEditing();
                }}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <div
          ref={editorRef}
          contentEditable
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: displayValue || '' }}
          className={cn(
            'w-full min-h-[4rem] p-3 bg-white border border-blue-300 rounded-b',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'prose prose-sm max-w-none',
            editClassName
          )}
          style={{ minHeight: '4rem' }}
        />

        {/* Error display */}
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClassName,
        'cursor-pointer group relative',
        'hover:bg-blue-50 hover:border-blue-200 rounded px-3 py-2 border border-transparent',
        displayClassName
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          'prose prose-sm max-w-none',
          !displayValue && 'text-gray-400 italic'
        )}
        dangerouslySetInnerHTML={{ 
          __html: displayValue || `<p>${placeholder}</p>` 
        }}
      />
      
      {/* Edit indicator */}
      {showEditIcon && (isHovered || isSaving) && (
        <div className="absolute -right-6 top-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          )}
        </div>
      )}

      {/* Change indicator */}
      {hasChanges && !isEditing && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full" />
      )}
    </div>
  );
};

export default InlineRichText;
