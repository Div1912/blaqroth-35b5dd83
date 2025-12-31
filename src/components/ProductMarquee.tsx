import { motion } from 'framer-motion';
import woolCoatImg from '@/assets/products/wool-coat.jpg';
import blazerImg from '@/assets/products/blazer.jpg';
import leatherBagImg from '@/assets/products/leather-bag.jpg';
import silkShirtImg from '@/assets/products/silk-shirt.jpg';
import turtleneckImg from '@/assets/products/turtleneck.jpg';

const marqueeProducts = [
  { id: 1, name: 'Wool Coat', image: woolCoatImg },
  { id: 2, name: 'Structured Blazer', image: blazerImg },
  { id: 3, name: 'Leather Bag', image: leatherBagImg },
  { id: 4, name: 'Silk Shirt', image: silkShirtImg },
  { id: 5, name: 'Cashmere Turtleneck', image: turtleneckImg },
];

export function ProductMarquee() {
  // Duplicate products for seamless loop
  const duplicatedProducts = [...marqueeProducts, ...marqueeProducts, ...marqueeProducts];

  return (
    <div className="absolute bottom-24 left-0 right-0 overflow-hidden pointer-events-none">
      <motion.div
        className="flex gap-8"
        animate={{
          x: [0, -1200],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 25,
            ease: 'linear',
          },
        }}
      >
        {duplicatedProducts.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            className="relative flex-shrink-0 group"
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-40 h-52 md:w-48 md:h-64 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              {/* Product Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              
              {/* Product Name */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs tracking-wider text-foreground/80 font-body">
                  {product.name}
                </p>
              </div>
            </div>
            
            {/* Floating Reflection */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-primary/10 blur-xl rounded-full" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
