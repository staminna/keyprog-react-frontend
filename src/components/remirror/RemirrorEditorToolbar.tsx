import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useRemirrorEditorContext } from './RemirrorEditorProvider';
import { 
  Edit, 
  Eye, 
  Save, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemirrorEditorToolbarProps {
  className?: string;
  showTitle?: boolean;
  position?: 'top' | 'bottom' | 'floating';
}

export const RemirrorEditorToolbar: React.FC<RemirrorEditorToolbarProps> = ({
  className = '',
  showTitle = true,
  position = 'top'
}) => {
  const { 
    showEditMode, 
    setShowEditMode, 
    isAnyEditing,
    saveAll,
    revertAll
  } = useRemirrorEditorContext();

  const baseClassName = cn(
    'flex items-center justify-between p-4 bg-white border shadow-sm',
    {
      'rounded-t-lg border-b': position === 'top',
      'rounded-b-lg border-t': position === 'bottom',
      'rounded-lg fixed bottom-4 right-4 z-50 shadow-lg': position === 'floating',
    },
    className
  );

  return (
    <div className={baseClassName}>
      <div className="flex items-center gap-2">
        {showTitle && (
          <div className="font-medium">
            {showEditMode ? (
              <div className="flex items-center gap-2">
                <Edit size={16} className="text-blue-500" />
                <span>Edit Mode</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-500" />
                <span>View Mode</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Switch
            checked={showEditMode}
            onCheckedChange={setShowEditMode}
            id="edit-mode"
          />
          <label
            htmlFor="edit-mode"
            className="text-sm cursor-pointer"
          >
            {showEditMode ? 'Editing Enabled' : 'Editing Disabled'}
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAnyEditing && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle size={12} className="mr-1" />
            Unsaved Changes
          </Badge>
        )}
        
        <Button
          size="sm"
          variant="outline"
          onClick={revertAll}
          disabled={!isAnyEditing}
          className={cn(
            "border-gray-200",
            !isAnyEditing && "opacity-50 cursor-not-allowed"
          )}
        >
          <RotateCcw size={14} className="mr-1" />
          Revert All
        </Button>
        
        <Button
          size="sm"
          variant="default"
          onClick={saveAll}
          disabled={!isAnyEditing}
          className={cn(
            "bg-blue-500 hover:bg-blue-600",
            !isAnyEditing && "opacity-50 cursor-not-allowed"
          )}
        >
          <Save size={14} className="mr-1" />
          Save All
        </Button>
      </div>
    </div>
  );
};

export default RemirrorEditorToolbar;
