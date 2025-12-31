import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { collections, products } from '@/data/products';

const Collections = () => {
  const navigate = useNavigate();
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

  // Get product count for each collection
  const getProductCount = (collectionSlug: string) => {
    return products.filter(p => p.collection === collectionSlug).length;
  };

  // Get featured products for each collection
  const getCollectionProducts = (collectionSlug: string) => {
    return products.filter(p => p.collection === collectionSlug).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          </motion.div>

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
          <div className="space-y-32">
            {collections.map((collection, index) => {
              const collectionProducts = getCollectionProducts(collection.slug);
              const productCount = getProductCount(collection.slug);

              return (
                <motion.section
                  key={collection.id}
                  id={collection.slug}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8 }}
                  className="scroll-mt-32"
                >
                  {/* Collection Header */}
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 mb-12`}>
                    {/* Collection Image */}
                    <Link
                      to={`/shop?collection=${collection.slug}`}
                      className="w-full md:w-1/2 aspect-[4/3] relative overflow-hidden rounded-lg group"
                    >
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
                    </Link>

                    {/* Collection Info */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                      <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-6">
                        {collection.name}
                      </h2>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        {collection.description}
                      </p>
                      <p className="text-sm text-muted-foreground mb-8">
                        {productCount} {productCount === 1 ? 'product' : 'products'} in this collection
                      </p>
                      <div
                        className="h-1 w-20 rounded-full mb-8"
                        style={{ backgroundColor: collection.color }}
                      />
                      <Link
                        to={`/shop?collection=${collection.slug}`}
                        className="inline-flex items-center gap-2 text-primary hover:gap-4 transition-all group"
                      >
                        <span className="tracking-wider uppercase text-sm font-medium">
                          View Collection
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Collection Products Preview */}
                  {collectionProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {collectionProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="group glass-card overflow-hidden"
                        >
                          <div className="aspect-[3/4] overflow-hidden">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              ₹{(product.price / 100).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
