import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, CreditCard, Package, Truck } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/formatCurrency';
import { indianStates } from '@/lib/countryCodes';
import { toast } from 'sonner';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
type PaymentMethod = 'cod' | 'razorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const shipping = total > 50000 ? 0 : 500;

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user && items.length > 0) {
      toast.error('Please sign in to checkout');
      navigate('/auth?mode=signin');
    }
  }, [user, authLoading, navigate, items.length]);

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmation', icon: Package },
  ];

  const handlePlaceOrder = () => {
    setCurrentStep('confirmation');
    clearCart();
    toast.success('Order placed successfully!');
  };

  if (authLoading) {
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
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-10 md:p-16 text-center"
          >
            <h1 className="font-display text-3xl mb-4">Sign in Required</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to proceed with checkout.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth?mode=signin">Sign In</Link>
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  if (items.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground scrollProgress={scrollProgress} />
        <Header />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-10 md:p-16 text-center"
          >
            <h1 className="font-display text-3xl mb-4">Your bag is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some items to proceed to checkout.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          {currentStep !== 'confirmation' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
              <Link to="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </motion.div>
          )}

          {/* Steps Indicator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step.id ? 'border-primary bg-primary text-primary-foreground'
                      : steps.findIndex((s) => s.id === currentStep) > index ? 'border-primary bg-primary/20 text-primary'
                      : 'border-white/20 text-muted-foreground'
                  }`}>
                    {steps.findIndex((s) => s.id === currentStep) > index ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className={`hidden md:block ml-3 text-sm ${currentStep === step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && <div className="w-12 md:w-24 h-px bg-white/10 mx-4" />}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {currentStep === 'shipping' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 md:p-12">
                  <h2 className="font-display text-3xl tracking-wider mb-8">Shipping Address</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">First Name</label>
                        <input type="text" className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" required />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">Last Name</label>
                        <input type="text" className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Phone</label>
                      <input type="tel" className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+91 9876543210" required />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Street Address</label>
                      <input type="text" className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" required />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">City</label>
                        <input type="text" className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" required />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">State</label>
                        <select className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" required>
                          <option value="">Select State</option>
                          {indianStates.map((state) => (<option key={state} value={state}>{state}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">PIN Code</label>
                        <input type="text" className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="400001" required />
                      </div>
                    </div>
                  </div>
                  <Button variant="hero" size="xl" className="w-full mt-8" onClick={() => setCurrentStep('payment')}>
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 md:p-12">
                  <h2 className="font-display text-3xl tracking-wider mb-8">Payment Method</h2>
                  <div className="space-y-4">
                    <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-white/30'}`}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <Truck className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-white/30'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Pay Online (Razorpay)</p>
                        <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking, Wallets</p>
                      </div>
                      <span className="ml-auto px-2 py-1 text-xs bg-primary/20 text-primary rounded">Coming Soon</span>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="glass" size="lg" onClick={() => setCurrentStep('shipping')}>Back</Button>
                    <Button variant="hero" size="xl" className="flex-1" onClick={handlePlaceOrder} disabled={paymentMethod === 'razorpay'}>
                      {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'confirmation' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 md:p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
                    <Check className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="font-display text-4xl tracking-wider mb-4">Order Confirmed</h2>
                  <p className="text-muted-foreground text-lg mb-2">Thank you for your order!</p>
                  <p className="text-muted-foreground mb-8">Order #BLQ-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  <p className="text-muted-foreground mb-12">You will receive a confirmation email shortly.</p>
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </motion.div>
              )}
            </div>

            {currentStep !== 'confirmation' && (
              <div className="lg:col-span-1">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 sticky top-32">
                  <h3 className="font-display text-2xl tracking-wider mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                        <div className="w-16 h-20 bg-secondary/20 rounded overflow-hidden flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-muted-foreground text-sm">{item.size} / {item.color} × {item.quantity}</p>
                          <p className="text-foreground mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                    <div className="flex justify-between text-lg font-display pt-3 border-t border-white/10"><span>Total</span><span>{formatPrice(total + shipping)}</span></div>
                  </div>
                  {shipping > 0 && <p className="text-muted-foreground text-sm mt-4">Free shipping on orders over ₹500</p>}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
