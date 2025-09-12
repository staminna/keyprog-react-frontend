import React from 'react';

// Import from the new Remirror implementation
import {
  InlineTextEditor as RemirrorInlineTextEditor,
  InlineRichTextEditor as RemirrorInlineRichTextEditor,
  RemirrorEditorProvider,
  RemirrorEditorToolbar,
  useRemirrorEditorContext
} from '../remirror';

// Re-export with the old names for backward compatibility
export const InlineText = RemirrorInlineTextEditor;
export const InlineRichText = RemirrorInlineRichTextEditor;
export const InlineEditProvider = RemirrorEditorProvider;
export const InlineEditToolbar = RemirrorEditorToolbar;

// Stub for InlineImage until we implement it in Remirror
export const InlineImage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

// Stub for InlineSelect until we implement it in Remirror
export const InlineSelect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

// Compatibility hook for useInlineEdit
export const useInlineEdit = () => {
  const context = useRemirrorEditorContext();
  
  return {
    value: '',
    originalValue: '',
    isEditing: false,
    isSaving: false,
    hasChanges: false,
    error: null,
    updateValue: () => {},
    save: () => {},
    revert: () => {},
    startEditing: () => {},
    stopEditing: () => {}
  };
};

// Export types for backward compatibility
export interface InlineTextProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  children?: React.ReactNode;
}

export interface InlineRichTextProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  richText?: boolean;
  children?: React.ReactNode;
}

export interface InlineImageProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  children?: React.ReactNode;
}

export interface InlineSelectProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  options: SelectOption[];
  canEdit?: boolean;
  children?: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
}
