import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Heart, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { NotificationDropdown } from '@/components/NotificationDropdown';

const navLinks = [
  { name: 'Collections', href: '/collections' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { openCart, getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background border-b border-border' : 'bg-background'}`}>
        <div className="container-editorial">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="relative z-10">
              <h1 className="font-display text-xl md:text-2xl tracking-[0.1em] font-medium">BLAQROTH</h1>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="link-underline text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </Button>
              
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="hidden md:flex" title="Admin Panel">
                    <Shield className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </Link>
              )}
              
              {user && <NotificationDropdown />}
              
              <Link to="/account">
                <Button variant="ghost" size="icon" className="relative hidden md:flex">
                  <Heart className="h-5 w-5" strokeWidth={1.5} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link to="/account">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-40 bg-background pt-20"
          >
            <nav className="flex flex-col items-center space-y-8 p-8">
              {navLinks.map((link, index) => (
                <motion.div 
                  key={link.name} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={link.href} 
                    className="font-display text-2xl tracking-wide text-foreground hover:text-muted-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-6 pt-8 border-t border-border w-full justify-center"
              >
                <Link to="/account">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon">
                      <Shield className="h-5 w-5" strokeWidth={1.5} />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
