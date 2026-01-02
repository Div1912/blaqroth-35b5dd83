import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatCurrency';
import { useProducts, useActiveOffers, calculateDiscountedPrice } from '@/hooks/useProducts';

export function NewArrivalsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products, isLoading } = useProducts();
  const { data: offers } = useActiveOffers();

  // Get newest products (sorted by created_at)
  const newArrivals = products?.slice(0, 8) || [];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="container-editorial">
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <div className="aspect-[3/4] bg-secondary animate-pulse mb-4" />
                <div className="h-4 bg-secondary animate-pulse w-3/4 mb-2" />
                <div className="h-4 bg-secondary animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (newArrivals.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-editorial">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="subheading mb-2">Just In</p>
            <h2 className="heading-lg">New Arrivals</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Product Rail */}
        <div className="relative group">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Products */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-snap-x pb-4"
          >
            {newArrivals.map((product, index) => {
              const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
              const imageUrl = primaryImage?.url || '/placeholder.svg';
              const priceInfo = calculateDiscountedPrice(product.price, 0, offers || [], product.id);
              const categoryName = product.category?.name || 'Clothing';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex-shrink-0 w-64 md:w-72 scroll-snap-item"
                >
                  <Link to={`/product/${product.slug}`} className="group/card block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-background mb-4">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{categoryName}</p>
                      <h3 className="font-display text-lg mb-1 group-hover/card:text-muted-foreground transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{formatPrice(priceInfo.finalPrice)}</span>
                        {priceInfo.discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(priceInfo.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Shop All */}
        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="editorial-outline" asChild>
            <Link to="/shop">View All</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
