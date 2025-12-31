import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

export function CategoriesSection() {
  return (
    <section className="section-padding relative z-10">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={`/shop?category=${category.slug}`}
                className="group block"
              >
                <div className="glass-card overflow-hidden hover-lift">
                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-10" />
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="font-display text-xl md:text-2xl tracking-wider group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-muted-foreground text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
