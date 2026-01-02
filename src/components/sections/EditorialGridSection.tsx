import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import woolCoatImg from '@/assets/products/wool-coat.jpg';
import silkShirtImg from '@/assets/products/silk-shirt.jpg';
import leatherBagImg from '@/assets/products/leather-bag.jpg';
import turtleneckImg from '@/assets/products/turtleneck.jpg';

const editorialTiles = [
  {
    id: 1,
    title: 'Outerwear',
    subtitle: 'Refined layers',
    image: woolCoatImg,
    link: '/shop?category=outerwear',
    size: 'large',
  },
  {
    id: 2,
    title: 'Tops',
    subtitle: 'Essential foundations',
    image: silkShirtImg,
    link: '/shop?category=tops',
    size: 'small',
  },
  {
    id: 3,
    title: 'Accessories',
    subtitle: 'Finishing details',
    image: leatherBagImg,
    link: '/shop?category=accessories',
    size: 'small',
  },
  {
    id: 4,
    title: 'Knitwear',
    subtitle: 'Cozy essentials',
    image: turtleneckImg,
    link: '/shop?category=tops',
    size: 'large',
  },
];

export function EditorialGridSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-editorial">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {editorialTiles.map((tile, index) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${tile.size === 'large' ? 'row-span-2' : ''}`}
            >
              <Link to={tile.link} className="group block relative overflow-hidden aspect-[3/4]">
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-display text-xl md:text-2xl text-background mb-1">
                    {tile.title}
                  </h3>
                  <p className="text-background/70 text-sm mb-3">
                    {tile.subtitle}
                  </p>
                  <span className="text-xs tracking-[0.15em] uppercase text-background border-b border-background/50 pb-0.5 inline-block group-hover:border-background transition-colors">
                    Shop
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
