import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { DirectusSubMenuContent } from '@/lib/directus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function SubMenuContentEditor() {
  const [subMenuItems, setSubMenuItems] = useState<DirectusSubMenuContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<DirectusSubMenuContent>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch submenu content on component mount
  useEffect(() => {
    fetchSubMenuContent();
  }, []);

  const fetchSubMenuContent = async () => {
    try {
      setLoading(true);
      // Fetch all submenu content from all categories
      const servicos = await DirectusService.getSubMenuContentByCategory('servicos');
      const loja = await DirectusService.getSubMenuContentByCategory('loja');
      const suporte = await DirectusService.getSubMenuContentByCategory('suporte');
      
      const allItems = [...servicos, ...loja, ...suporte];
      setSubMenuItems(allItems);
      setError(null);
    } catch (err) {
      setError('Failed to load submenu content. Please try again.');
      console.error('Error fetching submenu content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setCurrentItem(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }));
  };

  const handleCategoryChange = (value: string) => {
    setCurrentItem(prev => ({ ...prev, category: value as 'loja' | 'servicos' | 'suporte' }));
  };

  const handleFilterCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setCurrentItem({
      status: 'draft',
      category: 'servicos',
      sort: 0
    });
    setImageFile(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: DirectusSubMenuContent) => {
    setCurrentItem({ ...item });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return currentItem.featured_image || null;
    
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
      if (!currentItem.title || !currentItem.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Upload image if selected
      if (imageFile) {
        const imageId = await uploadImage();
        if (imageId) {
          currentItem.featured_image = imageId;
        }
      }

      // Ensure we have a slug
      if (!currentItem.slug && currentItem.title) {
        currentItem.slug = currentItem.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }

      if (isEditing && currentItem.id) {
        // Update existing item
        await DirectusService.updateCollectionItem('sub_menu_content', currentItem.id, currentItem as Record<string, unknown>);
        toast.success('Submenu content updated successfully');
      } else {
        // Create new item
        await DirectusService.createCollectionItem('sub_menu_content', currentItem as Record<string, unknown>);
        toast.success('Submenu content created successfully');
      }
      
      setIsDialogOpen(false);
      fetchSubMenuContent(); // Refresh the list
    } catch (err) {
      console.error('Error saving submenu content:', err);
      toast.error('Failed to save submenu content. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submenu content?')) {
      return;
    }

    try {
      await DirectusService.deleteCollectionItem('sub_menu_content', id);
      toast.success('Submenu content deleted successfully');
      fetchSubMenuContent(); // Refresh the list
    } catch (err) {
      console.error('Error deleting submenu content:', err);
      toast.error('Failed to delete submenu content. Please try again.');
    }
  };

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? subMenuItems 
    : subMenuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return <div className="flex justify-center p-8">Loading submenu content...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchSubMenuContent}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Submenu Content Management</CardTitle>
          <div className="flex gap-4">
            <Select 
              value={selectedCategory} 
              onValueChange={handleFilterCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="loja">Loja</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreateDialog}>Add Content</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No submenu content found</TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.category === 'servicos' ? 'bg-blue-100 text-blue-800' : 
                        item.category === 'loja' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'published' ? 'bg-green-100 text-green-800' : 
                        item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.sort || 0}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
            <DialogTitle>{isEditing ? 'Edit Submenu Content' : 'Add Submenu Content'}</DialogTitle>
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
                  value={currentItem.title || ''}
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
                  value={currentItem.slug || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="auto-generated-if-empty"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select 
                  value={currentItem.category || 'servicos'} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="loja">Loja</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status *
                </Label>
                <Select 
                  value={currentItem.status || 'draft'} 
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
                <Label htmlFor="sort" className="text-right">
                  Sort Order
                </Label>
                <Input
                  id="sort"
                  name="sort"
                  type="number"
                  value={currentItem.sort?.toString() || '0'}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={currentItem.description || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Content
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={currentItem.content || ''}
                  onChange={handleInputChange}
                  className="col-span-3 min-h-[150px]"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured_image" className="text-right">
                  Featured Image
                </Label>
                <div className="col-span-3">
                  <Input
                    id="featured_image"
                    name="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {currentItem.featured_image && !imageFile && (
                    <div className="mt-2">
                      <img 
                        src={DirectusService.getImageUrl(currentItem.featured_image)} 
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

export default SubMenuContentEditor;
