import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import woolCoatImg from '@/assets/products/wool-coat.jpg';
import blazerImg from '@/assets/products/blazer.jpg';
import leatherBagImg from '@/assets/products/leather-bag.jpg';
import silkShirtImg from '@/assets/products/silk-shirt.jpg';
import turtleneckImg from '@/assets/products/turtleneck.jpg';

const marqueeProducts = [
  { id: '1', name: 'Wool Coat', image: woolCoatImg, price: '₹89,900' },
  { id: '2', name: 'Structured Blazer', image: blazerImg, price: '₹64,900' },
  { id: '7', name: 'Leather Bag', image: leatherBagImg, price: '₹59,900' },
  { id: '3', name: 'Silk Shirt', image: silkShirtImg, price: '₹29,900' },
  { id: '5', name: 'Cashmere Turtleneck', image: turtleneckImg, price: '₹39,900' },
];

export function ProductMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  
  // Duplicate products for seamless loop
  const duplicatedProducts = [...marqueeProducts, ...marqueeProducts, ...marqueeProducts];

  return (
    <div 
      className="absolute bottom-24 left-0 right-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex gap-8"
        animate={{
          x: isPaused ? undefined : [0, -1200],
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
            className="relative flex-shrink-0 group cursor-pointer"
            whileHover={{ scale: 1.08, y: -15 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative w-40 h-52 md:w-48 md:h-64 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              {/* Product Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
              
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-primary/10 to-transparent" />
                <div className="absolute inset-0 border-2 border-primary/40 rounded-lg" />
              </div>
              
              {/* Quick Action Buttons */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link 
                  to={`/product/${product.id}`}
                  className="p-3 bg-background/90 backdrop-blur-sm rounded-full border border-white/20 hover:bg-primary hover:border-primary transition-all duration-300 shadow-lg"
                >
                  <Eye className="h-4 w-4 text-foreground" />
                </Link>
                <Link 
                  to={`/product/${product.id}`}
                  className="p-3 bg-primary/90 backdrop-blur-sm rounded-full border border-primary hover:bg-primary transition-all duration-300 shadow-lg"
                >
                  <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                </Link>
              </motion.div>
              
              {/* Product Info */}
              <div className="absolute bottom-3 left-3 right-3 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                <p className="text-xs tracking-wider text-foreground/90 font-body font-medium">
                  {product.name}
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  {product.price}
                </p>
              </div>
            </div>
            
            {/* Floating Reflection */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-primary/15 blur-xl rounded-full group-hover:bg-primary/25 transition-all duration-500" />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Pause indicator */}
      {isPaused && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-[-30px] left-1/2 -translate-x-1/2 text-xs text-muted-foreground tracking-widest uppercase"
        >
          Hover to explore
        </motion.div>
      )}
    </div>
  );
}
