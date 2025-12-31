import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatCurrency';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="glass-card overflow-hidden hover-lift">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs tracking-widest uppercase">
                  New
                </span>
              )}
              {product.originalPrice && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs tracking-widest uppercase">
                  Sale
                </span>
              )}
            </div>

            {/* Quick Add Overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button variant="glass-gold" size="lg">
                Quick View
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
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground line-through text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2 mt-3">
              {product.colors.map((color) => (
                <div
                  key={color.name}
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
