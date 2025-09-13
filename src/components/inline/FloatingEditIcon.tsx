import React from 'react';
import { Pencil } from 'lucide-react';
import './floating-edit-icon.css';

interface FloatingEditIconProps {
  onEdit?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A floating edit icon that appears when hovering over editable content
 */
export const FloatingEditIcon: React.FC<FloatingEditIconProps> = ({
  onEdit,
  disabled = false,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit && !disabled) {
      onEdit();
    }
  };

  return (
    <div className={`floating-edit-icon-container ${className}`}>
      <div 
        className={`floating-edit-icon always-visible ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
      >
        <Pencil size={16} />
      </div>
    </div>
  );
};

export default FloatingEditIcon;
