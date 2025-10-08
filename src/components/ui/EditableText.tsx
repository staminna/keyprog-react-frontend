import React from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  isEditable?: boolean;
  onEdit?: () => void;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'label';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  isEditable = false,
  onEdit,
  className = '',
  as: Component = 'span'
}) => {
  if (!isEditable) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <div className="relative group inline-block">
      <Component className={className}>{value}</Component>
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          title="Edit this text"
        >
          <Pencil className="w-3 h-3 text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default EditableText;
