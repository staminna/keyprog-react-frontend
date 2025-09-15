import React from 'react';
import { formatContentForDisplay } from '@/utils/contentParserV2';

/**
 * ContentParser component that parses and renders content with special syntax
 * This component handles doc(paragraph(...)) syntax and converts it to proper HTML
 */
interface ContentParserProps {
  content: string;
  className?: string;
}

export const ContentParser: React.FC<ContentParserProps> = ({ content, className = '' }) => {
  // Check if content is empty or undefined
  if (!content) {
    return <span className={className}></span>;
  }

  // Format content for display
  const parsedContent = formatContentForDisplay(content);

  // If content is a simple string, wrap it in a paragraph
  if (typeof parsedContent === 'string') {
    return <span className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: parsedContent }} />;
  }

  // If content is already parsed JSON, render it
  if (parsedContent && typeof parsedContent === 'object') {
    return (
      <span className="prose prose-lg max-w-none">
        <RemirrorRenderer json={parsedContent} />
      </span>
    );
  }

  // Fallback for empty or invalid content
  return <span className="text-gray-400">No content available</span>;
};

export default ContentParser;
