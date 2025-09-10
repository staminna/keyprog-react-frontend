import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { Edit3, Check, X, Loader2, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface InlineSelectProps {
  collection: string;
  itemId: string | number;
  field: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  editClassName?: string;
  displayClassName?: string;
  showEditIcon?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (value: string) => void;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({
  collection,
  itemId,
  field,
  value: initialValue,
  options,
  placeholder = 'Select an option...',
  className = '',
  editClassName = '',
  displayClassName = '',
  showEditIcon = true,
  onError,
  onSuccess
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

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
    debounceMs: 0, // Immediate save for select
    optimistic: true,
    onError,
    onSuccess
  });

  const displayValue = initialValue !== undefined ? initialValue : value;
  const selectedOption = options.find(opt => opt.value === displayValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isEditing) {
          stopEditing();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, stopEditing]);

  const handleClick = () => {
    if (!isEditing) {
      startEditing();
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    updateValue(optionValue);
    setIsOpen(false);
    stopEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      revert();
      setIsOpen(false);
      stopEditing();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const baseClassName = cn(
    'inline-block min-w-[8rem] transition-all duration-200',
    className
  );

  if (isEditing) {
    return (
      <div className={cn(baseClassName, 'relative')} ref={selectRef}>
        <div
          className={cn(
            'w-full bg-white border border-blue-300 rounded px-3 py-2 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'flex items-center justify-between',
            editClassName
          )}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <span className={cn(!selectedOption && 'text-gray-400')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'px-3 py-2 cursor-pointer hover:bg-blue-50',
                  option.value === displayValue && 'bg-blue-100 text-blue-700'
                )}
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}

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
                  setIsOpen(false);
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
      <span className={cn(
        'block',
        !selectedOption && 'text-gray-400 italic'
      )}>
        {selectedOption?.label || placeholder}
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

export default InlineSelect;
