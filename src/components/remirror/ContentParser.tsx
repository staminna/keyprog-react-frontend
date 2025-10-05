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
    return null;
  }

  // Format content for display
  const parsedContent = formatContentForDisplay(content);

  // If content is a simple string, render it directly as text
  if (typeof parsedContent === 'string') {
    // Return just the text, parent component will handle styling
    return <>{parsedContent}</>;
  }

  // If content is already parsed JSON, render it
  if (parsedContent && typeof parsedContent === 'object') {
    return <RemirrorRenderer json={parsedContent} />;
  }

  // Fallback for empty or invalid content
  return null;
};

export default ContentParser;
