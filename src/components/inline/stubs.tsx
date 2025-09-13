import React from 'react';

// Stub for InlineImage until we implement it in Remirror
export const InlineImage: React.FC<{ 
  value?: string;
  collection?: string;
  itemId?: string;
  field?: string;
  canEdit?: boolean;
  children?: React.ReactNode;
}> = ({ children, value }) => {
  return (
    <div>
      {children || (value && <img src={value} alt="Inline content" />)}
    </div>
  );
};

// Stub for InlineSelect until we implement it in Remirror
export interface SelectOption {
  value: string;
  label: string;
}

export const InlineSelect: React.FC<{
  value?: string;
  collection?: string;
  itemId?: string;
  field?: string;
  options?: SelectOption[];
  canEdit?: boolean;
  children?: React.ReactNode;
}> = ({ children, value, options = [] }) => {
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div>
      {children || selectedOption?.label || value}
    </div>
  );
};
