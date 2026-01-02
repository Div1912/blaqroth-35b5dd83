import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroSlides, HeroSlide } from '@/hooks/useHeroSlides';

// Fallback slides if no data from Supabase
import noirCollectionImg from '@/assets/collections/noir-collection.jpg';
import eclipseCollectionImg from '@/assets/collections/eclipse-collection.jpg';
import gildedCollectionImg from '@/assets/collections/gilded-collection.jpg';

const fallbackSlides: HeroSlide[] = [
  {
    id: 'fallback-1',
    media_url: noirCollectionImg,
    media_type: 'image',
    headline: 'The New Collection',
    subheadline: 'Timeless pieces for the modern wardrobe',
    primary_cta_text: 'Shop Collection',
    primary_cta_link: '/collections',
    secondary_cta_text: 'Learn More',
    secondary_cta_link: '/about',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'fallback-2',
    media_url: eclipseCollectionImg,
    media_type: 'image',
    headline: 'Eclipse',
    subheadline: 'Where shadow meets light',
    primary_cta_text: 'Explore Now',
    primary_cta_link: '/shop',
    secondary_cta_text: 'View Lookbook',
    secondary_cta_link: '/collections',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'fallback-3',
    media_url: gildedCollectionImg,
    media_type: 'image',
    headline: 'Gilded',
    subheadline: 'Understated luxury for those who know',
    primary_cta_text: 'Discover',
    primary_cta_link: '/shop',
    secondary_cta_text: 'Our Story',
    secondary_cta_link: '/about',
    display_order: 3,
    is_active: true,
  },
];

export function HeroSection() {
  const { data: dbSlides, isLoading } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use DB slides if available, otherwise use fallback
  const heroSlides = dbSlides && dbSlides.length > 0 ? dbSlides : fallbackSlides;

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
  }, [heroSlides.length]);

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

  if (isLoading) {
    return (
      <section className="relative h-[70vh] md:h-[85vh] lg:h-screen overflow-hidden bg-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </section>
    );
  }

  if (heroSlides.length === 0) {
    return null;
  }

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative h-[70vh] md:h-[85vh] lg:h-screen overflow-hidden bg-secondary">
      {/* Media Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {slide.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={slide.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={slide.media_url}
              alt={slide.headline}
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-foreground/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-editorial px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl"
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium text-background mb-3 md:mb-4 leading-tight">
                {slide.headline}
              </h1>
              {slide.subheadline && (
                <p className="text-background/80 text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-md">
                  {slide.subheadline}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {slide.primary_cta_text && slide.primary_cta_link && (
                  <Button variant="editorial" size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
                    <Link to={slide.primary_cta_link}>{slide.primary_cta_text}</Link>
                  </Button>
                )}
                {slide.secondary_cta_text && slide.secondary_cta_link && (
                  <Button variant="editorial-outline" size="lg" asChild className="border-background text-background hover:bg-background hover:text-foreground">
                    <Link to={slide.secondary_cta_link}>{slide.secondary_cta_text}</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile for cleaner UX */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 items-center justify-center text-background/80 hover:text-background transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" strokeWidth={1} />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 items-center justify-center text-background/80 hover:text-background transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" strokeWidth={1} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-background w-6 md:w-8' : 'bg-background/50 hover:bg-background/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
