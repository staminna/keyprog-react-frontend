import React, { useState } from 'react';
import { usePage } from '@/hooks/usePage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import PageSection from '@/components/editable/PageSection';

interface PageManagerProps {
  slug?: string;
  id?: string | number;
  readOnly?: boolean;
  className?: string;
}

/**
 * Component for displaying and editing page content
 * Provides bidirectional synchronization with Directus
 */
export const PageManager: React.FC<PageManagerProps> = ({
  slug,
  id,
  readOnly = false,
  className = ''
}) => {
  const { page, isLoading, error, refresh, updatePage, isSyncing } = usePage({
    slug,
    id,
    autoSync: true,
    syncInterval: 60000 // 1 minute
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: {}
  });
  
  // Start editing with current data
  const handleEdit = () => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || {}
      });
      setIsEditing(true);
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle content updates
  const handleContentUpdate = (newContent: Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };
  
  // Save changes to Directus
  const handleSave = async () => {
    const success = await updatePage(formData);
    if (success) {
      setIsEditing(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading page content...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error loading page: {error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={refresh}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!page) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
        <p>Page not found</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={refresh}
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  // View mode
  if (!isEditing || readOnly) {
    return (
      <div className={`bg-white p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">
            <PageSection
              id={page.id.toString()}
              collection="pages"
              field="title"
              value={page.title}
              tag="h1"
              className="text-3xl font-semibold"
            />
          </h1>
          {!readOnly && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Sync
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleEdit}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          {/* Render page content based on content blocks */}
          {Array.isArray(page.content) && page.content.map((block, index) => (
            <PageSection
              key={`${page.id}-block-${index}`}
              id={page.id.toString()}
              collection="pages"
              field={`content[${index}]`}
              value={JSON.stringify(block)}
              className="mb-4"
            />
          ))}
          
          {/* If content is not an array, render as a single section */}
          {!Array.isArray(page.content) && (
            <PageSection
              id={page.id.toString()}
              collection="pages"
              field="content"
              value={typeof page.content === 'string' ? page.content : JSON.stringify(page.content)}
              className="prose max-w-none"
            />
          )}
        </div>
      </div>
    );
  }
  
  // Edit mode - simplified for this example
  // In a real implementation, you would use a more sophisticated editor for content blocks
  return (
    <div className={`bg-white p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Edit Page</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-500">Title</label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="text-sm font-medium text-gray-500">Slug</label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Content</label>
          <div className="mt-1 p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">
              Content editing is handled through the hover-based editing interface.
              Exit edit mode and use the hover editing feature to modify content blocks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageManager;
