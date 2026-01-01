import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Package, Truck, Plus } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { CouponInput, AppliedCoupon } from '@/components/CouponInput';
import { useCartStore, DBCartItem } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalLoader } from '@/hooks/useGlobalLoader';
import { formatPrice } from '@/lib/formatCurrency';
import { indianStates } from '@/lib/countryCodes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
type PaymentMethod = 'cod' | 'razorpay';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string | null;
  is_default: boolean | null;
}

interface AddressFormData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const emptyForm: AddressFormData = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { startLoading, stopLoading } = useGlobalLoader();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const { items, getTotal, clearCart } = useCartStore();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const total = getTotal();
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const subtotalAfterCoupon = total - couponDiscount;
  const shipping = subtotalAfterCoupon >= 500 ? 0 : 500;

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

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

  // Fetch saved addresses
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const prefillFromProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('customers')
      .select('full_name, phone, phone_country_code')
      .eq('id', user.id)
      .single();

    if (!data) return;

    setFormData((prev) => ({
      ...prev,
      full_name: prev.full_name || data.full_name || '',
      phone:
        prev.phone ||
        (data.phone ? `${data.phone_country_code || '+91'} ${data.phone}` : ''),
    }));
  };

  const fetchAddresses = async () => {
    if (!user) return;

    setLoadingAddresses(true);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Failed to load addresses:', error);
      setAddresses([]);
      setSelectedAddressId(null);
      setShowAddressForm(true);
      prefillFromProfile();
    } else {
      setAddresses(data || []);
      const defaultAddr = data?.find((a) => a.is_default) || data?.[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setShowAddressForm(false);
      } else {
        setSelectedAddressId(null);
        setShowAddressForm(true);
        prefillFromProfile();
      }
    }
    setLoadingAddresses(false);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingAddress(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          customer_id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2 || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          is_default: addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Address saved');
      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setShowAddressForm(false);
      setFormData(emptyForm);
    } catch (error) {
      toast.error('Failed to save address');
      console.error(error);
    } finally {
      setSavingAddress(false);
    }
  };

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmation', icon: Package },
  ];

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `BLQ-${timestamp}-${random}`;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place order');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error('Invalid address selected');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    startLoading();

    try {
      // Verify stock for all items and collect variant data for later update
      const stockUpdates: { variantId: string; quantity: number; currentStock: number }[] = [];
      
      for (const item of items) {
        if (item.variantId) {
          const { data: variant, error } = await supabase
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variantId)
            .single();

          if (error || !variant) {
            throw new Error(`Could not verify stock for ${item.product.name}`);
          }

          if ((variant.stock_quantity || 0) < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name} (${item.size}/${item.color})`);
          }
          
          stockUpdates.push({
            variantId: item.variantId,
            quantity: item.quantity,
            currentStock: variant.stock_quantity || 0
          });
        }
      }

      // Get customer profile
      const { data: customer } = await supabase
        .from('customers')
        .select('email, full_name, phone')
        .eq('id', user.id)
        .single();

      const newOrderNumber = generateOrderNumber();
      const subtotal = getTotal();
      const orderTotal = subtotalAfterCoupon + shipping;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          order_number: newOrderNumber,
          email: customer?.email || user.email || '',
          full_name: selectedAddress.full_name,
          phone: selectedAddress.phone,
          shipping_address_id: selectedAddressId,
          shipping_address_line1: selectedAddress.address_line1,
          shipping_address_line2: selectedAddress.address_line2,
          shipping_city: selectedAddress.city,
          shipping_state: selectedAddress.state,
          shipping_postal_code: selectedAddress.postal_code,
          shipping_country: selectedAddress.country || 'India',
          subtotal: subtotal,
          shipping_cost: shipping,
          total: orderTotal,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          status: 'pending',
          fulfillment_status: 'pending',
          delivery_mode: 'self',
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error('Failed to create order');
      }

      // Create order items and deduct stock
      for (const item of items) {
        const finalPrice = item.discountedPrice ?? item.priceAtAdd;
        const discountAmount = item.priceAtAdd - finalPrice;

        // Insert order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            variant_id: item.variantId,
            product_name: item.product.name,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            original_price: item.priceAtAdd,
            price: finalPrice,
            discount_amount: discountAmount > 0 ? discountAmount : 0,
            subtotal: finalPrice * item.quantity,
          });

        if (itemError) {
          console.error('Failed to create order item:', itemError);
        }

      }

      // Stock is automatically deducted by database trigger on order_items insert

      // Create notification for user
      await supabase.from('notifications').insert({
        customer_id: user.id,
        title: 'Order Placed Successfully',
        message: `Your order ${newOrderNumber} has been placed and is being processed.`,
        type: 'order',
      });

      setOrderNumber(newOrderNumber);
      setCurrentStep('confirmation');
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
      stopLoading();
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const getProductImage = (item: DBCartItem) => {
    if (item.product.images && item.product.images.length > 0) {
      const primaryImage = item.product.images.find(img => img.is_primary);
      return primaryImage?.url || item.product.images[0].url;
    }
    return '/placeholder.svg';
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
              <BackButton fallbackTo="/shop" />
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
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="glass-panel p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-display text-3xl tracking-wider">Shipping Address</h2>
                      {addresses.length > 0 && !showAddressForm && (
                        <Button variant="glass" size="sm" onClick={() => setShowAddressForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New
                        </Button>
                      )}
                    </div>

                    {loadingAddresses ? (
                      <p className="text-muted-foreground">Loading addresses...</p>
                    ) : (
                      <>
                        {addresses.length === 0 && (
                          <div className="mb-6 rounded-lg bg-secondary/30 p-4">
                            <p className="text-sm text-muted-foreground">
                              No saved address found for <span className="text-foreground">{user.email}</span>. Add one below to continue.
                            </p>
                          </div>
                        )}

                        {/* Saved Addresses */}
                        {!showAddressForm && addresses.length > 0 && (
                          <div className="space-y-4 mb-6">
                            {addresses.map((address) => (
                              <label
                                key={address.id}
                                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedAddressId === address.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <input
                                    type="radio"
                                    name="address"
                                    value={address.id}
                                    checked={selectedAddressId === address.id}
                                    onChange={() => setSelectedAddressId(address.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{address.full_name}</p>
                                      {address.is_default && (
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {address.address_line1}
                                      {address.address_line2 && `, ${address.address_line2}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {address.city}, {address.state} - {address.postal_code}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Add New Address Form */}
                        <AnimatePresence mode="wait">
                          {showAddressForm && (
                            <motion.form
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              onSubmit={handleSaveNewAddress}
                              className="space-y-6"
                            >
                              {addresses.length > 0 && (
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                  <h3 className="font-display text-xl">Add New Address</h3>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm text-muted-foreground block mb-2">Full Name</label>
                                  <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground block mb-2">Phone</label>
                                  <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="+91 9876543210"
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-2">Street Address</label>
                                <input
                                  type="text"
                                  value={formData.address_line1}
                                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground block mb-2">Address Line 2 (Optional)</label>
                                <input
                                  type="text"
                                  value={formData.address_line2}
                                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm text-muted-foreground block mb-2">City</label>
                                  <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground block mb-2">State</label>
                                  <select
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                  >
                                    <option value="">Select State</option>
                                    {indianStates.map((state) => (
                                      <option key={state} value={state}>{state}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground block mb-2">PIN Code</label>
                                  <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="400001"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={savingAddress}>
                                {savingAddress ? 'Saving...' : 'Save & Use This Address'}
                              </Button>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    {!showAddressForm && selectedAddressId && (
                      <Button variant="hero" size="xl" className="w-full mt-8" onClick={() => setCurrentStep('payment')}>
                        Continue to Payment
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 md:p-12">
                  {/* Selected Address Summary */}
                  {selectedAddress && (
                    <div className="mb-8 p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Shipping to:</span>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep('shipping')}>
                          Change
                        </Button>
                      </div>
                      <p className="font-medium">{selectedAddress.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAddress.address_line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                      </p>
                    </div>
                  )}

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
                    <Button 
                      variant="hero" 
                      size="xl" 
                      className="flex-1" 
                      onClick={handlePlaceOrder} 
                      disabled={paymentMethod === 'razorpay' || placingOrder}
                    >
                      {placingOrder ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
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
                  <p className="text-foreground font-medium text-xl mb-8">Order #{orderNumber}</p>
                  <p className="text-muted-foreground mb-12">You will receive a confirmation email shortly. Track your order in your account.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="hero" size="xl" asChild>
                      <Link to="/account">View Orders</Link>
                    </Button>
                    <Button variant="glass" size="lg" asChild>
                      <Link to="/shop">Continue Shopping</Link>
                    </Button>
                  </div>
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
                          <img src={getProductImage(item)} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-muted-foreground text-sm">{item.size} / {item.color} × {item.quantity}</p>
                          <div className="mt-1 flex items-center gap-2">
                            {item.discountedPrice && item.discountedPrice < item.priceAtAdd ? (
                              <>
                                <p className="text-foreground">{formatPrice((item.discountedPrice) * item.quantity)}</p>
                                <p className="text-muted-foreground text-xs line-through">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                              </>
                            ) : (
                              <p className="text-foreground">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                    
                    {/* Coupon Input */}
                    <CouponInput 
                      subtotal={total} 
                      appliedCoupon={appliedCoupon} 
                      onApply={setAppliedCoupon} 
                      onRemove={() => setAppliedCoupon(null)} 
                    />
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatPrice(couponDiscount)}</span></div>
                    )}
                    <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                    <div className="flex justify-between text-lg font-display pt-3 border-t border-white/10"><span>Total</span><span>{formatPrice(subtotalAfterCoupon + shipping)}</span></div>
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
