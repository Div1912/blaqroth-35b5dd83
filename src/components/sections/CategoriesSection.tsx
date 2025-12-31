import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

export function CategoriesSection() {
  const [isPaused, setIsPaused] = useState(false);
  
  // Duplicate categories for seamless loop
  const duplicatedCategories = [...categories, ...categories, ...categories];

  return (
    <section className="section-padding relative z-10 overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
            Curated Selection
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wider">
            Shop by Category
          </h2>
        </motion.div>
      </div>

      {/* Scrolling Categories Marquee */}
      <div 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex gap-6"
          animate={{
            x: isPaused ? undefined : [0, -1600],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
        >
          {duplicatedCategories.map((category, index) => (
            <Link
              key={`${category.id}-${index}`}
              to={`/shop?category=${category.slug}`}
              className="group block flex-shrink-0"
            >
              <motion.div 
                className="glass-card overflow-hidden w-72 md:w-80"
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent z-10" />
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="font-display text-xl md:text-2xl tracking-wider group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-muted-foreground text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Reflection shadow */}
              <div className="mt-4 mx-auto w-3/4 h-4 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
