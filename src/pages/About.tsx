import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { BackButton } from '@/components/BackButton';

const About = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
              The Brand
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light tracking-wider mb-8">
              About BLAQROTH
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Founded on the principle that true luxury lies in restraint.
            </p>
          </motion.div>

          {/* Story Sections */}
          <div className="space-y-24 max-w-4xl mx-auto">
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-10 md:p-16"
            >
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-6">
                Our Philosophy
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                BLAQROTH was born from a simple observation: the fashion industry produces 
                too much. Too many trends, too many collections, too much noise. We chose 
                a different path.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Each piece we create is designed to be permanent—not disposable. We focus 
                on timeless silhouettes, exceptional materials, and construction that 
                improves with wear. Our collections are small because we believe in making 
                less, but making it right.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-10 md:p-16"
            >
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-6">
                Materials & Craft
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We source our materials from the world's finest mills. Italian wools, 
                Mongolian cashmere, Japanese cottons, and French linens form the foundation 
                of our collections.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every garment is constructed in small ateliers where craftspeople take 
                the time to do things properly. We don't rush production for seasonal 
                deadlines. We wait until it's right.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-10 md:p-16"
            >
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-6">
                Sustainability
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We don't create "sustainable collections." Instead, sustainability is 
                embedded in everything we do. When you make things to last, and you make 
                less of them, the environmental impact is naturally reduced.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our packaging is minimal and recyclable. We offer repairs for life. 
                We encourage customers to buy less, choose well, and make it last.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-10 md:p-16"
            >
              <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-6">
                For Whom
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                BLAQROTH is for those who have moved beyond trends. For those who 
                understand that confidence comes from within, not from logos. For those 
                who appreciate the quiet details—the weight of a fabric, the precision 
                of a seam, the way a garment moves with the body. For those who know 
                that the best things in life are worth waiting for.
              </p>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
