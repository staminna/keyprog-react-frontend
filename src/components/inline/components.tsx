import React from 'react';
import { 
  InlineTextEditor,
  InlineRichTextEditor,
  RemirrorEditorProvider,
  RemirrorEditorToolbar
} from '../remirror';

// Re-export with the old names for backward compatibility
export const InlineText = InlineTextEditor;
export const InlineRichText = InlineRichTextEditor;
export const InlineEditProvider = RemirrorEditorProvider;
export const InlineEditToolbar = RemirrorEditorToolbar;

// Stub for InlineImage until we implement it in Remirror
export const InlineImage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

// Stub for InlineSelect until we implement it in Remirror
export const InlineSelect: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};
