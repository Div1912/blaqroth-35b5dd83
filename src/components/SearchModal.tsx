import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { formatPrice } from '@/lib/formatCurrency';

export function SearchModal() {
  const { query, setQuery, isOpen, closeSearch, results, isLoading } = useSearch();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background shadow-lg"
          >
            <div className="container-editorial px-4 py-4">
              {/* Search Input */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={closeSearch}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Results */}
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!isLoading && query.length >= 2 && results.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found for "{query}"
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {results.map((product) => {
                      const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
                      return (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={closeSearch}
                          className="group flex gap-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                        >
                          <div className="w-16 h-20 bg-secondary rounded overflow-hidden flex-shrink-0">
                            <img
                              src={primaryImage?.url || '/placeholder.svg'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate group-hover:text-foreground/80">
                              {product.name}
                            </h4>
                            {product.category && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {product.category.name}
                              </p>
                            )}
                            <p className="text-sm font-medium mt-1">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {query.length < 2 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
