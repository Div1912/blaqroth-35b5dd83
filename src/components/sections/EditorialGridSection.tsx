import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useEditorialGrid } from '@/hooks/useEditorialGrid';

// Fallback images
import woolCoatImg from '@/assets/products/wool-coat.jpg';
import silkShirtImg from '@/assets/products/silk-shirt.jpg';
import leatherBagImg from '@/assets/products/leather-bag.jpg';
import turtleneckImg from '@/assets/products/turtleneck.jpg';

const fallbackTiles = [
  { id: '1', title: 'Outerwear', subtitle: 'Refined layers', image_url: woolCoatImg, link: '/shop?category=outerwear', display_order: 1, is_active: true },
  { id: '2', title: 'Tops', subtitle: 'Essential foundations', image_url: silkShirtImg, link: '/shop?category=tops', display_order: 2, is_active: true },
  { id: '3', title: 'Accessories', subtitle: 'Finishing details', image_url: leatherBagImg, link: '/shop?category=accessories', display_order: 3, is_active: true },
  { id: '4', title: 'Knitwear', subtitle: 'Cozy essentials', image_url: turtleneckImg, link: '/shop?category=tops', display_order: 4, is_active: true },
];

export function EditorialGridSection() {
  const { data: dbItems, isLoading } = useEditorialGrid();
  
  // Use DB items if available, otherwise use fallback
  const items = dbItems && dbItems.length > 0 ? dbItems : fallbackTiles;

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="container-editorial flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container-editorial px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={item.link}
                className="group block relative aspect-[4/3] sm:aspect-[4/5] overflow-hidden bg-secondary"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                  {item.subtitle && (
                    <span className="text-background/80 text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
                      {item.subtitle}
                    </span>
                  )}
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-background mb-2 sm:mb-3">
                    {item.title}
                  </h3>
                  <span className="inline-flex items-center text-background text-xs sm:text-sm uppercase tracking-wider group-hover:gap-3 gap-2 transition-all">
                    Shop
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
