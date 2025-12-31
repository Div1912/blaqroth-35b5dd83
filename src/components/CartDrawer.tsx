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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="font-display text-2xl tracking-wider">Your Bag</h2>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-6">Your bag is empty</p>
                  <Button variant="glass-gold" onClick={closeCart} asChild>
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="flex gap-4 glass-panel p-4"
                  >
                    {/* Image */}
                    <div className="w-20 h-24 bg-secondary/20 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImage(item)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg truncate">{item.product.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.size} / {item.color}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {item.discountedPrice && item.discountedPrice < item.priceAtAdd ? (
                          <>
                            <p className="text-foreground">{formatPrice(item.discountedPrice)}</p>
                            <p className="text-muted-foreground text-sm line-through">{formatPrice(item.priceAtAdd)}</p>
                          </>
                        ) : (
                          <p className="text-foreground">{formatPrice(item.priceAtAdd)}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                          }
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                          }
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <Plus className="h-4 w-4" />
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-lg">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl">{formatPrice(total)}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Shipping and taxes calculated at checkout
                </p>
                <Button variant="hero" size="xl" className="w-full" asChild>
                  <Link to="/checkout" onClick={closeCart}>
                    Checkout
                  </Link>
                </Button>
                <Button variant="glass" size="lg" className="w-full" onClick={closeCart}>
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
