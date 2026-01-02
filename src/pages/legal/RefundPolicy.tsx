import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BackButton } from '@/components/BackButton';
import { useState, useEffect } from 'react';

const RefundPolicy = () => {
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
            <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-8">Refund & Return Policy</h1>
            
            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">Last updated: December 2024</p>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">1. Returns Eligibility</h2>
                <p>We accept returns within 7 days of delivery under the following conditions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Item must be unused and in original condition</li>
                  <li>All original tags and packaging must be intact</li>
                  <li>Item must not be from the sale/discounted category</li>
                  <li>Customized or personalized items cannot be returned</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">2. Return Process</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our customer service at returns@blaqroth.com</li>
                  <li>Provide your order number and reason for return</li>
                  <li>Receive a return authorization within 24-48 hours</li>
                  <li>Ship the item back using the provided instructions</li>
                  <li>Refund will be processed within 5-7 business days after receiving the item</li>
                </ol>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">3. Refund Methods</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Online payments:</strong> Refund to original payment method</li>
                  <li><strong>COD orders:</strong> Bank transfer to your provided account</li>
                  <li>Processing time: 5-7 business days after item inspection</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">4. Order Cancellation</h2>
                <p>Orders can be cancelled under these conditions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Before packing:</strong> Full refund, no questions asked</li>
                  <li><strong>After packing:</strong> Cancellation not possible</li>
                  <li><strong>After shipping:</strong> Please follow the returns process</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">5. Damaged or Defective Items</h2>
                <p>If you receive a damaged or defective item:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact us within 24 hours of delivery</li>
                  <li>Provide photos of the damage/defect</li>
                  <li>We will arrange a free pickup and replacement/refund</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">6. Exchange Policy</h2>
                <p>We currently do not offer direct exchanges. Please return the original item and place a new order for the desired product.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-foreground mb-4">7. Contact Us</h2>
                <p>For return and refund inquiries:</p>
                <p className="text-foreground">Email: returns@blaqroth.com</p>
                <p className="text-foreground">Phone: +91 9876543210</p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
