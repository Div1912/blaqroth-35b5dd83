import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { AddressManager } from '@/components/AddressManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: Package },
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
            <div className="flex items-center justify-between mb-12">
              <h1 className="font-display text-4xl md:text-5xl tracking-wider">
                My Account
              </h1>
              <Button variant="glass" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Tabs */}
            <div className="glass-panel p-2 mb-8 flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8"
              >
                <h2 className="font-display text-2xl tracking-wider mb-6">Profile Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Member Since</label>
                    <p className="text-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AddressManager />
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 text-center"
              >
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="font-display text-2xl tracking-wider mb-2">No Orders Yet</h2>
                <p className="text-muted-foreground mb-6">
                  When you place an order, it will appear here.
                </p>
                <Button variant="glass-gold" asChild>
                  <Link to="/shop">Start Shopping</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
