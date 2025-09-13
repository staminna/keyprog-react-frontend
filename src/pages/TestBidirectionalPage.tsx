import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import { ContactInfoEditor } from '@/components/contacts/ContactInfoEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Globe, RefreshCw } from 'lucide-react';

/**
 * Test page for demonstrating bidirectional data flow
 * Shows real-time updates across multiple components
 */
const TestBidirectionalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force a refresh of all components
  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <PageLayout title="Bidirectional Data Flow Test">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bidirectional Data Flow Test</h1>
          <Button 
            variant="outline" 
            onClick={forceRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh All
          </Button>
        </div>

        <p className="text-gray-600 mb-6">
          This page demonstrates the bidirectional data flow between components. 
          Changes made in one component will automatically be reflected in others without page refresh.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Phone Display Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone size={18} />
                Phone Number Display
              </CardTitle>
              <CardDescription>
                Shows the phone number from settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                <UniversalContentEditor
                  collection="settings"
                  itemId="settings"
                  field="contact_phone"
                  value=""
                  showEditIcon={false}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This component is read-only and will update automatically when the phone number is changed elsewhere.
              </p>
            </CardContent>
          </Card>

          {/* Email Display Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={18} />
                Email Display
              </CardTitle>
              <CardDescription>
                Shows the email from settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                <UniversalContentEditor
                  collection="settings"
                  itemId="settings"
                  field="contact_email"
                  value=""
                  showEditIcon={false}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This component is read-only and will update automatically when the email is changed elsewhere.
              </p>
            </CardContent>
          </Card>

          {/* Title Display Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={18} />
                Site Title Display
              </CardTitle>
              <CardDescription>
                Shows the site title from settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                <UniversalContentEditor
                  collection="settings"
                  itemId="settings"
                  field="site_title"
                  value=""
                  showEditIcon={false}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This component is read-only and will update automatically when the site title is changed elsewhere.
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="contact">Contact Editor</TabsTrigger>
            <TabsTrigger value="settings">Settings Editor</TabsTrigger>
            <TabsTrigger value="universal">Universal Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information Editor</CardTitle>
                <CardDescription>
                  Edit contact information with real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactInfoEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings Editor</CardTitle>
                <CardDescription>
                  Edit site settings with real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                    <UniversalContentEditor
                      collection="settings"
                      itemId="settings"
                      field="site_title"
                      value=""
                      className="border border-gray-200 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <UniversalContentEditor
                      collection="settings"
                      itemId="settings"
                      field="contact_phone"
                      value=""
                      className="border border-gray-200 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <UniversalContentEditor
                      collection="settings"
                      itemId="settings"
                      field="contact_email"
                      value=""
                      className="border border-gray-200 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                    <UniversalContentEditor
                      collection="settings"
                      itemId="settings"
                      field="site_description"
                      value=""
                      className="border border-gray-200 rounded-md p-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universal">
            <Card>
              <CardHeader>
                <CardTitle>Universal Content Editor</CardTitle>
                <CardDescription>
                  Test any collection and field with real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UniversalEditorTester />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

/**
 * Component for testing universal content editor with any collection and field
 */
const UniversalEditorTester: React.FC = () => {
  const [collection, setCollection] = useState('settings');
  const [itemId, setItemId] = useState('settings');
  const [field, setField] = useState('contact_phone');
  const [showEditor, setShowEditor] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 100);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection
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
              Item ID
            </label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        <div>
          <Button type="submit">
            Load Field
          </Button>
        </div>
      </form>

      {showEditor && (
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">
            {collection}.{field}
          </h3>
          <UniversalContentEditor
            collection={collection}
            itemId={itemId}
            field={field}
            value=""
            className="border border-gray-200 rounded-md p-2"
          />
        </div>
      )}
    </div>
  );
};

export default TestBidirectionalPage;
