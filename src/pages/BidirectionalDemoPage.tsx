import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { ContactInfoEditor } from '@/components/contacts/ContactInfoEditor';
import { DirectusContentExample } from '@/components/examples/DirectusContentExample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Demo page showcasing all bidirectional data flow components
 */
const BidirectionalDemoPage: React.FC = () => {
  return (
    <PageLayout title="Bidirectional Data Flow Demo">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Bidirectional Data Flow Demo</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates the bidirectional data flow between React and Directus CMS.
          Edit content directly in the components below and see the changes reflected in Directus.
        </p>
        
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="custom">Custom Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information Editor</CardTitle>
                <CardDescription>
                  Edit contact information with bidirectional synchronization across collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactInfoEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Content Editor</CardTitle>
                <CardDescription>
                  Edit page content with bidirectional synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DirectusContentExample
                  collection="pages"
                  slug="home"
                  fields={['title', 'content', 'meta_title', 'meta_description']}
                  title="Home Page"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About Page Editor</CardTitle>
                <CardDescription>
                  Edit about page content with bidirectional synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DirectusContentExample
                  collection="pages"
                  slug="about"
                  fields={['title', 'content', 'meta_title', 'meta_description']}
                  title="About Page"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  Edit global site settings with bidirectional synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DirectusContentExample
                  collection="hero"
                  fields={[
                    'title',
                    'description',
                    'contact_email',
                    'contact_phone',
                    'social_facebook',
                    'social_twitter',
                    'social_instagram'
                  ]}
                  title="Site Settings"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Collection Example</CardTitle>
                <CardDescription>
                  Edit any Directus collection with bidirectional synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Enter a collection name and ID or slug to edit any content in Directus
                </p>
                
                <CustomCollectionEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

/**
 * Custom collection editor component
 * Allows editing any collection in Directus
 */
const CustomCollectionEditor: React.FC = () => {
  const [collection, setCollection] = React.useState('services');
  const [itemId, setItemId] = React.useState('1');
  const [slug, setSlug] = React.useState('');
  const [fields, setFields] = React.useState('title,description,slug');
  const [showEditor, setShowEditor] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditor(true);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="grid gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fields (comma-separated)
            </label>
            <input
              type="text"
              value={fields}
              onChange={(e) => setFields(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item ID (optional)
            </label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (optional)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Load Content
          </button>
        </div>
      </form>
      
      {showEditor && (
        <DirectusContentExample
          collection={collection}
          itemId={itemId || undefined}
          slug={slug || undefined}
          fields={fields.split(',').map(f => f.trim())}
          title={`${collection} Editor`}
        />
      )}
    </div>
  );
};

export default BidirectionalDemoPage;
