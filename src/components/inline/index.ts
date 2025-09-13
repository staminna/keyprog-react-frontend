// Direct export of Remirror implementation
// This file provides the main inline editing API
import type { ReactNode } from 'react';

// Export Remirror components directly
export { 
  InlineRichTextEditor as InlineRichText,
  RemirrorEditorProvider as InlineEditProvider,
  RemirrorEditorToolbar as InlineEditToolbar
} from '../remirror';

// Export enhanced components with upload support
export { InlineImage } from '../remirror/InlineImage';
export { InlineSelect } from './stubs';

// Export collection mapper component
export { CollectionMapper } from './CollectionMapper';
export type { CollectionMapperProps } from './CollectionMapper';

// Export floating edit icon and editable content components
export { FloatingEditIcon } from './FloatingEditIcon';
export { EditableContent } from './EditableContent';
export type { EditableContentProps } from './EditableContent';
export { EditableImage } from './EditableImage';
export type { EditableImageProps } from './EditableImage';

// Import types from stubs
import { SelectOption } from './stubs';

// Direct export of Remirror context
export { useRemirrorContext as useInlineEdit } from '@remirror/react';

// Export interface types for backward compatibility
export interface InlineImageProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  children?: ReactNode;
  onUpload?: (fileId: string) => void;
}

export interface InlineSelectProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  options: SelectOption[];
  canEdit?: boolean;
  children?: ReactNode;
}

// Re-export types from remirror with aliases
export type { 
  InlineRichTextEditorProps as InlineRichTextProps 
} from '../remirror';

// Re-export SelectOption type for backward compatibility
export type { SelectOption };
