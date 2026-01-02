import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Truck, RotateCcw, ShoppingBag, Zap, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useShippingConfig, getEstimatedDeliveryDate, getReturnPolicy, getReturnWindow } from '@/hooks/useShippingConfig';
import { formatPrice } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ProductQuickViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number | null;
    description?: string | null;
    fabric_type?: string | null;
    care_instructions?: string | null;
    product_images?: { url: string; is_primary: boolean }[];
    product_variants?: { 
      id: string; 
      size: string | null; 
      color: string | null; 
      stock_quantity: number | null;
      price_adjustment: number | null;
    }[];
    category?: { name: string } | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { data: shippingConfig } = useShippingConfig();

  // Get unique sizes and colors from variants
  const sizes = [...new Set(product?.product_variants?.map(v => v.size).filter(Boolean) || [])];
  const colors = [...new Set(product?.product_variants?.map(v => v.color).filter(Boolean) || [])];

  // Get selected variant
  const selectedVariant = product?.product_variants?.find(v => 
    (!sizes.length || v.size === selectedSize) && 
    (!colors.length || v.color === selectedColor)
  );

  // Stock check
  const inStock = selectedVariant ? (selectedVariant.stock_quantity || 0) > 0 : true;
  const stockQuantity = selectedVariant?.stock_quantity || 0;

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(sizes[0] || null);
      setSelectedColor(colors[0] || null);
      setQuantity(1);
      setSizeError(false);
    }
  }, [product?.id]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error('Please select a size');
      return;
    }

    if (!product) return;

    const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
    
    const dbProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price,
      description: product.description,
      images: product.product_images?.map(img => ({ id: img.url, url: img.url, is_primary: img.is_primary })) || [],
    };

    addItem(
      dbProduct,
      selectedVariant?.id || null,
      selectedSize || '',
      selectedColor || '',
      finalPrice,
      undefined,
      quantity
    );

    toast.success('Added to cart');
    onClose();
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout after adding to cart
    window.location.href = '/checkout';
  };

  if (!product) return null;

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const finalPrice = product.price + (selectedVariant?.price_adjustment || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
          />
          
          {/* Modal - Full screen on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-background md:rounded-lg md:max-w-4xl md:w-[90vw] md:max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6">
                {/* Image */}
                <div className="aspect-square md:aspect-auto md:h-full bg-secondary">
                  <img
                    src={primaryImage?.url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:py-8 md:pr-6 flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    {product.category && (
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        {product.category.name}
                      </p>
                    )}
                    <h2 className="font-display text-xl sm:text-2xl mb-2">{product.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium">{formatPrice(finalPrice)}</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Size Selection */}
                  {sizes.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Size</span>
                        {sizeError && (
                          <span className="text-xs text-red-500">Please select a size</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setSelectedSize(size);
                              setSizeError(false);
                            }}
                            className={`px-4 py-2 border rounded text-sm transition-colors ${
                              selectedSize === size
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border hover:border-foreground'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {colors.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium block mb-2">Color: {selectedColor}</span>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 border rounded text-sm transition-colors ${
                              selectedColor === color
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border hover:border-foreground'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-4">
                    <span className="text-sm font-medium block mb-2">Quantity</span>
                    <div className="flex items-center border border-border rounded w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(stockQuantity || 10, quantity + 1))}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Status */}
                  {selectedVariant && (
                    <div className="mb-4">
                      {inStock ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <Check className="h-4 w-4" />
                          <span>In Stock ({stockQuantity} available)</span>
                        </div>
                      ) : (
                        <div className="text-red-500 text-sm">Out of Stock</div>
                      )}
                    </div>
                  )}

                  {/* Delivery & Return Info */}
                  <div className="space-y-3 mb-6 p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Estimated Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          {getEstimatedDeliveryDate(shippingConfig)} (Standard)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{getReturnWindow(shippingConfig)} Days Easy Return</p>
                        <p className="text-xs text-muted-foreground">
                          {getReturnPolicy(shippingConfig)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mt-auto">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className="w-full"
                      variant="editorial"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      disabled={!inStock}
                      className="w-full"
                      variant="editorial-outline"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>

                  {/* Accordions */}
                  <Accordion type="single" collapsible className="mt-6">
                    {product.description && (
                      <AccordionItem value="description">
                        <AccordionTrigger className="text-sm">Description</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {product.description}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {product.fabric_type && (
                      <AccordionItem value="fabric">
                        <AccordionTrigger className="text-sm">Fabric & Material</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {product.fabric_type}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {product.care_instructions && (
                      <AccordionItem value="care">
                        <AccordionTrigger className="text-sm">Care Instructions</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {product.care_instructions}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>

                  {/* View Full Details */}
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="text-center text-sm underline mt-4 text-muted-foreground hover:text-foreground"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
