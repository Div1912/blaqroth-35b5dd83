import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { ShopHeroBackground } from '@/components/ShopHeroBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { DBProductCard } from '@/components/DBProductCard';
import { ShopFilters } from '@/components/ShopFilters';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { useProducts, useCategories, useActiveOffers } from '@/hooks/useProducts';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    searchParams.get('collection')
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Enable smooth scrolling
  useSmoothScroll();

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: offers } = useActiveOffers();

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 100000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 1000) * 1000;
  }, [products]);

  // Initialize price range when products load
  useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

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

  const handleClearAll = () => {
    setSelectedCategory(null);
    setPriceRange([0, maxPrice]);
    setSortBy('newest');
  };

  const filteredProducts = useMemo(() => {
    return (products || [])
      .filter((p) => !selectedCategory || p.category?.slug === selectedCategory)
      .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, selectedCategory, priceRange, sortBy]);

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedCollection ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

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

          {/* Page Header with Parallax Background */}
          <div className="relative mb-16">
            <ShopHeroBackground />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-12 relative z-10"
            >
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block"
              >
                The Collection
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-wider"
              >
                <span className="text-gold-gradient">Shop All</span>
              </motion.h1>
              
              {/* Decorative elements */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-6 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto max-w-xs"
              />
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-panel p-6 sticky top-32"
              >
                <ShopFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  maxPrice={maxPrice}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onClearAll={handleClearAll}
                  activeFiltersCount={activeFiltersCount}
                />
              </motion.div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Results Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-muted-foreground"
              >
                {productsLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading products...
                  </span>
                ) : (
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span>
                )}
              </motion.div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card animate-pulse">
                      <div className="aspect-[3/4] bg-secondary/20" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-secondary/20 rounded w-3/4" />
                        <div className="h-4 bg-secondary/20 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {filteredProducts.map((product, index) => (
                    <DBProductCard key={product.id} product={product} offers={offers || []} index={index} />
                  ))}
                </div>
              )}

              {!productsLoading && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-4">
                    No products found with the selected filters.
                  </p>
                  <Button
                    variant="glass"
                    onClick={handleClearAll}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
