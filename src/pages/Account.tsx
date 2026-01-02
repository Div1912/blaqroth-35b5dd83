import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Heart, Edit2, Save, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { AddressManager } from '@/components/AddressManager';
import { BackButton } from '@/components/BackButton';
import { OrderTrackingTimeline } from '@/components/OrderTrackingTimeline';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWishlistStore } from '@/store/wishlistStore';
import { useProducts } from '@/hooks/useProducts';
import { useReturns, useCreateReturn } from '@/hooks/useReturns';
import { formatPrice } from '@/lib/formatCurrency';
import { countryCodes } from '@/lib/countryCodes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  fulfillment_status: string;
  delivery_mode: string;
  shipping_partner: string | null;
  tracking_id: string | null;
  total: number;
  created_at: string;
  payment_method: string;
  cancellation_reason: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  variant_details: string | null;
  color: string | null;
  size: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist' | 'returns'>('profile');
  
  // Returns data
  const { data: returns, isLoading: returnsLoading } = useReturns();
  
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  // Wishlist - using DB products
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const { data: allProducts } = useProducts();
  const wishlistProducts = (allProducts || []).filter(p => wishlistItems.includes(p.id));

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

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    setOrders((data || []) as Order[]);
    setOrdersLoading(false);
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    setOrderItems((data || []) as OrderItem[]);
    setOrderDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          fulfillment_status: 'cancelled',
          status: 'cancelled',
          cancellation_reason: cancelReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Create notification for admin
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          customer_id: admin.user_id,
          title: 'Order Cancelled',
          message: `Order ${selectedOrder.order_number} has been cancelled. Reason: ${cancelReason}`,
          type: 'order'
        }));

        await supabase.from('notifications').insert(notifications);
      }

      toast.success('Order cancelled successfully');
      setSelectedOrder({ ...selectedOrder, fulfillment_status: 'cancelled', status: 'cancelled', cancellation_reason: cancelReason });
      setShowCancelDialog(false);
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
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

      setProfile({ ...editForm });
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

  const getFulfillmentBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'packed': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
    { id: 'returns', label: 'Returns', icon: RotateCcw },
  ];

  const getReturnStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
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
                      {wishlistProducts.map((product) => {
                        const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
                        return (
                          <div key={product.id} className="glass-panel p-4 flex gap-4">
                            <Link to={`/product/${product.slug}`} className="w-20 h-24 bg-secondary/20 rounded overflow-hidden flex-shrink-0">
                              <img src={primaryImage?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${product.slug}`} className="font-medium truncate block hover:text-primary transition-colors">
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
                        );
                      })}
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
                        <button 
                          onClick={() => viewOrderDetails(order)} 
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Package className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getFulfillmentBadgeColor(order.fulfillment_status || 'pending')}`}>
                              {order.fulfillment_status || 'pending'}
                            </span>
                            <span className="font-medium">{formatPrice(order.total)}</span>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'returns' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {returnsLoading ? (
                  <div className="glass-panel p-8 text-center"><p>Loading returns...</p></div>
                ) : !returns || returns.length === 0 ? (
                  <div className="glass-panel p-8 text-center">
                    <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-display text-2xl tracking-wider mb-2">No Return Requests</h2>
                    <p className="text-muted-foreground mb-6">
                      You haven't requested any returns yet. You can request a return from your order details.
                    </p>
                    <Button variant="glass-gold" onClick={() => setActiveTab('orders')}>
                      View Orders
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-2xl tracking-wider">Return Requests</h2>
                      <span className="text-muted-foreground">{returns.length} requests</span>
                    </div>
                    {returns.map((returnItem) => (
                      <div key={returnItem.id} className="glass-panel p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-medium">{returnItem.product_name}</p>
                              {getReturnStatusBadge(returnItem.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Reason:</span> {returnItem.reason}
                            </p>
                            {returnItem.additional_notes && (
                              <p className="text-sm text-muted-foreground mb-1">
                                <span className="font-medium">Notes:</span> {returnItem.additional_notes}
                              </p>
                            )}
                            {returnItem.admin_note && (
                              <div className="mt-3 p-3 bg-muted/50 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Admin Response:</p>
                                <p className="text-sm">{returnItem.admin_note}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {format(new Date(returnItem.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Tracking Timeline */}
              <OrderTrackingTimeline 
                order={selectedOrder} 
                onCancel={() => setShowCancelDialog(true)}
              />

              {/* Cancellation Reason */}
              {selectedOrder.cancellation_reason && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded">
                  <p className="text-sm font-medium text-destructive mb-1">Cancellation Reason</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.cancellation_reason}</p>
                </div>
              )}

              {/* View Full Tracking Link */}
              <Button variant="glass" asChild className="w-full">
                <Link to={`/order/${selectedOrder.order_number}`}>
                  View Full Order Details
                </Link>
              </Button>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm p-3 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {(item.color || item.size) && (
                          <p className="text-muted-foreground text-xs">
                            {item.color}{item.color && item.size && ' / '}{item.size}
                          </p>
                        )}
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold text-lg pt-4 border-t border-white/10">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Please provide a reason for cancellation:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
            />
            <div className="flex gap-3">
              <Button variant="glass" onClick={() => setShowCancelDialog(false)} className="flex-1">
                Keep Order
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelling}
                className="flex-1"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Account;
