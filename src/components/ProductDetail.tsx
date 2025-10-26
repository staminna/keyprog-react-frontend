import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductService, type Product } from '@/services/productService';
import { DirectusService } from '@/services/directusService';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, ShoppingCart, Heart, Share2, Euro, Truck, Shield, Clock } from 'lucide-react';

interface ProductDetailProps {
  id?: string; // Optional prop to override URL id
}

const ProductDetail = ({ id: propId }: ProductDetailProps) => {
  const { id: urlId } = useParams<{ id: string }>();
  const id = propId || urlId;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
          setError('Invalid product ID');
          setIsLoading(false);
          return;
        }
        
        const [productData, allProducts] = await Promise.all([
          ProductService.getProduct(productId),
          ProductService.getProducts({ status: 'published' }, 100)
        ]);
        
        if (!productData) {
          setError('Product not found');
        } else {
          setProduct(productData);
          // Get all image URLs
          setImageUrls(ProductService.getProductImageUrls(productData));
          // Get related products (exclude current product)
          setRelatedProducts(
            allProducts
              .filter(p => p.id !== productData.id && p.category === productData.category)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-20 w-20" />
                <Skeleton className="h-20 w-20" />
                <Skeleton className="h-20 w-20" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/loja" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar à Loja
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/loja" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar à Loja
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-muted-foreground mb-4">
              Produto Não Encontrado
            </h1>
            <p className="text-muted-foreground">
              O produto solicitado não foi encontrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render product details
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <Link to="/loja" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar à Loja
        </Link>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Image Gallery Thumbnails */}
            {imageUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    className={`aspect-square w-20 bg-muted rounded border-2 flex-shrink-0 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Image Counter */}
            {imageUrls.length > 1 && (
              <div className="text-center text-sm text-muted-foreground">
                Imagem {selectedImageIndex + 1} de {imageUrls.length}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title & Category */}
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-2">
                  Category {product.category}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gradient-primary mb-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            {product.price && (
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="outline">IVA incluído</Badge>
              </div>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Stock Information */}
            {product.stock !== undefined && (
              <div>
                <h3 className="font-semibold mb-3">Disponibilidade:</h3>
                <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                  {product.stock > 0 ? `${product.stock} em stock` : 'Esgotado'}
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button size="lg" className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/contactos">
                  Pedir Orçamento Personalizado
                </Link>
              </Button>
            </div>

            {/* Product Info Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center p-3">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Envio Grátis</p>
                <p className="text-xs text-muted-foreground">Acima de 50€</p>
              </Card>
              <Card className="text-center p-3">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Garantia</p>
                <p className="text-xs text-muted-foreground">2 Anos</p>
              </Card>
              <Card className="text-center p-3">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Suporte</p>
                <p className="text-xs text-muted-foreground">24/7</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/loja/${relatedProduct.id}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      {(() => {
                        const primaryImage = ProductService.getPrimaryImage(relatedProduct);
                        return primaryImage ? (
                          <img
                            src={DirectusService.getImageUrl(primaryImage)}
                            alt={relatedProduct.name || 'Product'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12" />
                          </div>
                        );
                      })()}
                      {relatedProduct.images && relatedProduct.images.length > 1 && (
                        <Badge className="absolute top-2 right-2 text-xs">
                          {relatedProduct.images.length}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </CardTitle>
                      {relatedProduct.price && (
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(relatedProduct.price)}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
