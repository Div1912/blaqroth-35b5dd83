import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/formatCurrency';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal } = useCartStore();
  const total = getTotal();

  const getProductImage = (item: typeof items[0]) => {
    if (item.product.images && item.product.images.length > 0) {
      const primaryImage = item.product.images.find(img => img.is_primary);
      return primaryImage?.url || item.product.images[0].url;
    }
    return '/placeholder.svg';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Drawer - Full height on mobile, max-width on desktop */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="font-display text-xl sm:text-2xl tracking-wide">Your Bag</h2>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-6">Your bag is empty</p>
                  <Button variant="editorial" onClick={closeCart} asChild>
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border"
                  >
                    {/* Image */}
                    <div className="w-16 h-20 sm:w-20 sm:h-24 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImage(item)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm sm:text-base truncate">{item.product.name}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {item.size} / {item.color}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {item.discountedPrice && item.discountedPrice < item.priceAtAdd ? (
                          <>
                            <p className="text-foreground text-sm sm:text-base">{formatPrice(item.discountedPrice)}</p>
                            <p className="text-muted-foreground text-xs line-through">{formatPrice(item.priceAtAdd)}</p>
                          </>
                        ) : (
                          <p className="text-foreground text-sm sm:text-base">{formatPrice(item.priceAtAdd)}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                          }
                          className="p-1 hover:bg-secondary rounded transition-colors border border-border"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                          }
                          className="p-1 hover:bg-secondary rounded transition-colors border border-border"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id, item.size, item.color)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer - Sticky */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-border space-y-3 sm:space-y-4 bg-background">
                <div className="flex items-center justify-between text-base sm:text-lg">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-lg sm:text-xl">{formatPrice(total)}</span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Shipping and taxes calculated at checkout
                </p>
                <Button variant="editorial" size="lg" className="w-full" asChild>
                  <Link to="/checkout" onClick={closeCart}>
                    Checkout
                  </Link>
                </Button>
                <Button variant="editorial-outline" size="default" className="w-full" onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
