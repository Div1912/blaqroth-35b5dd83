import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DBProductCard } from '@/components/DBProductCard';
import { useProducts, useActiveOffers, calculateDiscountedPrice } from '@/hooks/useProducts';

export function FeaturedSection() {
  const { data: products, isLoading } = useProducts();
  const { data: offers } = useActiveOffers();

  // Filter featured products
  const featuredProducts = products?.filter(p => p.is_featured).slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="section-padding relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary/20 rounded-lg mb-4" />
                <div className="h-4 bg-secondary/20 rounded w-3/4 mb-2" />
                <div className="h-4 bg-secondary/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
              Standout Pieces
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wider">
              Featured
            </h2>
          </div>
          <Button variant="minimal" className="group" asChild>
            <Link to="/shop">
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <DBProductCard 
              key={product.id} 
              product={product} 
              index={index}
              offers={offers || []}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
