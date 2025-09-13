// Export components from separate files to fix fast refresh warning
export { 
  InlineText,
  InlineRichText,
  InlineEditProvider,
  InlineEditToolbar,
  InlineImage,
  InlineSelect
} from './components';

// Export hook from separate file
export { useInlineEdit } from './useInlineEdit';

// Export types from separate file
export type { 
  InlineTextProps,
  InlineRichTextProps,
  InlineImageProps,
  InlineSelectProps,
  SelectOption 
} from './types';
