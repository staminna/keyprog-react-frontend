import React, { useEffect, useState } from 'react';
import { useInlineEditor } from './InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import useRouteContent from '@/hooks/useRouteContent';
import { DirectusService } from '@/services/directusService';

/**
 * DOMEditableScanner scans the DOM for text nodes and makes them editable
 * It uses a MutationObserver to detect changes to the DOM
 */
export const DOMEditableScanner: React.FC = () => {
  const { isInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = (isInDirectusEditor || isAuthenticated) && isInlineEditingEnabled;
  const { collection, itemId } = useRouteContent();
  
  // Track whether the scanner is active
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (!canEdit || !collection || !itemId) {
      return;
    }
    
    // Create a style element for editable nodes
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .directus-editable-text {
        position: relative;
        cursor: pointer;
        outline: 1px dashed transparent;
        transition: outline-color 0.2s;
      }
      
      .directus-editable-text:hover {
        outline: 1px dashed rgba(var(--primary), 0.5);
      }
      
      .directus-editable-text::after {
        content: "✏️";
        position: absolute;
        top: -15px;
        right: -5px;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .directus-editable-text:hover::after {
        opacity: 1;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Function to process text nodes
    const processTextNodes = (rootNode: Node) => {
      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip empty text nodes and nodes in script/style elements
            if (!node.textContent?.trim()) {
              return NodeFilter.FILTER_REJECT;
            }
            
            const parent = node.parentElement;
            if (!parent) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip nodes in excluded elements
            const excludedTags = ['SCRIPT', 'STYLE', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
            if (excludedTags.includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip nodes with excluded classes
            const excludedClasses = ['no-edit', 'directus-editable-text'];
            if (excludedClasses.some(cls => parent.classList.contains(cls))) {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      // Process each text node
      const textNodes: Node[] = [];
      let currentNode: Node | null;
      while (currentNode = walker.nextNode()) {
        textNodes.push(currentNode);
      }
      
      // Make each text node editable
      textNodes.forEach((node) => {
        const parent = node.parentElement;
        if (!parent) return;
        
        // Skip if already processed
        if (parent.classList.contains('directus-editable-text')) {
          return;
        }
        
        // Create a wrapper span for the text node
        const wrapper = document.createElement('span');
        wrapper.classList.add('directus-editable-text');
        wrapper.setAttribute('data-collection', collection);
        wrapper.setAttribute('data-item-id', itemId);
        
        // Generate a field name based on the content
        const content = node.textContent || '';
        const hash = Math.abs(hashCode(content)).toString(16).substring(0, 8);
        const fieldName = `auto_text_${hash}`;
        wrapper.setAttribute('data-field', fieldName);
        
        // Replace the text node with the wrapper
        parent.replaceChild(wrapper, node);
        wrapper.appendChild(node);
        
        // Add click handler to make it editable
        wrapper.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const field = wrapper.getAttribute('data-field') || '';
          const collection = wrapper.getAttribute('data-collection') || '';
          const itemId = wrapper.getAttribute('data-item-id') || '';
          const content = wrapper.textContent || '';
          
          // Create a contenteditable element
          const editor = document.createElement('span');
          editor.contentEditable = 'true';
          editor.textContent = content;
          editor.style.display = 'inline-block';
          editor.style.minWidth = '20px';
          editor.style.outline = '2px solid rgba(var(--primary), 0.5)';
          editor.style.padding = '2px 4px';
          
          // Replace the wrapper with the editor
          wrapper.replaceChild(editor, node);
          
          // Focus the editor
          editor.focus();
          
          // Select all text
          const range = document.createRange();
          range.selectNodeContents(editor);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          // Handle blur event to save changes
          editor.addEventListener('blur', async () => {
            const newContent = editor.textContent || '';
            
            // Save changes to Directus
            try {
              await DirectusService.updateCollectionItem(collection, itemId, {
                [field]: newContent
              });
              
              // Update the text node
              const newTextNode = document.createTextNode(newContent);
              wrapper.replaceChild(newTextNode, editor);
            } catch (error) {
              console.error('Failed to save changes:', error);
              
              // Restore the original text node
              const originalTextNode = document.createTextNode(content);
              wrapper.replaceChild(originalTextNode, editor);
            }
          });
          
          // Handle enter key to save changes
          editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              editor.blur();
            }
          });
        });
      });
    };
    
    // Simple hash function for generating field names
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    };
    
    // Process the initial DOM
    processTextNodes(document.body);
    
    // Set up a MutationObserver to detect DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              processTextNodes(node);
            }
          });
        }
      });
    });
    
    // Start observing the DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Mark the scanner as active
    setIsActive(true);
    
    // Clean up on unmount
    return () => {
      observer.disconnect();
      document.head.removeChild(styleElement);
      setIsActive(false);
    };
  }, [canEdit, collection, itemId]);
  
  // This component doesn't render anything visible
  return null;
};

export default DOMEditableScanner;