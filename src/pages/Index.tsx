import { useState, useEffect } from 'react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { HeroSection } from '@/components/sections/HeroSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { FeaturedSection } from '@/components/sections/FeaturedSection';
import { CollectionStorySection } from '@/components/sections/CollectionStorySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { BrandEthosSection } from '@/components/sections/BrandEthosSection';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Enable buttery smooth scrolling
  useSmoothScroll();

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
      {/* Persistent Animated Background - only shows after hero */}
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-1000" style={{ opacity: scrollProgress > 0.1 ? 1 : 0 }}>
        <AnimatedBackground scrollProgress={scrollProgress} />
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection />
        <CollectionStorySection />
        <TestimonialsSection />
        <BrandEthosSection />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
