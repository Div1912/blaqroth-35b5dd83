import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { featuredProducts } from '@/data/products';

export function FeaturedSection() {
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
          {featuredProducts.slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
