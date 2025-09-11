import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { DirectusNews } from '@/lib/directus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function NewsEditor() {
  const [newsItems, setNewsItems] = useState<DirectusNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<Partial<DirectusNews>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await DirectusService.getNews();
      setNewsItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentNews(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setCurrentNews(prev => ({ ...prev, status: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setCurrentNews({});
    setImageFile(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setCurrentNews({
      status: 'draft',
      published_date: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (news: DirectusNews) => {
    setCurrentNews({ 
      ...news,
      published_date: news.published_date ? news.published_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return currentNews.image || null;
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', imageFile);
      
      // Upload file to Directus assets
      const response = await fetch(`${import.meta.env.VITE_DIRECTUS_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.data.id;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentNews.title || !currentNews.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Upload image if selected
      if (imageFile) {
        const imageId = await uploadImage();
        if (imageId) {
          currentNews.image = imageId;
        }
      }

      // Ensure we have a slug
      if (!currentNews.slug && currentNews.title) {
        currentNews.slug = currentNews.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }

      if (isEditing && currentNews.id) {
        // Update existing news
        await DirectusService.updateCollectionItem('news', currentNews.id, currentNews as Record<string, unknown>);
        toast.success('News item updated successfully');
      } else {
        // Create new news item
        await DirectusService.createCollectionItem('news', currentNews as Record<string, unknown>);
        toast.success('News item created successfully');
      }
      
      setIsDialogOpen(false);
      fetchNews(); // Refresh the list
    } catch (err) {
      console.error('Error saving news item:', err);
      toast.error('Failed to save news item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    try {
      await DirectusService.deleteCollectionItem('news', id);
      toast.success('News item deleted successfully');
      fetchNews(); // Refresh the list
    } catch (err) {
      console.error('Error deleting news item:', err);
      toast.error('Failed to delete news item. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading news...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchNews}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>News Management</CardTitle>
          <Button onClick={openCreateDialog}>Add News Item</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No news items found</TableCell>
                </TableRow>
              ) : (
                newsItems.map((news) => (
                  <TableRow key={news.id}>
                    <TableCell>{news.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        news.status === 'published' ? 'bg-green-100 text-green-800' : 
                        news.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {news.status}
                      </span>
                    </TableCell>
                    <TableCell>{news.published_date ? new Date(news.published_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(news)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(news.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit News Item' : 'Add News Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={currentNews.title || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={currentNews.slug || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="auto-generated-if-empty"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status *
                </Label>
                <Select 
                  value={currentNews.status || 'draft'} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="published_date" className="text-right">
                  Published Date
                </Label>
                <Input
                  id="published_date"
                  name="published_date"
                  type="date"
                  value={currentNews.published_date || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="summary" className="text-right">
                  Summary
                </Label>
                <Input
                  id="summary"
                  name="summary"
                  value={currentNews.summary || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Content *
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={currentNews.content || ''}
                  onChange={handleInputChange}
                  className="col-span-3 min-h-[200px]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {currentNews.image && !imageFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Current image: {currentNews.image}</p>
                      <img 
                        src={DirectusService.getImageUrl(currentNews.image)} 
                        alt="Current" 
                        className="mt-2 max-h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewsEditor;
