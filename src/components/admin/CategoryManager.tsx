import React, { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { DirectusCategories } from '@/lib/directus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CategoryManager() {
  const [categories, setCategories] = useState<DirectusCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<DirectusCategories>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await DirectusService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setCurrentCategory({});
    setImageFile(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: DirectusCategories) => {
    setCurrentCategory({ ...category });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return currentCategory.image || null;
    
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
      if (!currentCategory.title) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Upload image if selected
      if (imageFile) {
        const imageId = await uploadImage();
        if (imageId) {
          currentCategory.image = imageId;
        }
      }

      // Ensure we have a slug
      if (!currentCategory.slug && currentCategory.title) {
        currentCategory.slug = currentCategory.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }

      if (isEditing && currentCategory.id) {
        // Update existing category
        await DirectusService.updateCollectionItem('categories', currentCategory.id, currentCategory as Record<string, unknown>);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await DirectusService.createCollectionItem('categories', currentCategory as Record<string, unknown>);
        toast.success('Category created successfully');
      }
      
      setIsDialogOpen(false);
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error('Failed to save category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await DirectusService.deleteCollectionItem('categories', id);
      toast.success('Category deleted successfully');
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchCategories}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Category Management</CardTitle>
          <Button onClick={openCreateDialog}>Add Category</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No categories found</TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.title}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                      {category.image ? (
                        <img 
                          src={DirectusService.getImageUrl(category.image)} 
                          alt={category.title} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        'No image'
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
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
                  value={currentCategory.title || ''}
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
                  value={currentCategory.slug || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="auto-generated-if-empty"
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
                  {currentCategory.image && !imageFile && (
                    <div className="mt-2">
                      <img 
                        src={DirectusService.getImageUrl(currentCategory.image)} 
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

export default CategoryManager;
