import React, { useState, useEffect } from 'react';
import { useInlineEditor } from './InlineEditorProvider';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import { Pencil, Eye, Save, X, RefreshCw } from 'lucide-react';
import './editable.css';

/**
 * EditableToolbar provides a floating toolbar for controlling the inline editor
 */
export const EditableToolbar: React.FC = () => {
  const { isInlineEditingEnabled, setInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = isInDirectusEditor || isAuthenticated;
  
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Toggle inline editing
  const toggleEditing = () => {
    setInlineEditingEnabled(!isInlineEditingEnabled);
  };
  
  // Refresh the page
  const refreshPage = () => {
    window.location.reload();
  };
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  // Hide toolbar with keyboard shortcut (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(!visible);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);
  
  if (!canEdit) {
    return null;
  }
  
  if (!visible) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-2 cursor-pointer z-50"
        onClick={() => setVisible(true)}
      >
        <Pencil size={16} />
      </div>
    );
  }
  
  return (
    <div
      className="editable-toolbar"
      style={{
        position: 'fixed',
        left: position.x || '50%',
        bottom: position.y ? 'auto' : '20px',
        top: position.y || 'auto',
        transform: position.x ? 'none' : 'translateX(-50%)'
      }}
    >
      <div
        className="cursor-move p-2 bg-gray-100 rounded mr-2"
        onMouseDown={handleMouseDown}
      >
        ⋮⋮
      </div>
      
      <button
        onClick={toggleEditing}
        className={isInlineEditingEnabled ? 'active' : ''}
        title={isInlineEditingEnabled ? 'Disable editing' : 'Enable editing'}
      >
        {isInlineEditingEnabled ? <Eye size={16} /> : <Pencil size={16} />}
        {isInlineEditingEnabled ? 'View Mode' : 'Edit Mode'}
      </button>
      
      <button
        onClick={refreshPage}
        title="Refresh page"
      >
        <RefreshCw size={16} />
        Refresh
      </button>
      
      <button
        onClick={() => setVisible(false)}
        title="Hide toolbar"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default EditableToolbar;