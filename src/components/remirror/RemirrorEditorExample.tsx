import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RemirrorEditor, 
  InlineTextEditor, 
  InlineRichTextEditor,
  RemirrorEditorProvider,
  RemirrorEditorToolbar
} from './index';

export const RemirrorEditorExample: React.FC = () => {
  const [content, setContent] = useState({
    title: 'Example Title',
    description: 'This is an example description that can be edited inline.',
    richContent: '<h2>Rich Text Example</h2><p>This is a rich text editor example with <strong>bold</strong>, <em>italic</em>, and other formatting options.</p><ul><li>List item 1</li><li>List item 2</li></ul>'
  });

  const handleContentChange = (html: string) => {
    setContent(prev => ({
      ...prev,
      richContent: html
    }));
  };

  return (
    <RemirrorEditorProvider initialEditMode={true}>
      <div className="container mx-auto py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Remirror Editor Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <RemirrorEditorToolbar position="top" />
            
            <div className="mt-8 space-y-8">
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Editor</TabsTrigger>
                  <TabsTrigger value="inline">Inline Editors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="mt-4">
                  <h3 className="text-lg font-medium mb-4">Basic Editor</h3>
                  <RemirrorEditor
                    initialContent={content.richContent}
                    onChange={handleContentChange}
                    className="min-h-[300px]"
                  />
                </TabsContent>
                
                <TabsContent value="inline" className="mt-4">
                  <h3 className="text-lg font-medium mb-4">Inline Editors</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Inline Text Editor</h4>
                      <InlineTextEditor
                        value={content.title}
                        collection="examples"
                        itemId="example1"
                        field="title"
                        canEdit={true}
                        onSave={(value) => setContent(prev => ({ ...prev, title: value }))}
                      >
                        <h2 className="text-2xl font-bold">{content.title}</h2>
                      </InlineTextEditor>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Inline Rich Text Editor</h4>
                      <InlineRichTextEditor
                        value={content.richContent}
                        collection="examples"
                        itemId="example1"
                        field="richContent"
                        canEdit={true}
                        onSave={(value) => setContent(prev => ({ ...prev, richContent: value }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Content State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
              {JSON.stringify(content, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </RemirrorEditorProvider>
  );
};

export default RemirrorEditorExample;
