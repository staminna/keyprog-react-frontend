import { useState } from 'react';

// Compatibility hook for useInlineEdit
export const useInlineEdit = (options: {
  collection: string;
  itemId?: string;
  field: string;
}) => {
  // Initialize state for the editor
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Return a compatible API
  return {
    value,
    originalValue: value,
    isEditing,
    isSaving,
    hasChanges: false,
    error: null,
    updateValue: (newValue: string) => setValue(newValue),
    save: async () => {
      setIsSaving(true);
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsSaving(false);
      setIsEditing(false);
      return true;
    },
    revert: () => {
      setIsEditing(false);
    },
    startEditing: () => setIsEditing(true),
    stopEditing: () => setIsEditing(false)
  };
};
