import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, MapPin, Package, Settings, LogOut } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';

const Account = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoggedIn] = useState(false); // Will be connected to auth

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground scrollProgress={scrollProgress} />
        <Header />
        <CartDrawer />

        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-panel p-10 md:p-16 max-w-md w-full mx-6 text-center"
          >
            <User className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-4">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mb-8">
              Sign in to access your account, view orders, and manage your addresses.
            </p>
            <div className="space-y-4">
              <Button variant="hero" size="xl" className="w-full" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="glass" size="lg" className="w-full" asChild>
                <Link to="/auth?mode=signup">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  const menuItems = [
    { icon: User, label: 'Profile', href: '/account/profile' },
    { icon: Package, label: 'Orders', href: '/account/orders' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
    { icon: Settings, label: 'Settings', href: '/account/settings' },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-12">
              My Account
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={item.href}>
                    <div className="glass-panel p-8 hover-lift flex items-center gap-6">
                      <item.icon className="h-8 w-8 text-primary" />
                      <span className="font-display text-xl tracking-wider">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <Button variant="glass" size="lg" className="w-full md:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
