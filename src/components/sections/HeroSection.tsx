import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import noirCollectionImg from '@/assets/collections/noir-collection.jpg';
import eclipseCollectionImg from '@/assets/collections/eclipse-collection.jpg';
import gildedCollectionImg from '@/assets/collections/gilded-collection.jpg';

const heroSlides = [
  {
    id: 1,
    image: noirCollectionImg,
    headline: 'The New Collection',
    subheadline: 'Timeless pieces for the modern wardrobe',
    primaryCta: { text: 'Shop Collection', link: '/collections' },
    secondaryCta: { text: 'Learn More', link: '/about' },
  },
  {
    id: 2,
    image: eclipseCollectionImg,
    headline: 'Eclipse',
    subheadline: 'Where shadow meets light',
    primaryCta: { text: 'Explore Now', link: '/shop' },
    secondaryCta: { text: 'View Lookbook', link: '/collections' },
  },
  {
    id: 3,
    image: gildedCollectionImg,
    headline: 'Gilded',
    subheadline: 'Understated luxury for those who know',
    primaryCta: { text: 'Discover', link: '/shop' },
    secondaryCta: { text: 'Our Story', link: '/about' },
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const goToSlide = (index: number) => {
    stopAutoplay();
    setCurrentSlide(index);
    startAutoplay();
  };

  const nextSlide = () => {
    stopAutoplay();
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    startAutoplay();
  };

  const prevSlide = () => {
    stopAutoplay();
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    startAutoplay();
  };

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative h-[85vh] md:h-screen overflow-hidden bg-secondary">
      {/* Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.headline}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-foreground/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-editorial">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl"
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-medium text-background mb-4 leading-tight">
                {slide.headline}
              </h1>
              <p className="text-background/80 text-lg md:text-xl mb-8 max-w-md">
                {slide.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="editorial" size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
                  <Link to={slide.primaryCta.link}>{slide.primaryCta.text}</Link>
                </Button>
                <Button variant="editorial-outline" size="lg" asChild className="border-background text-background hover:bg-background hover:text-foreground">
                  <Link to={slide.secondaryCta.link}>{slide.secondaryCta.text}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-background/80 hover:text-background transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" strokeWidth={1} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-background/80 hover:text-background transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" strokeWidth={1} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-background w-8' : 'bg-background/50 hover:bg-background/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
