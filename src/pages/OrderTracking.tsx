import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { OrderTrackingTimeline } from '@/components/OrderTrackingTimeline';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatCurrency';
import { format } from 'date-fns';

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
  shipping_address_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  full_name: string;
  phone: string;
  cancellation_reason: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
}

interface StatusHistory {
  id: string;
  old_status: string | null;
  new_status: string;
  old_fulfillment_status: string | null;
  new_fulfillment_status: string | null;
  created_at: string;
  notes: string | null;
}

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!authLoading && user && orderNumber) {
      fetchOrder();
    }
  }, [user, authLoading, orderNumber]);

  // Real-time order updates
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const fetchOrder = async () => {
    if (!user || !orderNumber) return;

    setLoading(true);
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('customer_id', user.id)
      .single();

    if (orderError || !orderData) {
      setLoading(false);
      return;
    }

    setOrder(orderData as Order);

    // Fetch order items
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id);
    setOrderItems((itemsData || []) as OrderItem[]);

    // Fetch status history
    const { data: historyData } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderData.id)
      .order('created_at', { ascending: false });
    setStatusHistory((historyData || []) as StatusHistory[]);

    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) return;

    setCancelling(true);
    try {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          fulfillment_status: 'cancelled',
          cancellation_reason: cancelReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Create notification for admin
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          customer_id: admin.user_id,
          title: 'Order Cancelled',
          message: `Order ${order.order_number} has been cancelled. Reason: ${cancelReason}`,
          type: 'order'
        }));

        await supabase.from('notifications').insert(notifications);
      }

      setOrder(prev => prev ? { ...prev, status: 'cancelled', fulfillment_status: 'cancelled', cancellation_reason: cancelReason } : null);
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="glass-panel p-10 max-w-md text-center">
            <Package className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="font-display text-3xl mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">Please sign in to track your order.</p>
            <Button variant="hero" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground scrollProgress={scrollProgress} />
        <Header />
        <CartDrawer />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="glass-panel p-10 max-w-md text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="font-display text-3xl mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">We couldn't find this order.</p>
            <Button variant="glass-gold" asChild>
              <Link to="/account">View All Orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canCancel = ['pending', 'packed'].includes(order.fulfillment_status || 'pending') && order.status !== 'cancelled';

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />
      <CartDrawer />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Order Header */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-display text-3xl tracking-wider">Order #{order.order_number}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.fulfillment_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-primary/20 text-primary'
                }`}>
                  {order.fulfillment_status}
                </span>
              </div>
              <p className="text-muted-foreground">
                Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
              </p>
            </div>

            {/* Tracking Timeline */}
            <div className="glass-panel p-6">
              <h2 className="font-display text-xl mb-6">Order Status</h2>
              <OrderTrackingTimeline 
                order={order} 
                onCancel={canCancel ? () => setShowCancelDialog(true) : undefined}
              />
            </div>

            {/* Cancellation Reason */}
            {order.cancellation_reason && (
              <div className="glass-panel p-6 border-destructive/30 bg-destructive/5">
                <h3 className="font-medium text-destructive mb-2">Cancellation Reason</h3>
                <p className="text-muted-foreground">{order.cancellation_reason}</p>
              </div>
            )}

            {/* Status History */}
            {statusHistory.length > 0 && (
              <div className="glass-panel p-6">
                <h2 className="font-display text-xl mb-4">Status History</h2>
                <div className="space-y-3">
                  {statusHistory.map((history) => (
                    <div key={history.id} className="flex justify-between items-start p-3 bg-muted/20 rounded">
                      <div>
                        <p className="font-medium capitalize">{history.new_fulfillment_status || history.new_status}</p>
                        {history.notes && <p className="text-sm text-muted-foreground">{history.notes}</p>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(history.created_at), 'MMM dd, hh:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="glass-panel p-6">
              <h2 className="font-display text-xl mb-4">Items</h2>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-muted/20 rounded">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {(item.color || item.size) && (
                        <p className="text-sm text-muted-foreground">
                          {item.color}{item.color && item.size && ' / '}{item.size}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 mt-4 border-t border-white/10">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass-panel p-6">
              <h2 className="font-display text-xl mb-4">Shipping Address</h2>
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">{order.full_name}</p>
                <p>{order.phone}</p>
                <p>{order.shipping_address_line1}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl mb-4">Cancel Order</h3>
            <p className="text-muted-foreground mb-4">Please provide a reason for cancellation:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] mb-4"
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
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderTracking;