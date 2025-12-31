import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="font-display text-2xl tracking-[0.3em] font-light mb-4">
              BLAQROTH
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Modern luxury for the discerning individual. Crafted with intention.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-medium tracking-widest uppercase mb-6">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-medium tracking-widest uppercase mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium tracking-widest uppercase mb-6">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-16 pt-8 border-t border-white/5">
          <p className="text-muted-foreground text-sm">
            © 2024 BLAQROTH. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
