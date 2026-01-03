import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Truck, Package, Clock, CheckCircle, XCircle, History, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';
import { format } from 'date-fns';

interface OrderItemSummary {
  order_id: string;
  product_name: string;
  quantity: number;
  color: string | null;
  size: string | null;
}

interface Order {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  status: string;
  fulfillment_status: string;
  delivery_mode: string;
  shipping_partner: string | null;
  tracking_id: string | null;
  payment_status: string;
  payment_method: string;
  created_at: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  items?: OrderItemSummary[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant_details: string | null;
  color: string | null;
  size: string | null;
  sku: string | null;
}

interface StatusHistory {
  id: string;
  old_status: string | null;
  new_status: string | null;
  old_fulfillment_status: string | null;
  new_fulfillment_status: string | null;
  created_at: string;
}

const fulfillmentStatuses = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-gray-100 text-gray-700' },
  { value: 'packed', label: 'Packed', icon: Package, color: 'bg-purple-100 text-purple-700' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' },
  { value: 'return_requested', label: 'Return Requested', icon: Clock, color: 'bg-orange-100 text-orange-700' },
  { value: 'returned', label: 'Returned', icon: RotateCcw, color: 'bg-gray-100 text-gray-700' },
];

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Delivery form
  const [deliveryMode, setDeliveryMode] = useState<'self' | 'courier'>('self');
  const [shippingPartner, setShippingPartner] = useState('');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time order updates
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    // Fetch orders with their items to show product summary
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      toast.error('Failed to fetch orders');
      setLoading(false);
      return;
    }

    // Fetch all order items for these orders
    const orderIds = (ordersData || []).map(o => o.id);
    if (orderIds.length > 0) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('order_id, product_name, quantity, color, size')
        .in('order_id', orderIds);

      // Create a map of order_id to items
      const itemsMap: Record<string, typeof itemsData> = {};
      (itemsData || []).forEach(item => {
        if (!itemsMap[item.order_id]) {
          itemsMap[item.order_id] = [];
        }
        itemsMap[item.order_id].push(item);
      });

      // Attach items to orders
      const ordersWithItems = (ordersData || []).map(order => ({
        ...order,
        items: itemsMap[order.id] || []
      }));

      setOrders(ordersWithItems);
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  const sendOrderStatusEmail = async (order: Order, newStatus: string) => {
    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No active session for sending email');
        return;
      }

      const response = await fetch(
        'https://fiflsgymviowunqnegch.supabase.co/functions/v1/send-order-status-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: order.email,
            customerName: order.full_name,
            orderNumber: order.order_number,
            newStatus,
            trackingId: order.tracking_id,
            shippingPartner: order.shipping_partner,
          }),
        }
      );
      
      if (response.ok) {
        // Log only in development
        if (import.meta.env.DEV) {
          console.log('Order status email sent successfully');
        }
      } else {
        // Don't expose internal errors in production
        if (import.meta.env.DEV) {
          console.error('Failed to send order status email');
        }
      }
    } catch (error) {
      // Don't expose internal errors in production
      if (import.meta.env.DEV) {
        console.error('Error sending order status email:', error);
      }
    }
  };

  const handleFulfillmentChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Validation for courier delivery
    if (newStatus === 'shipped' && order.delivery_mode === 'courier') {
      if (!order.tracking_id || !order.shipping_partner) {
        toast.error('Please set courier partner and tracking ID before marking as shipped');
        return;
      }
    }

    // Skip shipped status for self delivery
    if (newStatus === 'shipped' && order.delivery_mode === 'self') {
      toast.error('Self delivery orders cannot be marked as shipped. Use "Delivered" instead.');
      return;
    }

    // Release reserved stock if order is being cancelled
    if (newStatus === 'cancelled' && order.fulfillment_status !== 'cancelled') {
      // Fetch order items to release reserved stock
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', orderId);

      if (orderItems) {
        for (const item of orderItems) {
          if (item.variant_id) {
            // Release reserved stock using atomic function
            await supabase.rpc('release_reserved_stock', {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity
            });
          }
        }
        toast.success('Reserved stock has been released for cancelled order');
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        fulfillment_status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update fulfillment status');
    } else {
      toast.success(`Order marked as ${newStatus}`);
      
      // Send email notification for shipped/delivered status
      if (newStatus === 'shipped' || newStatus === 'delivered') {
        sendOrderStatusEmail(order, newStatus);
      }
      
      // Create notification for customer
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('email', order.email)
        .maybeSingle();

      if (customerData) {
        let message = `Your order ${order.order_number} is now ${newStatus}`;
        if (newStatus === 'shipped' && order.tracking_id) {
          message += `. Track with: ${order.shipping_partner} - ${order.tracking_id}`;
        }
        if (newStatus === 'cancelled') {
          message = `Your order ${order.order_number} has been cancelled`;
        }
        
        await supabase.from('notifications').insert({
          customer_id: customerData.id,
          title: 'Order Update',
          message,
          type: 'order',
        });
      }
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update payment status');
    } else {
      toast.success(`Payment status updated to ${newStatus}`);
    }
  };

  const handleUpdateDeliveryInfo = async () => {
    if (!selectedOrder) return;

    const updateData: any = {
      delivery_mode: deliveryMode,
      updated_at: new Date().toISOString(),
    };

    if (deliveryMode === 'courier') {
      if (!shippingPartner || !trackingId) {
        toast.error('Please enter courier partner and tracking ID');
        return;
      }
      updateData.shipping_partner = shippingPartner;
      updateData.tracking_id = trackingId;
    } else {
      updateData.shipping_partner = null;
      updateData.tracking_id = null;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', selectedOrder.id);

    if (error) {
      toast.error('Failed to update delivery info');
    } else {
      toast.success('Delivery information updated');
      setSelectedOrder({ ...selectedOrder, ...updateData });
      fetchOrders();
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDeliveryMode((order.delivery_mode as 'self' | 'courier') || 'self');
    setShippingPartner(order.shipping_partner || '');
    setTrackingId(order.tracking_id || '');
    
    const [itemsResult, historyResult] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', order.id),
      supabase.from('order_status_history').select('*').eq('order_id', order.id).order('created_at', { ascending: false }),
    ]);
    
    setOrderItems(itemsResult.data || []);
    setStatusHistory(historyResult.data || []);
    setActiveTab('details');
    setDetailsOpen(true);
  };

  const getFulfillmentColor = (status: string) => {
    return fulfillmentStatuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const getPaymentColor = (status: string) => {
    return paymentStatuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const getAvailableFulfillmentStatuses = (order: Order) => {
    if (order.delivery_mode === 'self') {
      return fulfillmentStatuses.filter(s => s.value !== 'shipped');
    }
    return fulfillmentStatuses;
  };

  // Stats
  const pendingOrders = orders.filter(o => o.fulfillment_status === 'pending').length;
  const packedOrders = orders.filter(o => o.fulfillment_status === 'packed').length;
  const shippedOrders = orders.filter(o => o.fulfillment_status === 'shipped').length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Packed</p>
                <p className="text-2xl font-bold">{packedOrders}</p>
              </div>
              <Package className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">{shippedOrders}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <h1 className="text-3xl font-bold text-foreground">Orders</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-muted-foreground"> x{item.quantity}</span>
                            {(item.color || item.size) && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({[item.color, item.size].filter(Boolean).join(' / ')})
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.payment_status}
                      onValueChange={(value) => handlePaymentStatusChange(order.id, value)}
                    >
                      <SelectTrigger className={`w-28 ${getPaymentColor(order.payment_status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.fulfillment_status || 'pending'}
                      onValueChange={(value) => handleFulfillmentChange(order.id, value)}
                    >
                      <SelectTrigger className={`w-32 ${getFulfillmentColor(order.fulfillment_status || 'pending')}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableFulfillmentStatuses(order).map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.delivery_mode === 'courier' ? 'default' : 'secondary'}>
                      {order.delivery_mode === 'courier' ? 'Courier' : 'Self'}
                    </Badge>
                    {order.tracking_id && (
                      <p className="text-xs text-muted-foreground mt-1">{order.tracking_id}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => viewOrderDetails(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <p>{selectedOrder.full_name}</p>
                    <p className="text-muted-foreground">{selectedOrder.email}</p>
                    <p className="text-muted-foreground">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <p>{selectedOrder.shipping_address_line1}</p>
                    {selectedOrder.shipping_address_line2 && <p>{selectedOrder.shipping_address_line2}</p>}
                    <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                    <p>{selectedOrder.shipping_postal_code}, {selectedOrder.shipping_country}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>
                              {item.color && <span>{item.color}</span>}
                              {item.size && <span> / {item.size}</span>}
                              {!item.color && !item.size && (item.variant_details || '-')}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="uppercase">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Delivery Mode</Label>
                    <Select value={deliveryMode} onValueChange={(v: 'self' | 'courier') => setDeliveryMode(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self Delivery (Blaqroth)</SelectItem>
                        <SelectItem value="courier">Courier Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {deliveryMode === 'courier' && (
                    <>
                      <div>
                        <Label>Courier Partner</Label>
                        <Input
                          placeholder="e.g., Delhivery, BlueDart"
                          value={shippingPartner}
                          onChange={(e) => setShippingPartner(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Tracking ID / AWB Number</Label>
                        <Input
                          placeholder="Enter tracking number"
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {deliveryMode === 'self' && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Self delivery orders are delivered by Blaqroth team. No tracking ID required.
                      </p>
                    </div>
                  )}

                  <Button onClick={handleUpdateDeliveryInfo} className="w-full">
                    Update Delivery Information
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Status History
                </h3>
                {statusHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No status changes recorded</p>
                ) : (
                  <div className="space-y-3">
                    {statusHistory.map((history) => (
                      <div key={history.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {history.old_fulfillment_status !== history.new_fulfillment_status && (
                              <>
                                Fulfillment: <span className="text-muted-foreground">{history.old_fulfillment_status || 'none'}</span>
                                {' → '}
                                <span className="font-medium">{history.new_fulfillment_status}</span>
                              </>
                            )}
                            {history.old_status !== history.new_status && (
                              <>
                                {history.old_fulfillment_status !== history.new_fulfillment_status && ' | '}
                                Status: <span className="text-muted-foreground">{history.old_status || 'none'}</span>
                                {' → '}
                                <span className="font-medium">{history.new_status}</span>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(history.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
