import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { products, categories, collections } from '@/data/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    searchParams.get('collection')
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync collection from URL
  useEffect(() => {
    const collectionParam = searchParams.get('collection');
    if (collectionParam) {
      setSelectedCollection(collectionParam);
    }
  }, [searchParams]);

  const handleCollectionChange = (slug: string | null) => {
    setSelectedCollection(slug);
    if (slug) {
      setSearchParams({ collection: slug });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = products
    .filter((p) => !selectedCategory || p.category === selectedCategory)
    .filter((p) => !selectedCollection || p.collection === selectedCollection)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const currentCollection = collections.find(c => c.slug === selectedCollection);
  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedCollection ? 1 : 0);

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
            <BackButton fallbackTo="/" />
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
              {currentCollection ? currentCollection.name : 'The Collection'}
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-wider">
              {currentCollection ? currentCollection.name : 'Shop All'}
            </h1>
            {currentCollection && (
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                {currentCollection.description}
              </p>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-4 md:p-6 mb-12"
          >
            <div className="flex flex-col gap-4">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center justify-between md:hidden">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Desktop Filters */}
              <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-4">
                    {/* Collections */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Collection</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedCollection === null ? 'glass-gold' : 'glass'}
                          size="sm"
                          onClick={() => handleCollectionChange(null)}
                        >
                          All
                        </Button>
                        {collections.map((collection) => (
                          <Button
                            key={collection.id}
                            variant={selectedCollection === collection.slug ? 'glass-gold' : 'glass'}
                            size="sm"
                            onClick={() => handleCollectionChange(collection.slug)}
                          >
                            {collection.name.replace(' COLLECTION', '')}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedCategory === null ? 'glass-gold' : 'glass'}
                          size="sm"
                          onClick={() => setSelectedCategory(null)}
                        >
                          All
                        </Button>
                        {categories.map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.slug ? 'glass-gold' : 'glass'}
                            size="sm"
                            onClick={() => setSelectedCategory(category.slug)}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sort - Desktop */}
                  <div className="hidden md:flex items-center gap-4">
                    <span className="text-muted-foreground text-sm">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="bg-secondary/50 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || selectedCollection) && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedCollection && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                      {collections.find(c => c.slug === selectedCollection)?.name.replace(' COLLECTION', '')}
                      <button onClick={() => handleCollectionChange(null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                      {categories.find(c => c.slug === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      handleCollectionChange(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-muted-foreground"
          >
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                No products found with the selected filters.
              </p>
              <Button
                variant="glass"
                onClick={() => {
                  setSelectedCategory(null);
                  handleCollectionChange(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
