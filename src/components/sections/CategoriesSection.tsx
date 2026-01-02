import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/data/products';

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-editorial">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="subheading mb-2">Browse By</p>
          <h2 className="heading-lg">Shop by Category</h2>
        </div>

        {/* Categories Grid/Scroll */}
        <div className="relative group">
          {/* Scroll Buttons (for mobile) */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background border border-border hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background border border-border hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Categories */}
          <div
            ref={scrollRef}
            className="grid grid-cols-2 md:flex md:justify-center gap-4 md:gap-8 md:overflow-x-auto md:scrollbar-hide"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="md:flex-shrink-0"
              >
                <Link to={`/shop?category=${category.slug}`} className="group/cat block">
                  <div className="relative aspect-[3/4] md:aspect-square md:w-60 overflow-hidden bg-secondary mb-3">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/cat:scale-105"
                    />
                  </div>
                  <h3 className="font-display text-lg text-center group-hover/cat:text-muted-foreground transition-colors">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
