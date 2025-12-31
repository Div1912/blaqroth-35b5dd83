import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { collections } from '@/data/products';

export function CollectionStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative z-10 py-32 md:py-48">
      <motion.div style={{ opacity }} className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
            The Collections
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wider">
            A Story in Fabric
          </h2>
        </motion.div>

        <div className="space-y-24 md:space-y-32">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center gap-12 md:gap-20`}
            >
              {/* Visual */}
              <div className="w-full md:w-1/2">
                <div className="glass-card aspect-[4/5] relative overflow-hidden">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: `radial-gradient(circle at center, ${collection.color}, transparent 70%)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="font-display text-6xl md:text-8xl tracking-[0.2em] opacity-30"
                          style={{ color: collection.color }}
                        >
                          {collection.name.split(' ')[0]}
                        </motion.span>
                      </div>
                    </>
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 space-y-6">
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wider">
                  {collection.name}
                </h3>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  {collection.description}
                </p>
                <div
                  className="h-1 w-20 rounded-full"
                  style={{ backgroundColor: collection.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
