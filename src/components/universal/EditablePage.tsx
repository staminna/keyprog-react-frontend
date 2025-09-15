import React from 'react';
import { SimpleEditableText } from './SimpleEditableText';

interface EditablePageProps {
  collection: string;
  itemId: string | number;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Universal editable page component that works across all page types
 */
export const EditablePage: React.FC<EditablePageProps> = ({
  collection,
  itemId,
  title,
  subtitle,
  description,
  content,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {/* Editable Title */}
      {title && (
        <SimpleEditableText
          collection={collection}
          itemId={itemId}
          field="title"
          value={title}
          tag="h1"
          className="text-4xl font-bold mb-6 text-gradient-primary"
          placeholder="Enter page title..."
        />
      )}

      {/* Editable Subtitle */}
      {subtitle && (
        <SimpleEditableText
          collection={collection}
          itemId={itemId}
          field="subtitle"
          value={subtitle}
          tag="h2"
          className="text-2xl font-semibold mb-4 text-muted-foreground"
          placeholder="Enter subtitle..."
        />
      )}

      {/* Editable Description */}
      {description && (
        <SimpleEditableText
          collection={collection}
          itemId={itemId}
          field="description"
          value={description}
          tag="p"
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          placeholder="Enter description..."
        />
      )}

      {/* Editable Content */}
      {content && (
        <SimpleEditableText
          collection={collection}
          itemId={itemId}
          field="content"
          value={content}
          tag="div"
          className="prose prose-lg max-w-none"
          placeholder="Enter page content..."
        />
      )}

      {/* Additional children content */}
      {children}
    </div>
  );
};

export default EditablePage;
