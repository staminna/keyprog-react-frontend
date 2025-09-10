import React, { useState, useEffect } from 'react';
import { ProductService, Product, ProductCategory } from '@/services/productService';
import { useProductUpdates } from '@/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, X, Package, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  slug: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  inventory_count: number;
  sku: string;
  tags: string[];
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    slug: '',
    category: '',
    status: 'draft',
    featured: false,
    inventory_count: 0,
    sku: '',
    tags: []
  });

  // Real-time updates
  useProductUpdates((event) => {
    switch (event.type) {
      case 'create':
        setProducts(prev => [event.item, ...prev]);
        toast.success('Novo produto adicionado');
        break;
      case 'update':
        setProducts(prev => prev.map(p => p.id === event.item.id ? event.item : p));
        toast.info('Produto atualizado');
        break;
      case 'delete':
        setProducts(prev => prev.filter(p => p.id !== event.key));
        toast.info('Produto removido');
        break;
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getProducts({}, 100),
        ProductService.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleFormChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name
      if (field === 'name' && typeof value === 'string' && value) {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, formData);
        toast.success('Produto atualizado com sucesso');
      } else {
        await ProductService.createProduct(formData);
        toast.success('Produto criado com sucesso');
      }
      
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      slug: product.slug,
      category: product.category || '',
      status: product.status,
      featured: product.featured || false,
      inventory_count: product.inventory_count || 0,
      sku: product.sku || '',
      tags: product.tags || []
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      price: 0,
      slug: '',
      category: '',
      status: 'draft',
      featured: false,
      inventory_count: 0,
      sku: '',
      tags: []
    });
  };

  const getStatusBadge = (status: Product['status']) => {
    const variants = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status === 'draft' ? 'Rascunho' : status === 'published' ? 'Publicado' : 'Arquivado'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
          <p className="text-gray-600">Gerir produtos da loja</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Product Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</span>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleFormChange('sku', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Preço (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Stock</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={formData.inventory_count}
                        onChange={(e) => handleFormChange('inventory_count', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleFormChange('slug', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleFormChange('featured', checked)}
                    />
                    <Label htmlFor="featured">Produto em destaque</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {editingProduct ? 'Atualizar' : 'Criar'} Produto
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Products List */}
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {getStatusBadge(product.status)}
                        {product.featured && (
                          <Badge className="bg-blue-100 text-blue-800">Destaque</Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>€{product.price}</span>
                        {product.sku && <span>SKU: {product.sku}</span>}
                        <span>Stock: {product.inventory_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/loja/produtos/${product.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
