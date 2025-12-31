import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BrandEthosSection() {
  return (
    <section className="section-padding relative z-10">
      <div className="container mx-auto">
        <div className="glass-panel p-10 md:p-16 lg:p-24 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-l from-primary to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-primary tracking-[0.4em] uppercase text-sm mb-6 block">
                Our Philosophy
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-8 leading-tight">
                Less, But Better.
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8">
                We believe in the power of restraint. In a world of endless options, 
                we choose to focus on what matters: exceptional materials, thoughtful 
                construction, and designs that stand the test of time. Every piece is 
                created with the intention to become a permanent part of your wardrobe.
              </p>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-12">
                Sustainability isn't a feature—it's a consequence of making things well.
              </p>
              <Button variant="glass-gold" size="xl" asChild>
                <Link to="/about">Discover Our Process</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
