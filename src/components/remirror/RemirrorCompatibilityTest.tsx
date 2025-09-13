import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import from the old inline editor API to test compatibility
import { 
  InlineRichText, 
  InlineEditProvider, 
  InlineEditToolbar,
  useInlineEdit
} from '@/components/inline';

// Import from the new Remirror API for comparison
import {
  InlineRichTextEditor,
  RemirrorEditorProvider,
  RemirrorEditorToolbar
} from './index';

const OldApiExample = () => {
  const [content, setContent] = useState({
    title: 'Example Title (Old API)',
    description: 'This is using the old inline editor API through the compatibility layer.',
    richContent: '<h2>Old API Example</h2><p>This content should be editable through the compatibility layer.</p>'
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Old API (Compatibility Layer)</h3>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">InlineRichText (Simple Text)</h4>
        <InlineRichText
          field="title"
          value={content.title}
          collection="examples"
          itemId="example1"
          canEdit={true}
        >
          <h2 className="text-2xl font-bold">{content.title}</h2>
        </InlineRichText>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">InlineRichText</h4>
        <InlineRichText
          field="richContent"
          value={content.richContent}
          collection="examples"
          itemId="example1"
          canEdit={true}
        >
          <div dangerouslySetInnerHTML={{ __html: content.richContent }} />
        </InlineRichText>
      </div>
    </div>
  );
};

const NewApiExample = () => {
  const [content, setContent] = useState({
    title: 'Example Title (New API)',
    description: 'This is using the new Remirror API directly.',
    richContent: '<h2>New API Example</h2><p>This content should be editable through the new Remirror API.</p>'
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">New API (Direct Remirror)</h3>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">InlineRichTextEditor (Simple Text)</h4>
        <InlineRichTextEditor
          value={content.title}
          collection="examples"
          itemId="example2"
          field="title"
          canEdit={true}
          onSave={(value) => setContent(prev => ({ ...prev, title: value }))}
        >
          <h2 className="text-2xl font-bold">{content.title}</h2>
        </InlineRichTextEditor>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">InlineRichTextEditor</h4>
        <InlineRichTextEditor
          value={content.richContent}
          collection="examples"
          itemId="example2"
          field="richContent"
          canEdit={true}
          onSave={(value) => setContent(prev => ({ ...prev, richContent: value }))}
        />
      </div>
    </div>
  );
};

export const RemirrorCompatibilityTest: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Remirror Compatibility Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="old-api">
            <TabsList>
              <TabsTrigger value="old-api">Old API (Compatibility)</TabsTrigger>
              <TabsTrigger value="new-api">New API (Direct)</TabsTrigger>
              <TabsTrigger value="both">Side by Side</TabsTrigger>
            </TabsList>
            
            <TabsContent value="old-api" className="mt-4">
              <InlineEditProvider initialEditMode={true}>
                <InlineEditToolbar />
                <div className="mt-4">
                  <OldApiExample />
                </div>
              </InlineEditProvider>
            </TabsContent>
            
            <TabsContent value="new-api" className="mt-4">
              <RemirrorEditorProvider initialEditMode={true}>
                <RemirrorEditorToolbar />
                <div className="mt-4">
                  <NewApiExample />
                </div>
              </RemirrorEditorProvider>
            </TabsContent>
            
            <TabsContent value="both" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <InlineEditProvider initialEditMode={true}>
                    <InlineEditToolbar />
                    <div className="mt-4">
                      <OldApiExample />
                    </div>
                  </InlineEditProvider>
                </div>
                
                <div>
                  <RemirrorEditorProvider initialEditMode={true}>
                    <RemirrorEditorToolbar />
                    <div className="mt-4">
                      <NewApiExample />
                    </div>
                  </RemirrorEditorProvider>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RemirrorCompatibilityTest;
