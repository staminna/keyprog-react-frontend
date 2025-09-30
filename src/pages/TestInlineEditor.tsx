import React from 'react';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import { useInlineEditor } from '@/components/universal/inline-editor-context';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';

/**
 * Test page for Universal Inline Editor
 * 
 * This page demonstrates the inline editor functionality with:
 * - Debug information display
 * - Multiple editable fields
 * - Different content types
 * 
 * Access at: http://localhost:5173/test-inline-editor
 */
const TestInlineEditor: React.FC = () => {
  const { isInlineEditingEnabled, setInlineEditingEnabled } = useInlineEditor();
  const { isInDirectusEditor, isAuthenticated, authChecked } = useDirectusEditorContext();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Inline Editor Test Page</h1>
      
      {/* Debug Information */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-3">🔧 Debug Information</h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-bold">Authentication Checked:</span>
            <span className={authChecked ? 'text-green-600' : 'text-orange-600'}>
              {authChecked ? '✅ Yes' : '⏳ Loading...'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">In Directus Editor:</span>
            <span className={isInDirectusEditor ? 'text-green-600' : 'text-gray-600'}>
              {isInDirectusEditor ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">Authenticated:</span>
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">Inline Editing Enabled:</span>
            <span className={isInlineEditingEnabled ? 'text-green-600' : 'text-red-600'}>
              {isInlineEditingEnabled ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">Dev Mode:</span>
            <span className="text-blue-600">
              {import.meta.env.DEV ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">Force Editing:</span>
            <span className="text-blue-600">
              {import.meta.env.VITE_FORCE_INLINE_EDITING === 'true' ? '✅ Yes' : '❌ No'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-300">
          <button
            onClick={() => setInlineEditingEnabled(!isInlineEditingEnabled)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isInlineEditingEnabled ? 'Disable' : 'Enable'} Inline Editing
          </button>
        </div>
        
        {!isAuthenticated && !isInDirectusEditor && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>⚠️ Not Authenticated:</strong> Please login at{' '}
            <a href="/admin" className="text-blue-600 underline">
              /admin
            </a>{' '}
            to enable editing.
          </div>
        )}
      </div>

      {/* Test Cases */}
      <div className="space-y-8">
        {/* Test Case 1: Simple Text */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">TEST CASE 1: Simple Text</h3>
          <UniversalContentEditor
            collection="settings"
            itemId="1"
            field="site_name"
            value="Keyprog - Test Title"
            className="text-2xl font-bold text-gray-900"
            placeholder="Click to edit title..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Click the text above to edit. Press Enter to save, Escape to cancel.
          </p>
        </div>

        {/* Test Case 2: Paragraph */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">TEST CASE 2: Paragraph Text</h3>
          <UniversalContentEditor
            collection="settings"
            itemId="1"
            field="site_description"
            value="This is a test paragraph that can be edited inline. Click anywhere in this text to start editing. You can modify the content and save it by pressing Enter."
            className="text-base text-gray-700 leading-relaxed"
            placeholder="Click to edit description..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Longer text to test multi-line editing.
          </p>
        </div>

        {/* Test Case 3: Styled Content */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">TEST CASE 3: Styled Content</h3>
          <UniversalContentEditor
            collection="settings"
            itemId="1"
            field="tagline"
            value="Innovating the future of automotive electronics"
            className="text-xl font-medium text-purple-600 italic"
            placeholder="Click to edit tagline..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Test with styled text and gradient background.
          </p>
        </div>

        {/* Test Case 4: Custom Tag */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">TEST CASE 4: Custom HTML Tag (h2)</h3>
          <UniversalContentEditor
            collection="settings"
            itemId="1"
            field="welcome_message"
            value="Welcome to Keyprog"
            tag="h2"
            className="text-3xl font-extrabold text-gray-900"
            placeholder="Click to edit heading..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Using an h2 tag instead of default div.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Open browser Developer Tools (F12) and check the Console</li>
            <li>Look for initialization logs starting with 🔧 and 🏛️</li>
            <li>Verify <code className="bg-blue-100 px-1">isInlineEditingEnabled: true</code></li>
            <li>Click on any text above (should see hover effect)</li>
            <li>Look for console logs: 🖱️ Click detected, 📝 TrueInlineEditor</li>
            <li>Type some text (cursor should blink)</li>
            <li>Press Enter to save or Escape to cancel</li>
            <li>Verify changes persist after save</li>
          </ol>
        </div>

        {/* Console Output Guide */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Expected Console Output</h3>
          <pre className="bg-green-100 p-4 rounded text-xs overflow-x-auto font-mono">
{`🏛️ InlineEditorProvider state: {
  isInlineEditingEnabled: true,
  canEverEnableEditing: true,
  ...
}

🔧 Editor Context Initialized: {
  isInlineEditingEnabled: true,
  isAuthenticated: true,
  ...
}

🔐 UniversalContentEditor Permission Check: {
  hasAuth: true,
  hasPermission: true,
  editingEnabled: true,
  canEdit: true
}

🖱️ Click detected, canEdit: true
✅ Starting edit mode for: {...}

📝 TrueInlineEditor: Initializing editor...
✅ Editor focused and cursor positioned (attempt 1)`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestInlineEditor;
