import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { DBProductCard } from '@/components/DBProductCard';
import { ShopFilters } from '@/components/ShopFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/BackButton';
import { useProducts, useCategories, useActiveOffers } from '@/hooks/useProducts';
import { useActiveCoupons } from '@/hooks/useCoupons';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
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
  const { data: coupons } = useActiveCoupons();

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
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return (products || [])
      .filter((p) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.name?.toLowerCase().includes(query)
        );
      })
      .filter((p) => !selectedCategory || p.category?.slug === selectedCategory)
      .filter((p) => !selectedCollection || p.collection?.slug === selectedCollection)
      .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedCollection, priceRange, sortBy]);

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedCollection ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
        <div className="container-editorial px-4 sm:px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 sm:mb-8"
          >
            <BackButton fallbackTo="/" />
          </motion.div>

          {/* Page Header */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-6 sm:py-8 md:py-12"
            >
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-muted-foreground tracking-[0.3em] sm:tracking-[0.4em] uppercase text-xs sm:text-sm mb-3 sm:mb-4 block"
              >
                The Collection
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide"
              >
                Shop All
              </motion.h1>
              
              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-4 sm:mt-6 h-px bg-border mx-auto max-w-[200px] sm:max-w-xs"
              />
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:sticky lg:top-28"
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
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6"
              >
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10 sm:pl-12 pr-10 h-10 sm:h-12 bg-secondary/30 border-border focus:border-foreground text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Results Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 sm:mb-6 text-muted-foreground text-sm"
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
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-secondary/30 rounded-lg animate-pulse">
                      <div className="aspect-[3/4] bg-secondary" />
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="h-3 sm:h-4 bg-secondary rounded w-3/4" />
                        <div className="h-3 sm:h-4 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <DBProductCard key={product.id} product={product} offers={offers || []} coupons={coupons || []} index={index} />
                  ))}
                </div>
              )}

              {!productsLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12 sm:py-16 md:py-20">
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4">
                    No products found with the selected filters.
                  </p>
                  <Button variant="editorial-outline" onClick={handleClearAll}>
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
