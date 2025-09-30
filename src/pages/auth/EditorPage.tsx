import { useEffect } from 'react';
import { useInlineEditor } from '@/components/universal/inline-editor-context';
import { Edit3, Check } from 'lucide-react';

export const EditorPage = () => {
  const { isInlineEditingEnabled, setInlineEditingEnabled } = useInlineEditor();

  // Auto-enable inline editing when this page loads
  useEffect(() => {
    if (!isInlineEditingEnabled) {
      setInlineEditingEnabled(true);
    }
  }, [isInlineEditingEnabled, setInlineEditingEnabled]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Editor Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Editor</h1>
              <p className="text-gray-600">Edit your website content inline</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {isInlineEditingEnabled ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Editing Enabled</span>
                </div>
              ) : (
                <button
                  onClick={() => setInlineEditingEnabled(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Enable Editing</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Como Usar o Editor Inline</h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Navegue para qualquer página do website (/, /servicos, /contactos, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>O conteúdo editável terá um contorno azul quando passar o rato por cima</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Clique no conteúdo para começar a editar (abre editor de texto rico)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Use os botões <kbd className="bg-white px-2 py-1 rounded border">✓ Save</kbd> para guardar ou <kbd className="bg-white px-2 py-1 rounded border">✗ Cancel</kbd> para cancelar</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">Nota:</span>
              <span>As alterações são guardadas diretamente no Directus CMS</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900 mb-1">Home Page</h3>
              <p className="text-sm text-gray-600">Edit hero, services, and categories</p>
            </a>
            
            <a
              href="/servicos"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900 mb-1">Services</h3>
              <p className="text-sm text-gray-600">Manage service listings</p>
            </a>
            
            <a
              href="/contactos"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900 mb-1">Contact</h3>
              <p className="text-sm text-gray-600">Update contact information</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
