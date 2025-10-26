import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService, type Product } from '@/services/productService';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Euro, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';

const Loja = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await ProductService.getProducts({ status: 'published' }, 100);
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category?.toString() === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category?.toString()).filter(Boolean)))];

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    if (!product.price) {
      toast.error('Produto sem preço definido');
      return;
    }

    // Get the primary image URL if available
    const primaryImageId = ProductService.getPrimaryImage(product);
    const imageUrl = primaryImageId 
      ? DirectusService.getImageUrl(primaryImageId)
      : '';

    addItem({
      product_id: product.id.toString(),
      name: product.name || 'Produto sem nome',
      slug: product.id.toString(), // Use ID as slug since products don't have slug field
      price: product.price,
      image: imageUrl,
      description: product.description,
    });

    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div>
      <main className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <UniversalContentEditor
            collection="pages"
            itemId="loja"
            field="title"
            tag="h1"
            className="text-4xl font-bold text-gradient-primary mb-4"
            value="Loja Keyprog"
          />
          <UniversalContentEditor
            collection="pages"
            itemId="loja"
            field="description"
            tag="p"
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            value="Explore a nossa gama completa de emuladores, equipamentos, software e estabilizadores para eletrónica automóvel."
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Todos' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-square bg-muted relative overflow-hidden group">
                  <div className="relative w-full h-full">
                    {/* Main Image */}
                    {product.images && product.images.length > 0 ? (
                      <>
                        <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
                          <img
                            src={DirectusService.getImageUrl(product.images[0].directus_files_id.id)}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Second Image (shown on hover) */}
                        {product.images.length > 1 && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <img
                              src={DirectusService.getImageUrl(product.images[1].directus_files_id.id)}
                              alt={product.name || 'Product'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-16 w-16" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {product.category && (
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        {product.category}
                      </Badge>
                    )}
                    
                    {/* Image Counter Badge */}
                    {product.images && product.images.length > 1 && (
                      <Badge className="absolute top-2 right-2" variant="default">
                        {product.images.length} {product.images.length === 1 ? 'foto' : 'fotos'}
                      </Badge>
                    )}
                    
                    {/* Image Navigation Dots */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {product.images.map((_, index) => (
                          <span 
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === 0 ? 'bg-primary' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <CardHeader className="p-4">
                  <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="p-4 pt-0 space-y-3">
                  {product.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        IVA incl.
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/loja/${product.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de pesquisa.
            </p>
          </div>
        )}

        {/* Category Sections for SEO */}
        <div className="mt-16 space-y-12">
          <div id="emuladores" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">Emuladores ECU</h2>
            <p className="text-muted-foreground">
              Emuladores de alta qualidade para bypass de sistemas eletrónicos automóveis. 
              Compatíveis com a maioria das marcas e modelos.
            </p>
          </div>
          
          <div id="equipamentos" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">Equipamentos de Diagnóstico</h2>
            <p className="text-muted-foreground">
              Ferramentas profissionais de diagnóstico OBD2 e equipamentos especializados 
              para eletrónica automóvel.
            </p>
          </div>
          
          <div id="software" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">Software de Reprogramação</h2>
            <p className="text-muted-foreground">
              Software profissional para reprogramação de centralinas (ECU) com suporte 
              para centenas de modelos de veículos.
            </p>
          </div>
          
          <div id="estabilizadores" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">Estabilizadores de Tensão</h2>
            <p className="text-muted-foreground">
              Estabilizadores de tensão profissionais para proteção de equipamentos durante 
              intervenções em sistemas eletrónicos automóveis.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Loja;