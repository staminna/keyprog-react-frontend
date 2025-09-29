import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import { useInlineEditor } from '@/components/universal/inline-editor-context';

interface SEOEditorProps {
  collection?: string;
  itemId?: string | number;
  title?: string;
  description?: string;
  keywords?: string;
}

const SEOEditor = ({
  collection = 'settings',
  itemId = 'settings',
  title = 'Keyprog - Especialistas em Eletrónica Automóvel',
  description = 'Serviços profissionais de reprogramação ECU, diagnóstico automóvel, reset airbag e soluções em eletrónica automóvel. Mais de 10 anos de experiência.',
  keywords = 'reprogramação ECU, diagnóstico automóvel, reset airbag, eletrónica automóvel, centralinas, OBD2, Portugal'
}: SEOEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isInlineEditingEnabled } = useInlineEditor();

  if (!isInlineEditingEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating SEO Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Edit SEO Settings"
      >
        <Settings size={20} />
      </button>

      {/* SEO Editor Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">SEO Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Recommended: 50-60 characters. This appears in search results and browser tabs.
                </div>
                <UniversalContentEditor
                  collection={collection}
                  itemId={itemId}
                  field="seo_title"
                  value={title}
                  placeholder="Enter page title..."
                  tag="div"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[50px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Recommended: 150-160 characters. This appears as the snippet in search results.
                </div>
                <UniversalContentEditor
                  collection={collection}
                  itemId={itemId}
                  field="seo_description"
                  value={description}
                  placeholder="Enter meta description..."
                  tag="div"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Enter keywords separated by commas. Focus on 3-5 main keywords.
                </div>
                <UniversalContentEditor
                  collection={collection}
                  itemId={itemId}
                  field="seo_keywords"
                  value={keywords}
                  placeholder="Enter keywords separated by commas..."
                  tag="div"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Preview</h3>
                <div className="space-y-2">
                  <div className="text-blue-600 text-lg font-medium line-clamp-1">
                    {title}
                  </div>
                  <div className="text-green-600 text-sm">
                    https://keyprog.pt
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {description}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SEOEditor;
