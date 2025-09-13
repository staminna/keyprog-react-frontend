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

  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};

export default ContentParser;
