import { useState } from 'react';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { HeroSection } from '@/components/sections/HeroSection';
import { EditorialGridSection } from '@/components/sections/EditorialGridSection';
import { FeaturedSection } from '@/components/sections/FeaturedSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { SpotlightSection } from '@/components/sections/SpotlightSection';
import { NewArrivalsSection } from '@/components/sections/NewArrivalsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <AnnouncementBar />
      
      {/* Header */}
      <Header />
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        {/* 1. Hero Campaign Section */}
        <HeroSection />
        
        {/* 2. Editorial Feature Grid */}
        <EditorialGridSection />
        
        {/* 3. Featured Product Rail */}
        <FeaturedSection />
        
        {/* 4. Shop by Category */}
        <CategoriesSection />
        
        {/* 5. Spotlight / Brand Statement */}
        <SpotlightSection />
        
        {/* 6. New Arrivals Product Rail */}
        <NewArrivalsSection />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
