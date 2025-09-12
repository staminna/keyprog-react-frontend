import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useInlineEditContext } from './InlineEditProvider';
import { 
  Edit3, 
  Eye, 
  Save, 
  RotateCcw, 
  Settings, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditToolbarProps {
  className?: string;
  showTitle?: boolean;
  position?: 'top' | 'bottom' | 'floating';
}

export const InlineEditToolbar: React.FC<InlineEditToolbarProps> = ({
  className = '',
  showTitle = true,
  position = 'top'
}) => {
  const {
    showEditMode,
    toggleEditMode,
    isAnyEditing,
    saveAll,
    revertAll
  } = useInlineEditContext();

  const baseClassName = cn(
    'flex items-center justify-between p-4 bg-white border shadow-sm',
    position === 'top' && 'border-b sticky top-0 z-50',
    position === 'bottom' && 'border-t sticky bottom-0 z-50',
    position === 'floating' && 'rounded-lg border shadow-lg',
    className
  );

  return (
    <div className={baseClassName}>
      <div className="flex items-center gap-4">
        {showTitle && (
          <h1 className="text-xl font-semibold">Visual Content Editor</h1>
        )}
        
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <Switch
            checked={showEditMode}
            onCheckedChange={toggleEditMode}
            id="edit-mode-toggle"
          />
          <Edit3 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {showEditMode ? 'Edit Mode' : 'View Mode'}
          </span>
        </div>

        {showEditMode && (
          <Badge variant={isAnyEditing ? 'destructive' : 'secondary'}>
            {isAnyEditing ? 'Editing' : 'Ready'}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showEditMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={revertAll}
              disabled={!isAnyEditing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Revert All
            </Button>
            
            <Button
              size="sm"
              onClick={saveAll}
              disabled={!isAnyEditing}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save All
            </Button>
          </>
        )}
        
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default InlineEditToolbar;
