import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Heart, ChevronLeft, ChevronRight, Loader2, Ticket, Truck, RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductReviews } from '@/components/ProductReviews';
import { useProduct, useActiveOffers, calculateDiscountedPrice } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCoupons } from '@/hooks/useCoupons';
import { useShippingConfig, getEstimatedDeliveryDate, getReturnWindow } from '@/hooks/useShippingConfig';
import { formatPrice } from '@/lib/formatCurrency';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: offers } = useActiveOffers();
  const { data: activeCoupons } = useActiveCoupons();
  const { data: shippingConfig } = useShippingConfig();
  const { addItem, openCart } = useCartStore();
  const { user } = useAuth();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  
  const isInWishlist = product ? wishlistItems.includes(product.id) : false;

  const hasColorOptions = useMemo(() => {
    return !!product?.product_variants?.some((v) => !!v.color);
  }, [product]);

  const hasSizeOptions = useMemo(() => {
    return !!product?.product_variants?.some((v) => !!v.size);
  }, [product]);

  // Get unique colors and sizes from variants
  const colors = useMemo(() => {
    if (!product?.product_variants) return [];
    if (!hasColorOptions) return ['Default'];
    return [...new Set(product.product_variants.map((v) => v.color).filter(Boolean))] as string[];
  }, [product, hasColorOptions]);

  const sizes = useMemo(() => {
    if (!product?.product_variants) return [];
    if (!hasSizeOptions) return ['One Size'];
    return [...new Set(product.product_variants.map((v) => v.size).filter(Boolean))] as string[];
  }, [product, hasSizeOptions]);

  // Get current variant based on selection
  const currentVariant = useMemo(() => {
    if (!product?.product_variants) return null;

    return (
      product.product_variants.find((v) => {
        const colorOk = hasColorOptions ? v.color === selectedColor : !v.color;
        const sizeOk = hasSizeOptions ? v.size === selectedSize : !v.size;
        return colorOk && sizeOk;
      }) || null
    );
  }, [product, selectedColor, selectedSize, hasColorOptions, hasSizeOptions]);

  // Get available stock for current variant (total_stock - reserved_stock)
  const availableStock = currentVariant 
    ? (currentVariant.total_stock || 0) - (currentVariant.reserved_stock || 0)
    : 0;

  // Check if size is available for selected color
  const isSizeAvailable = (size: string) => {
    if (!product?.product_variants) return false;

    const variant = product.product_variants.find((v) => {
      const colorOk = hasColorOptions ? v.color === selectedColor : !v.color;
      const sizeOk = hasSizeOptions ? v.size === size : !v.size;
      return colorOk && sizeOk;
    });

    if (!variant) return false;
    const variantAvailableStock = (variant.total_stock || 0) - (variant.reserved_stock || 0);
    return variantAvailableStock > 0;
  };

  // Get images - sorted by display_order
  const images = useMemo(() => {
    if (!product?.product_images || product.product_images.length === 0) return [];
    return [...product.product_images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [product]);

  // Calculate price with offers
  const priceInfo = useMemo(() => {
    if (!product) return { finalPrice: 0, originalPrice: 0, discount: 0 };
    const adjustment = currentVariant?.price_adjustment || 0;
    return calculateDiscountedPrice(product.price, adjustment, offers || [], product.id, currentVariant?.id);
  }, [product, currentVariant, offers]);

  // Set default selections when product loads
  useEffect(() => {
    if (!product || colors.length === 0) return;
    if (!selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [product, colors, selectedColor]);

  useEffect(() => {
    if (!product || sizes.length === 0) return;
    if (hasColorOptions && !selectedColor) return;

    const availableSize = sizes.find((s) => isSizeAvailable(s));
    setSelectedSize(availableSize || sizes[0]);
  }, [product, selectedColor, sizes, hasColorOptions]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mb-4">Product Not Found</h1>
          <Button variant="editorial" asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select a size and color');
      return;
    }

    if (!currentVariant || availableStock === 0) {
      toast.error('This variant is out of stock');
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: priceInfo.originalPrice,
      compare_at_price: product.compare_at_price,
      description: product.description,
      images: images.map(img => ({ id: img.id, url: img.url, is_primary: img.is_primary })),
    };

    addItem(
      cartProduct, 
      currentVariant.id, 
      selectedSize, 
      selectedColor, 
      priceInfo.originalPrice, 
      priceInfo.discount > 0 ? priceInfo.finalPrice : undefined, 
      quantity
    );
    toast.success(`${product.name} added to bag`);
    openCart();
  };
  
  const handleWishlist = () => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
        <div className="container-editorial px-4 sm:px-6">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <Link
              to="/shop"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20">
            {/* Images with Slider */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-[3/4] overflow-hidden relative group bg-secondary rounded-lg">
                {images.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={images[currentImageIndex]?.url}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-border"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-border"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full border border-border">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Badges */}
              <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
                {product.is_featured && (
                  <Badge className="bg-foreground text-background text-xs">Featured</Badge>
                )}
                {priceInfo.discount > 0 && (
                  <Badge variant="destructive" className="text-xs">{priceInfo.offerTitle || 'Sale'}</Badge>
                )}
                {product.category && (
                  <Badge variant="secondary" className="text-xs">{product.category.name}</Badge>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide mb-3 sm:mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                <span className="font-display text-xl sm:text-2xl md:text-3xl">
                  {formatPrice(priceInfo.finalPrice)}
                </span>
                {priceInfo.discount > 0 && (
                  <>
                    <span className="text-muted-foreground line-through text-base sm:text-lg md:text-xl">
                      {formatPrice(priceInfo.originalPrice)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      Save {formatPrice(priceInfo.discount)}
                    </Badge>
                  </>
                )}
              </div>

              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                {product.description}
              </p>

              {/* Color Selection */}
              {hasColorOptions && colors.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <label className="text-xs tracking-widest uppercase mb-2 sm:mb-3 block">
                    Color: <span className="text-foreground font-medium">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-foreground scale-110'
                            : 'border-border hover:border-foreground/50'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {hasSizeOptions && sizes.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <label className="text-xs tracking-widest uppercase mb-2 sm:mb-3 block">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const available = isSizeAvailable(size);
                      return (
                        <button
                          key={size}
                          onClick={() => available && setSelectedSize(size)}
                          disabled={!available}
                          className={`h-10 sm:h-12 min-w-10 sm:min-w-12 px-3 sm:px-4 border rounded transition-all text-sm ${
                            selectedSize === size
                              ? 'border-foreground bg-foreground text-background'
                              : available
                              ? 'border-border hover:border-foreground'
                              : 'border-border/50 text-muted-foreground/50 cursor-not-allowed line-through'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 sm:mb-8">
                <label className="text-xs tracking-widest uppercase mb-2 sm:mb-3 block">
                  Quantity {availableStock > 0 && availableStock <= 5 && (
                    <span className="text-destructive">({availableStock} left)</span>
                  )}
                </label>
                <div className="flex items-center gap-3 sm:gap-4 border border-border rounded w-fit px-3 sm:px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    disabled={quantity >= availableStock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Coupon Code Display */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className={`h-4 w-4 sm:h-5 sm:w-5 ${activeCoupons && activeCoupons.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={`font-medium text-sm ${activeCoupons && activeCoupons.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {activeCoupons && activeCoupons.length > 0 ? 'Save More!' : 'Offers'}
                  </span>
                </div>
                {activeCoupons && activeCoupons.length > 0 ? (
                  <div className="space-y-2">
                    {activeCoupons.slice(0, 2).map((coupon) => (
                      <div key={coupon.id} className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm text-muted-foreground">Use</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            toast.success(`Copied "${coupon.code}" to clipboard!`);
                          }}
                          className="px-2 py-1 bg-foreground/10 text-foreground font-mono font-bold rounded text-xs hover:bg-foreground/20 transition-colors cursor-pointer flex items-center gap-1"
                          title="Click to copy"
                        >
                          {coupon.code}
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <span className="text-xs sm:text-sm text-muted-foreground">during checkout</span>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}% OFF` 
                            : `${formatPrice(coupon.discount_value)} OFF`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">No offers available right now</p>
                )}
              </div>

              {/* Actions - Sticky on mobile */}
              <div className="flex gap-3 sm:gap-4 mt-auto sticky bottom-4 lg:static bg-background lg:bg-transparent py-3 lg:py-0 -mx-4 px-4 lg:mx-0 lg:px-0 border-t lg:border-t-0 border-border">
                <Button
                  variant="editorial"
                  size="lg"
                  className="flex-1 h-12 sm:h-14 text-sm sm:text-base"
                  onClick={handleAddToCart}
                  disabled={!currentVariant || availableStock === 0}
                >
                  {availableStock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </Button>
                <Button 
                  variant="editorial-outline"
                  size="lg"
                  onClick={handleWishlist}
                  className={`h-12 sm:h-14 px-4 ${isInWishlist ? 'text-red-500 border-red-500' : ''}`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Delivery & Returns Info */}
              <div className="mt-6 sm:mt-8 space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-medium">Estimated Delivery:</span>{' '}
                    <span className="text-muted-foreground">{getEstimatedDeliveryDate(shippingConfig)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="font-medium">Easy Returns:</span>{' '}
                    <span className="text-muted-foreground">{getReturnWindow(shippingConfig)} days return policy</span>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              {availableStock > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                  ✓ In stock, ready to ship
                </p>
              )}
            </motion.div>
          </div>

          {/* Product Reviews */}
          <ProductReviews productId={product.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
