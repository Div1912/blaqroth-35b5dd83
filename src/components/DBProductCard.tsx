import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CouponBadge } from '@/components/CouponBadge';
import { formatPrice } from '@/lib/formatCurrency';
import { DBProduct, calculateDiscountedPrice } from '@/hooks/useProducts';
import { Coupon } from '@/hooks/useCoupons';

interface DBProductCardProps {
  product: DBProduct;
  offers: any[];
  coupons?: Coupon[];
  index?: number;
}

export function DBProductCard({ product, offers, coupons = [], index = 0 }: DBProductCardProps) {
  // Get primary image or first image
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const imageUrl = primaryImage?.url || '/placeholder.svg';
  
  // Get unique colors from variants
  const colors = [...new Set(product.product_variants?.map(v => v.color).filter(Boolean))] as string[];
  
  // Calculate total stock from variants
  const totalStock = product.product_variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0;
  const isOutOfStock = totalStock === 0;
  
  // Calculate price with offers
  const priceInfo = calculateDiscountedPrice(product.price, 0, offers, product.id);
  const hasDiscount = priceInfo.discount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`}>
        <div className="glass-card overflow-hidden hover-lift">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {priceInfo.offerTitle || 'Sale'}
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary">
                  Out of Stock
                </Badge>
              )}
              {coupons.length > 0 && (
                <CouponBadge coupons={coupons} />
              )}
            </div>

            {/* Quick Add Overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button variant="glass-gold" size="lg" disabled={isOutOfStock}>
                {isOutOfStock ? 'Out of Stock' : 'Quick View'}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 md:p-6">
            <h3 className="font-display text-lg md:text-xl mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-3">
              <span className="text-foreground font-medium">
                {formatPrice(priceInfo.finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-muted-foreground line-through text-sm">
                  {formatPrice(priceInfo.originalPrice)}
                </span>
              )}
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {colors.slice(0, 4).map((color) => (
                  <div
                    key={color}
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {colors.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{colors.length - 4}</span>
                )}
              </div>
            )}

            {/* Stock indicator */}
            {totalStock > 0 && totalStock <= 3 && (
              <p className="text-xs text-destructive mt-2">Only {totalStock} left!</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
