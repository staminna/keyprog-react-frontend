/**
 * Add to Cart Button Component
 * Reusable button for adding products to cart
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity?: number;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  className?: string;
}

export const AddToCartButton = ({ 
  product, 
  quantity = 1,
  size = 'default',
  variant = 'default',
  className 
}: AddToCartButtonProps) => {
  const { addItem, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(
      {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        description: product.description,
      },
      quantity
    );

    // Show success feedback
    setJustAdded(true);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `Quantidade: ${quantity}`,
    });

    // Reset button after 2 seconds
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  return (
    <Button
      size={size}
      variant={justAdded ? 'outline' : variant}
      onClick={handleAddToCart}
      className={className}
      disabled={justAdded}
    >
      {justAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Adicionado
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isInCart(product.id) ? 'Adicionar Mais' : 'Adicionar ao Carrinho'}
        </>
      )}
    </Button>
  );
};
