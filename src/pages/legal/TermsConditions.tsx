import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BackButton } from '@/components/BackButton';
import { useState, useEffect } from 'react';

const TermsConditions = () => {
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
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <BackButton fallbackTo="/" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 md:p-12"
          >
            <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-8">Terms & Conditions</h1>
            
            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">Last updated: December 2024</p>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using the Blaqroth website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">2. Products and Pricing</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                  <li>We reserve the right to modify prices without prior notice</li>
                  <li>Product images are for illustration purposes; actual products may vary slightly</li>
                  <li>Product availability is subject to stock levels</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">3. Orders and Payment</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Order confirmation is subject to product availability</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Payment must be completed before order processing</li>
                  <li>For COD orders, payment is required upon delivery</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">4. Shipping and Delivery</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Delivery times are estimates and not guaranteed</li>
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>Shipping charges may apply based on order value and location</li>
                  <li>We are not responsible for delays due to unforeseen circumstances</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">5. Intellectual Property</h2>
                <p>All content on this website, including text, graphics, logos, and images, is the property of Blaqroth and is protected by copyright laws.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">6. Limitation of Liability</h2>
                <p>Blaqroth shall not be liable for any indirect, incidental, special, or consequential damages arising out of the use or inability to use our products or services.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">7. Governing Law</h2>
                <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in [City], India.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">8. Contact</h2>
                <p>For questions about these terms, contact us at:</p>
                <p className="text-foreground">legal@blaqroth.com</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
