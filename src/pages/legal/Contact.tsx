import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Contact = () => {
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
            className="text-center mb-12"
          >
            <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
              Get in Touch
            </span>
            <h1 className="font-display text-4xl md:text-5xl tracking-wider">Contact Us</h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 space-y-8"
            >
              <h2 className="font-display text-2xl tracking-wider">Reach Out</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <a href="mailto:hello@blaqroth.com" className="text-muted-foreground hover:text-primary transition-colors">
                      hello@blaqroth.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium mb-1">Phone</p>
                    <a href="tel:+919876543210" className="text-muted-foreground hover:text-primary transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium mb-1">Address</p>
                    <p className="text-muted-foreground">
                      Blaqroth Fashion House<br />
                      123 Fashion Street<br />
                      Mumbai, Maharashtra 400001<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium mb-1">Business Hours</p>
                    <p className="text-muted-foreground">
                      Monday - Saturday: 10:00 AM - 7:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-8"
            >
              <h2 className="font-display text-2xl tracking-wider mb-6">Send a Message</h2>
              
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name');
                  const email = formData.get('email');
                  const subject = formData.get('subject');
                  const message = formData.get('message');
                  
                  if (!name || !email || !message) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  
                  // In a real app, this would send to a backend
                  toast.success('Message sent! We will get back to you soon.');
                  (e.target as HTMLFormElement).reset();
                }}
              >
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Subject</label>
                  <select 
                    name="subject"
                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order Inquiry</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="product">Product Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Message *</label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
