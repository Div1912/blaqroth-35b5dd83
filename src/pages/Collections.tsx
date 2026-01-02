import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useCollections } from '@/hooks/useCollections';
import { useProducts } from '@/hooks/useProducts';

const Collections = () => {
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const { data: products } = useProducts();

  const getProductCount = (collectionId: string) => {
    return products?.filter(p => p.collection_id === collectionId).length || 0;
  };

  const getCollectionProducts = (collectionId: string) => {
    return products?.filter(p => p.collection_id === collectionId).slice(0, 4) || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        {/* Hero Section */}
        <section className="section-padding-lg border-b border-border">
          <div className="container-editorial">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <p className="subheading mb-4">Curated Stories</p>
              <h1 className="heading-xl mb-6">Collections</h1>
              <p className="body-lg">
                Each collection tells a unique story, crafted with intention and designed for 
                those who appreciate the art of thoughtful dressing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Loading State */}
        {collectionsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Collections */}
        {!collectionsLoading && collections && (
          <div>
            {collections.map((collection, index) => {
              const collectionProducts = getCollectionProducts(collection.id);
              const productCount = getProductCount(collection.id);
              const isEven = index % 2 === 0;

              return (
                <section
                  key={collection.id}
                  className="border-b border-border"
                >
                  {/* Collection Header */}
                  <div className={`grid grid-cols-1 lg:grid-cols-2`}>
                    {/* Image Side */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className={`relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px] ${isEven ? '' : 'lg:order-2'}`}
                    >
                      <Link to={`/shop?collection=${collection.slug}`} className="block absolute inset-0 group">
                        {collection.image_url ? (
                          <img
                            src={collection.image_url}
                            alt={collection.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </Link>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className={`flex flex-col justify-center section-padding ${isEven ? '' : 'lg:order-1'}`}
                    >
                      <p className="subheading mb-4">{productCount} pieces</p>
                      <h2 className="heading-lg mb-6">{collection.name}</h2>
                      <p className="body-lg mb-8 max-w-md">
                        {collection.description}
                      </p>
                      <div>
                        <Link
                          to={`/shop?collection=${collection.slug}`}
                          className="btn-secondary inline-flex items-center gap-3 group"
                        >
                          <span>Explore Collection</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </motion.div>
                  </div>

                  {/* Collection Products Preview */}
                  {collectionProducts.length > 0 && (
                    <div className="section-padding border-t border-border">
                      <div className="container-editorial">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                          {collectionProducts.map((product, productIndex) => {
                            const primaryImage = product.product_images?.find(img => img.is_primary)?.url 
                              || product.product_images?.[0]?.url 
                              || '/placeholder.svg';
                            
                            return (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: productIndex * 0.1 }}
                              >
                                <Link
                                  to={`/product/${product.slug}`}
                                  className="block group"
                                >
                                  <div className="aspect-[3/4] mb-4 overflow-hidden bg-muted">
                                    <img
                                      src={primaryImage}
                                      alt={product.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                  <h3 className="text-sm font-medium truncate group-hover:underline">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    ₹{(product.price / 100).toLocaleString('en-IN')}
                                  </p>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!collectionsLoading && (!collections || collections.length === 0) && (
          <div className="section-padding-lg text-center">
            <p className="text-muted-foreground">
              No collections available yet.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
