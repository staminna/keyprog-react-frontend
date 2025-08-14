import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import type { DirectusServices } from '@/lib/directus';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, ShoppingCart, Heart, Share2, Euro, Truck, Shield, Clock } from 'lucide-react';

interface ProductDetailProps {
  slug?: string; // Optional prop to override URL slug
}

const ProductDetail = ({ slug: propSlug }: ProductDetailProps) => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = propSlug || urlSlug;
  
  const [product, setProduct] = useState<DirectusServices | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DirectusServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('No product slug provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const [productData, allProducts] = await Promise.all([
          DirectusService.getService(slug), // Using services collection for products
          DirectusService.getServices()
        ]);
        
        if (!productData) {
          setError('Product not found');
        } else {
          setProduct(productData);
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
  }, [slug]);

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
              {product.image ? (
                <img
                  src={DirectusService.getImageUrl(product.image)}
                  alt={product.title || 'Product Image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Thumbnail Images (placeholder for future multiple images) */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  className={`aspect-square w-20 bg-muted rounded border-2 ${
                    selectedImageIndex === index - 1 ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImageIndex(index - 1)}
                >
                  {product.image && index === 1 ? (
                    <img
                      src={DirectusService.getImageUrl(product.image)}
                      alt={`${product.title} ${index}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title & Category */}
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gradient-primary mb-2">
                {product.title}
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

            {/* Product Features */}
            {product.features && (
              <div>
                <h3 className="font-semibold mb-3">Características:</h3>
                <div className="space-y-2">
                  {Array.isArray(product.features) ? (
                    product.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm">
                      <div dangerouslySetInnerHTML={{ __html: product.features }} />
                    </div>
                  )}
                </div>
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
                  to={`/loja/${relatedProduct.slug}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted">
                      {relatedProduct.image ? (
                        <img
                          src={DirectusService.getImageUrl(relatedProduct.image)}
                          alt={relatedProduct.title || 'Product'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.title}
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
