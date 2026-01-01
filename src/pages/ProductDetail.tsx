import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
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
import { formatPrice } from '@/lib/formatCurrency';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: offers } = useActiveOffers();
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

  // Get available stock for current variant
  const availableStock = currentVariant?.stock_quantity || 0;

  // Check if size is available for selected color (or size-only products)
  const isSizeAvailable = (size: string) => {
    if (!product?.product_variants) return false;

    const variant = product.product_variants.find((v) => {
      const colorOk = hasColorOptions ? v.color === selectedColor : !v.color;
      const sizeOk = hasSizeOptions ? v.size === size : !v.size;
      return colorOk && sizeOk;
    });

    return !!variant && (variant.stock_quantity || 0) > 0;
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const raw = window.scrollY / scrollHeight;
      const progress = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    // Find first available size for this selection
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
          <Button variant="glass-gold" asChild>
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

    // Create a product object for cart with images
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
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              to="/shop"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Images with Slider */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="glass-card aspect-[3/4] overflow-hidden relative group">
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
                  <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass-panel opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 glass-panel opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-3 py-1 text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-24 rounded overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
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
              <div className="flex gap-2 mb-4">
                {product.is_featured && (
                  <Badge>Featured</Badge>
                )}
                {priceInfo.discount > 0 && (
                  <Badge variant="destructive">{priceInfo.offerTitle || 'Sale'}</Badge>
                )}
                {product.category && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-display text-3xl">
                  {formatPrice(priceInfo.finalPrice)}
                </span>
                {priceInfo.discount > 0 && (
                  <>
                    <span className="text-muted-foreground line-through text-xl">
                      {formatPrice(priceInfo.originalPrice)}
                    </span>
                    <Badge variant="destructive">
                      Save {formatPrice(priceInfo.discount)}
                    </Badge>
                  </>
                )}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Color Selection */}
              {hasColorOptions && colors.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm tracking-widest uppercase mb-3 block">
                    Color: <span className="text-primary">{selectedColor}</span>
                  </label>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-primary scale-110'
                            : 'border-white/20 hover:border-white/40'
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
                <div className="mb-8">
                  <label className="text-sm tracking-widest uppercase mb-3 block">
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
                          className={`h-12 min-w-12 px-4 border rounded transition-all ${
                            selectedSize === size
                              ? 'border-primary bg-primary/10 text-primary'
                              : available
                              ? 'border-white/20 hover:border-white/40'
                              : 'border-white/10 text-muted-foreground/50 cursor-not-allowed line-through'
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
              <div className="mb-8">
                <label className="text-sm tracking-widest uppercase mb-3 block">
                  Quantity {availableStock > 0 && availableStock <= 5 && (
                    <span className="text-destructive">({availableStock} left)</span>
                  )}
                </label>
                <div className="flex items-center gap-4 glass-panel w-fit px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white/5 rounded transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="p-2 hover:bg-white/5 rounded transition-colors"
                    disabled={quantity >= availableStock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-auto">
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!currentVariant || availableStock === 0}
                >
                  {availableStock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </Button>
                <Button 
                  variant="glass" 
                  size="xl"
                  onClick={handleWishlist}
                  className={isInWishlist ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Stock Status */}
              {availableStock > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
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
