import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InlineText, InlineRichText, InlineImage, InlineSelect } from '@/components/inline';
import { InlineEditProvider, InlineEditToolbar } from '@/components/inline';
import { Separator } from '@/components/ui/separator';

const InlineEditDemo: React.FC = () => {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  const categoryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'services', label: 'Services' }
  ];

  return (
    <InlineEditProvider initialEditMode={false}>
      <div className="min-h-screen bg-gray-50">
        <InlineEditToolbar />
        
        <div className="container py-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Inline Editing Demo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Toggle edit mode above to see real-time inline editing in action. 
              All changes sync instantly with Directus CMS.
            </p>
          </div>

          <Separator />

          {/* Text Editing Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Text Editing
                <Badge variant="secondary">InlineText</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Page Title</h3>
                <InlineText
                  collection="pages"
                  itemId="demo-page"
                  field="title"
                  placeholder="Enter page title..."
                  className="text-2xl font-bold"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Subtitle</h3>
                <InlineText
                  collection="pages"
                  itemId="demo-page"
                  field="subtitle"
                  placeholder="Enter subtitle..."
                  className="text-lg text-muted-foreground"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Multiline Description</h3>
                <InlineText
                  collection="pages"
                  itemId="demo-page"
                  field="description"
                  placeholder="Enter description..."
                  multiline
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Rich Text Editing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Rich Text Editing
                <Badge variant="secondary">InlineRichText</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="text-lg font-semibold mb-2">Article Content</h3>
                <InlineRichText
                  collection="pages"
                  itemId="demo-page"
                  field="content"
                  placeholder="Enter rich content with formatting..."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Editing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Image Editing
                <Badge variant="secondary">InlineImage</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="text-lg font-semibold mb-2">Featured Image</h3>
                <InlineImage
                  collection="pages"
                  itemId="demo-page"
                  field="featured_image"
                  placeholder="Click to upload featured image..."
                  maxWidth={600}
                  maxHeight={400}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Select Editing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Select Editing
                <Badge variant="secondary">InlineSelect</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Status</h3>
                <InlineSelect
                  collection="pages"
                  itemId="demo-page"
                  field="status"
                  options={statusOptions}
                  placeholder="Select status..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Category</h3>
                <InlineSelect
                  collection="pages"
                  itemId="demo-page"
                  field="category"
                  options={categoryOptions}
                  placeholder="Select category..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Complex Layout Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Complex Layout Example
                <Badge variant="outline">Mixed Components</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <InlineImage
                    collection="services"
                    itemId="service-1"
                    field="image"
                    placeholder="Service image..."
                    maxWidth={400}
                    maxHeight={300}
                  />
                </div>
                <div className="space-y-4">
                  <InlineText
                    collection="services"
                    itemId="service-1"
                    field="name"
                    placeholder="Service name..."
                    className="text-xl font-semibold"
                  />
                  <InlineText
                    collection="services"
                    itemId="service-1"
                    field="short_description"
                    placeholder="Short description..."
                    multiline
                    className="text-muted-foreground"
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <InlineSelect
                      collection="services"
                      itemId="service-1"
                      field="status"
                      options={statusOptions}
                      showEditIcon={false}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features List */}
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">✨ Real-time Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Changes sync instantly with Directus CMS via WebSocket connections
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🎯 Optimistic Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    UI updates immediately with automatic rollback on errors
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🔄 Conflict Resolution</h4>
                  <p className="text-sm text-muted-foreground">
                    Handles concurrent edits with real-time conflict detection
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🎨 Visual Indicators</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear visual feedback for editing states and unsaved changes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InlineEditProvider>
  );
};

export default InlineEditDemo;
