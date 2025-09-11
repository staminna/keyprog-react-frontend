import React from 'react';
import { InlineEditProvider } from '@/components/inline/InlineEditProvider';
import { InlineEditToolbar } from '@/components/inline/InlineEditToolbar';
import { InlineText } from '@/components/inline/InlineText';
import { InlineRichText } from '@/components/inline/InlineRichText';
import { InlineImage } from '@/components/inline/InlineImage';
import { InlineSelect } from '@/components/inline/InlineSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContentEditingExampleProps {
  // Example: editing a service item
  serviceId?: string;
  // Example: editing a news article
  newsId?: string;
  // Example: editing hero section (singleton)
  editHero?: boolean;
}

export const ContentEditingExample: React.FC<ContentEditingExampleProps> = ({
  serviceId = "1",
  newsId = "1",
  editHero = false
}) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <InlineEditProvider initialEditMode={false}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Edit Mode Toolbar */}
        <InlineEditToolbar />

        {/* Hero Section Example (Singleton) */}
        {editHero && (
          <Card>
            <CardHeader>
              <CardTitle>Hero Section (Singleton)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <InlineText
                  collection="hero"
                  itemId="hero"
                  field="title"
                  placeholder="Enter hero title..."
                  className="text-3xl font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <InlineText
                  collection="hero"
                  itemId="hero"
                  field="subtitle"
                  placeholder="Enter hero subtitle..."
                  multiline
                  className="text-lg text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Button Text</label>
                <InlineText
                  collection="hero"
                  itemId="hero"
                  field="primary_button_text"
                  placeholder="Button text..."
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Button Link</label>
                <InlineText
                  collection="hero"
                  itemId="hero"
                  field="primary_button_link"
                  placeholder="/link-url"
                  className="text-blue-600 underline"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Example */}
        <Card>
          <CardHeader>
            <CardTitle>Service Content Editing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Title</label>
                <InlineText
                  collection="services"
                  itemId={serviceId}
                  field="title"
                  placeholder="Enter service title..."
                  className="text-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <InlineSelect
                  collection="services"
                  itemId={serviceId}
                  field="status"
                  options={statusOptions}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <InlineText
                collection="services"
                itemId={serviceId}
                field="description"
                placeholder="Enter service description..."
                multiline
                className="text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service Image</label>
              <InlineImage
                collection="services"
                itemId={serviceId}
                field="image"
                className="w-full max-w-md h-48 object-cover rounded-lg"
                placeholder="Click to upload image..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Detailed Content</label>
              <InlineRichText
                collection="services"
                itemId={serviceId}
                field="content"
                placeholder="Enter detailed service content..."
                className="min-h-[200px] prose max-w-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <InlineText
                collection="services"
                itemId={serviceId}
                field="price"
                placeholder="0.00"
                className="text-lg font-bold text-green-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* News Article Example */}
        <Card>
          <CardHeader>
            <CardTitle>News Article Editing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Article Title</label>
              <InlineText
                collection="news"
                itemId={newsId}
                field="title"
                placeholder="Enter article title..."
                className="text-2xl font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Summary</label>
              <InlineText
                collection="news"
                itemId={newsId}
                field="summary"
                placeholder="Enter article summary..."
                multiline
                className="text-gray-600 italic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Image</label>
              <InlineImage
                collection="news"
                itemId={newsId}
                field="image"
                className="w-full max-w-lg h-64 object-cover rounded-lg"
                placeholder="Click to upload featured image..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Article Content</label>
              <InlineRichText
                collection="news"
                itemId={newsId}
                field="content"
                placeholder="Write your article content here..."
                className="min-h-[300px] prose max-w-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <InlineText
                  collection="news"
                  itemId={newsId}
                  field="author"
                  placeholder="Author name..."
                  className="font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <InlineText
                  collection="news"
                  itemId={newsId}
                  field="category"
                  placeholder="Article category..."
                  className="text-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <InlineText
                collection="news"
                itemId={newsId}
                field="tags"
                placeholder="tag1, tag2, tag3..."
                className="text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Publication Status</label>
              <InlineSelect
                collection="news"
                itemId={newsId}
                field="status"
                options={statusOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Real-time Collaboration Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-800">
                <strong>Real-time collaboration active:</strong> Changes are automatically saved and synchronized across all users. 
                Other users will see your changes in real-time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">How to Use Content Editing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Enable Edit Mode:</strong> Click the "Enable Edit Mode" button in the toolbar above.
              </div>
              <div>
                <strong>2. Click to Edit:</strong> Click on any editable text, image, or field to start editing.
              </div>
              <div>
                <strong>3. Auto-save:</strong> Changes are automatically saved after you stop typing (debounced).
              </div>
              <div>
                <strong>4. Manual Save:</strong> Click the green checkmark to save immediately.
              </div>
              <div>
                <strong>5. Cancel Changes:</strong> Click the red X to revert unsaved changes.
              </div>
              <div>
                <strong>6. Real-time Updates:</strong> Changes from other users appear automatically.
              </div>
              <div>
                <strong>7. Keyboard Shortcuts:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• <kbd>Enter</kbd> - Save single-line text</li>
                  <li>• <kbd>Ctrl/Cmd + Enter</kbd> - Save multi-line text</li>
                  <li>• <kbd>Escape</kbd> - Cancel editing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InlineEditProvider>
  );
};

export default ContentEditingExample;
