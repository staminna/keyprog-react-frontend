/**
 * Parse doc(paragraph(...)) syntax and convert it to plain text
 * @param content The content to parse
 * @returns Parsed plain text content
 */
export function parseDocParagraphSyntax(content: string): string {
  if (!content) return '';

  // Check if content matches doc(paragraph(...)) pattern
  const docParagraphRegex = /doc\(paragraph\("([^"]*)"\)\)/g;
  
  // If it matches, extract the content inside the quotes
  if (docParagraphRegex.test(content)) {
    // Create a new string with all matches replaced
    return content.replace(docParagraphRegex, (_, text) => {
      // Unescape any escaped quotes
      const unescapedText = text.replace(/\\"/g, '"');
      return unescapedText;
    });
  }

  // Handle more complex doc syntax with multiple paragraphs
  const docRegex = /doc\((.*)\)/;
  if (docRegex.test(content)) {
    const match = content.match(docRegex);
    if (match && match[1]) {
      const innerContent = match[1];
      
      // Parse paragraph syntax inside doc
      const paragraphRegex = /paragraph\("([^"]*)"\)/g;
      let paragraphMatch;
      let parsedContent = innerContent;
      
      // Replace each paragraph with plain text
      while ((paragraphMatch = paragraphRegex.exec(innerContent)) !== null) {
        const text = paragraphMatch[1].replace(/\\"/g, '"');
        parsedContent = parsedContent.replace(paragraphMatch[0], text);
      }
      
      return parsedContent;
    }
  }

  // If no special syntax is found, return the original content
  return content;
}

/**
 * Clean content before saving to remove doc(paragraph(...)) syntax
 * @param content The content to clean
 * @returns Cleaned content
 */
export function cleanContentForSaving(content: string): string {
  // If content is already clean (no doc/paragraph syntax), return as is
  if (!content.includes('doc(') && !content.includes('paragraph(')) {
    return content;
  }
  
  // Parse the content to remove doc/paragraph syntax
  return parseDocParagraphSyntax(content);
}

/**
 * Format content for display, ensuring no doc(paragraph(...)) syntax
 * @param content The content to format
 * @returns Formatted content ready for display
 */
export function formatContentForDisplay(content: string): string {
  // First check if we need to process this content
  if (!content) return '';
  
  // Remove any doc(paragraph(...)) syntax
  const cleanedContent = parseDocParagraphSyntax(content);
  
  return cleanedContent;
}

/**
 * Check if content contains doc(paragraph(...)) syntax
 * @param content The content to check
 * @returns True if content contains doc(paragraph(...)) syntax
 */
export function hasDocParagraphSyntax(content: string): boolean {
  return content?.includes('doc(paragraph(') || false;
}

/**
 * Generate clean content without doc(paragraph(...)) syntax
 * This is useful for creating new content
 * @param text The text to include in the content
 * @returns Clean content without doc(paragraph(...)) syntax
 */
export function generateCleanContent(text: string): string {
  return text || '';
}

export default {
  parseDocParagraphSyntax,
  cleanContentForSaving,
  formatContentForDisplay,
  hasDocParagraphSyntax,
  generateCleanContent
};
