import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { Edit3, Check, X, Loader2 } from 'lucide-react';

export interface InlineTextProps {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  editClassName?: string;
  displayClassName?: string;
  showEditIcon?: boolean;
  autoFocus?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (value: string) => void;
}

export const InlineText: React.FC<InlineTextProps> = ({
  collection,
  itemId,
  field,
  value: initialValue,
  placeholder = 'Click to edit...',
  multiline = false,
  className = '',
  editClassName = '',
  displayClassName = '',
  showEditIcon = true,
  autoFocus = true,
  onError,
  onSuccess
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

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
    debounceMs: 800,
    optimistic: true,
    onError,
    onSuccess
  });

  // Use provided value or hook value
  const displayValue = initialValue !== undefined ? initialValue : value;

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, autoFocus]);

  const handleClick = () => {
    if (!isEditing) {
      startEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      stopEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      revert();
      stopEditing();
    } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      stopEditing();
    }
  };

  const handleBlur = () => {
    stopEditing();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateValue(e.target.value);
  };

  const baseClassName = cn(
    'inline-block min-w-[2rem] transition-all duration-200',
    className
  );

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className={cn(baseClassName, 'relative')}>
        <InputComponent
          ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
          type={multiline ? undefined : 'text'}
          value={displayValue || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'w-full bg-white border border-blue-300 rounded px-2 py-1',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            multiline && 'resize-none min-h-[2.5rem]',
            editClassName
          )}
          rows={multiline ? 3 : undefined}
        />
        
        {/* Edit controls */}
        <div className="absolute -right-8 top-0 flex flex-col gap-1">
          {isSaving ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <>
              {hasChanges && (
                <button
                  onClick={save}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                  title="Save changes"
                >
                  <Check className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => {
                  revert();
                  stopEditing();
                }}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Cancel"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
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
        'hover:bg-blue-50 hover:border-blue-200 rounded px-2 py-1 border border-transparent',
        displayClassName
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={cn(
        'block',
        !displayValue && 'text-gray-400 italic'
      )}>
        {displayValue || placeholder}
      </span>
      
      {/* Edit indicator */}
      {showEditIcon && (isHovered || isSaving) && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2">
          {isSaving ? (
            <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
          ) : (
            <Edit3 className="h-3 w-3 text-gray-400 group-hover:text-blue-500" />
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

export default InlineText;
