/**
 * Cart Drawer Component
 * Sliding panel that shows cart items
 */

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { items, itemCount, total, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Helper to get proper image URL (handles both full URLs and UUIDs)
  const getImageUrl = (image?: string): string => {
    if (!image) return '';
    // If it already starts with http, it's a full URL
    if (image.startsWith('http')) return image;
    // Otherwise, construct the URL from UUID
    return `${import.meta.env.VITE_DIRECTUS_URL}/assets/${image}`;
  };

  const handleCheckout = () => {
    setIsOpen(false); // Close the drawer
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-foreground">Carrinho de Compras</SheetTitle>
              <SheetDescription className="text-foreground/70">
                {itemCount === 0
                  ? 'O seu carrinho está vazio'
                  : `${itemCount} ${itemCount === 1 ? 'item' : 'itens'} no carrinho`}
              </SheetDescription>
            </div>
            {itemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Limpar carrinho?')) {
                    localStorage.removeItem('keyprog-cart');
                    window.location.reload();
                  }
                }}
                className="text-xs"
              >
                Limpar
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">O seu carrinho está vazio</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/loja')}
                >
                  Continuar a Comprar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-4 p-4 bg-muted/50 dark:bg-muted/20 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onLoad={() => {
                            console.log('✅ Cart image loaded successfully:', item.image);
                          }}
                          onError={(e) => {
                            console.error('❌ Cart item image failed to load:');
                            console.error('  Image value:', item.image);
                            console.error('  Constructed URL:', getImageUrl(item.image));
                            console.error('  Full item:', item);
                            // Replace with placeholder icon
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const iconDiv = document.createElement('div');
                              iconDiv.className = 'fallback-icon w-full h-full flex items-center justify-center text-muted-foreground';
                              iconDiv.innerHTML = '<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                              parent.appendChild(iconDiv);
                            }
                          }}
                        />
                      ) : (
                        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-foreground">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)}
                        </p>
                        {item.quantity > 1 && (
                          <>
                            <span className="text-xs text-muted-foreground">×</span>
                            <span className="text-xs text-muted-foreground">{item.quantity}</span>
                          </>
                        )}
                      </div>
                      <p className="text-primary font-bold mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {items.length > 0 && (
            <div className="flex-shrink-0 bg-background border-t">
              {/* Total Summary */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Envio</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-foreground pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/loja')}
                >
                  Continuar a Comprar
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
