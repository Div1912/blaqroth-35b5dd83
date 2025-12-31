import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { collections } from '@/data/products';

const Collections = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
              Seasonal Stories
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-wider">
              Collections
            </h1>
          </motion.div>

          {/* Collections */}
          <div className="space-y-24">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
              >
                <Link
                  to={`/shop?collection=${collection.slug}`}
                  className="group block"
                >
                  <div
                    className={`glass-card overflow-hidden hover-lift flex flex-col ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Visual */}
                    <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative overflow-hidden min-h-[300px]">
                      {collection.image ? (
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${collection.color}30, ${collection.color}10)`,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                        <span
                          className="font-display text-5xl md:text-7xl tracking-[0.2em] text-foreground opacity-80 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-lg"
                        >
                          {collection.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                      <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-6 group-hover:text-primary transition-colors">
                        {collection.name}
                      </h2>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                        {collection.description}
                      </p>
                      <div
                        className="h-1 w-20 rounded-full group-hover:w-32 transition-all duration-500"
                        style={{ backgroundColor: collection.color }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
