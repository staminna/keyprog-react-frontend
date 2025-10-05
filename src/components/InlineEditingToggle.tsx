import { useInlineEditor } from '@/components/universal/inline-editor-context';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';

/**
 * Toggle button for inline editing mode
 * Only visible for authenticated administrators
 */
export const InlineEditingToggle = () => {
  const { isInlineEditingEnabled, setInlineEditingEnabled } = useInlineEditor();
  const { isAuthenticated, user } = useUnifiedAuth();

  // Only show for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    const newState = !isInlineEditingEnabled;
    setInlineEditingEnabled(newState);
    console.log('🎨 Inline editing toggled:', newState);
  };

  return (
    <Button
      variant={isInlineEditingEnabled ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="fixed top-20 right-4 z-50 shadow-lg"
      title={isInlineEditingEnabled ? "Desativar edição inline" : "Ativar edição inline"}
    >
      {isInlineEditingEnabled ? (
        <>
          <Edit3 className="mr-2 h-4 w-4" />
          Modo Edição
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Modo Visualização
        </>
      )}
    </Button>
  );
};

export default InlineEditingToggle;
