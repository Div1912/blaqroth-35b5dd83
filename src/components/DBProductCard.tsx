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
  
  // Calculate available stock from variants (total_stock - reserved_stock)
  const availableStock = product.product_variants?.reduce((sum, v) => {
    return sum + ((v.total_stock || 0) - (v.reserved_stock || 0));
  }, 0) || 0;
  const isOutOfStock = availableStock === 0;
  
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
        <div className="bg-background border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
              {product.is_featured && (
                <Badge className="bg-foreground text-background text-[10px] sm:text-xs">
                  Featured
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs">
                  {priceInfo.offerTitle || 'Sale'}
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  Out of Stock
                </Badge>
              )}
              {coupons.length > 0 && (
                <CouponBadge coupons={coupons} />
              )}
            </div>

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button variant="editorial" size="sm" disabled={isOutOfStock} className="text-xs sm:text-sm">
                {isOutOfStock ? 'Out of Stock' : 'Quick View'}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 sm:p-4">
            {/* Category */}
            {product.category && (
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {product.category.name}
              </p>
            )}
            
            <h3 className="font-display text-sm sm:text-base mb-1.5 sm:mb-2 group-hover:text-muted-foreground transition-colors line-clamp-1">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-foreground font-medium text-sm sm:text-base">
                {formatPrice(priceInfo.finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-muted-foreground line-through text-xs sm:text-sm">
                  {formatPrice(priceInfo.originalPrice)}
                </span>
              )}
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {colors.slice(0, 4).map((color) => (
                  <div
                    key={color}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {colors.length > 4 && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground">+{colors.length - 4}</span>
                )}
              </div>
            )}

            {/* Stock indicator */}
            {availableStock > 0 && availableStock <= 3 && (
              <p className="text-[10px] sm:text-xs text-destructive mt-2">Only {availableStock} left!</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
