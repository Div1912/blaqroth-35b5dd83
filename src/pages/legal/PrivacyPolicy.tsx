import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BackButton } from '@/components/BackButton';
import { useState, useEffect } from 'react';

const PrivacyPolicy = () => {
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
            <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-8">Privacy Policy</h1>
            
            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">Last updated: December 2024</p>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, phone number, and shipping address</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Order history and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send order confirmations and shipping updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Improve our products and services</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">3. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service providers who assist in order fulfillment and delivery</li>
                  <li>Payment processors for secure transactions</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">6. Contact Us</h2>
                <p>For privacy-related inquiries, please contact us at:</p>
                <p className="text-foreground">privacy@blaqroth.com</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
