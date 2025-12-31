import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Heart, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { AddressManager } from '@/components/AddressManager';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/hooks/useAuth';
import { useWishlistStore } from '@/store/wishlistStore';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/formatCurrency';
import { countryCodes } from '@/lib/countryCodes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CustomerProfile {
  full_name: string | null;
  email: string;
  phone: string | null;
  phone_country_code: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  variant_details: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist'>('profile');
  
  // Profile editing state
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CustomerProfile>({
    full_name: '',
    email: '',
    phone: '',
    phone_country_code: '+91',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  
  // Wishlist
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const wishlistProducts = products.filter(p => wishlistItems.includes(p.id));

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch customer profile
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setOrdersLoading(false);
  };

  const toggleOrderDetails = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('customers')
      .select('full_name, email, phone, phone_country_code')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to load profile:', error);
      // Set defaults from auth user
      setProfile({
        full_name: user.user_metadata?.full_name || null,
        email: user.email || '',
        phone: null,
        phone_country_code: '+91',
      });
    } else {
      setProfile(data);
      setEditForm({
        full_name: data.full_name || '',
        email: data.email,
        phone: data.phone || '',
        phone_country_code: data.phone_country_code || '+91',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          phone_country_code: editForm.phone_country_code,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...editForm,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

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
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'orders', label: 'Orders', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          {/* Back Button */}
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
            <div className="glass-panel p-2 mb-8 flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded transition-all whitespace-nowrap ${
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl tracking-wider">Profile Details</h2>
                  {!isEditing ? (
                    <Button variant="glass" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button variant="glass-gold" size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                        <Save className="h-4 w-4 mr-1" />
                        {savingProfile ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editForm.full_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        disabled
                        className="w-full bg-secondary/30 border border-white/10 rounded px-4 py-3 text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={editForm.phone_country_code || '+91'}
                          onChange={(e) => setEditForm({ ...editForm, phone_country_code: e.target.value })}
                          className="w-28 bg-secondary/50 border border-white/10 rounded px-3 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {countryCodes.map((cc) => (
                            <option key={cc.code} value={cc.code}>
                              {cc.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="9876543210"
                          className="flex-1 bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Full Name</label>
                      <p className="text-foreground">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Email</label>
                      <p className="text-foreground">{profile?.email || user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Phone</label>
                      <p className="text-foreground">
                        {profile?.phone 
                          ? `${profile.phone_country_code || '+91'} ${profile.phone}`
                          : 'Not set'}
                      </p>
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
                )}
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

            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {wishlistProducts.length === 0 ? (
                  <div className="glass-panel p-8 text-center">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-display text-2xl tracking-wider mb-2">Your Wishlist is Empty</h2>
                    <p className="text-muted-foreground mb-6">
                      Save items you love by clicking the heart icon on products.
                    </p>
                    <Button variant="glass-gold" asChild>
                      <Link to="/shop">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-2xl tracking-wider">My Wishlist</h2>
                      <span className="text-muted-foreground">{wishlistProducts.length} items</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistProducts.map((product) => (
                        <div key={product.id} className="glass-panel p-4 flex gap-4">
                          <Link to={`/product/${product.id}`} className="w-20 h-24 bg-secondary/20 rounded overflow-hidden flex-shrink-0">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${product.id}`} className="font-medium truncate block hover:text-primary transition-colors">
                              {product.name}
                            </Link>
                            <p className="text-primary font-display mt-1">{formatPrice(product.price)}</p>
                            <button
                              onClick={() => {
                                removeFromWishlist(product.id);
                                toast.success('Removed from wishlist');
                              }}
                              className="text-sm text-muted-foreground hover:text-red-500 mt-2 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {ordersLoading ? (
                  <div className="glass-panel p-8 text-center"><p>Loading orders...</p></div>
                ) : orders.length === 0 ? (
                  <div className="glass-panel p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-display text-2xl tracking-wider mb-2">No Orders Yet</h2>
                    <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
                    <Button variant="glass-gold" asChild><Link to="/shop">Start Shopping</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="glass-panel overflow-hidden">
                        <button onClick={() => toggleOrderDetails(order.id)} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <Package className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{order.status}</span>
                            <span className="font-medium">{formatPrice(order.total)}</span>
                            {expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </button>
                        {expandedOrder === order.id && orderItems[order.id] && (
                          <div className="border-t border-white/10 p-4 space-y-2">
                            {orderItems[order.id].map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product_name} {item.variant_details && `(${item.variant_details})`} × {item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
