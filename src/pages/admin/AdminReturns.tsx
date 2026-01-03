import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RotateCcw, Eye, Package } from 'lucide-react';
import { format } from 'date-fns';

interface Return {
  id: string;
  order_id: string;
  order_item_id: string | null;
  customer_id: string;
  product_id: string | null;
  product_name: string;
  reason: string;
  additional_notes: string | null;
  status: string;
  admin_note: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined data
  order?: {
    order_number: string;
    full_name: string;
    email: string;
  };
  product_image?: string;
}

interface OrderItem {
  variant_id: string | null;
  quantity: number;
}

const AdminReturns = () => {
  const queryClient = useQueryClient();
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    admin_note: '',
  });

  const { data: returns, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          order:orders(order_number, full_name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Fetch product images for returns with product_id
      const returnsWithImages = await Promise.all((data || []).map(async (returnItem) => {
        if (returnItem.product_id) {
          const { data: images } = await supabase
            .from('product_images')
            .select('url')
            .eq('product_id', returnItem.product_id)
            .eq('is_primary', true)
            .limit(1);
          
          return {
            ...returnItem,
            product_image: images?.[0]?.url
          };
        }
        return returnItem;
      }));
      
      return returnsWithImages as Return[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_note, returnItem }: { id: string; status: string; admin_note: string; returnItem: Return }) => {
      const previousStatus = returnItem.status;
      
      // If status is changing to 'completed' (return received/successful), release reserved stock
      if (status === 'completed' && previousStatus !== 'completed') {
        // Get order items to find variant_id
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('variant_id, quantity')
          .eq('order_id', returnItem.order_id);
        
        if (orderItems) {
          for (const item of orderItems) {
            if (item.variant_id) {
              // Release reserved stock - stock becomes available again
              await supabase.rpc('release_reserved_stock', {
                p_variant_id: item.variant_id,
                p_quantity: item.quantity
              });
            }
          }
        }
        
        // Update order status to 'returned'
        await supabase
          .from('orders')
          .update({ 
            status: 'returned',
            updated_at: new Date().toISOString()
          })
          .eq('id', returnItem.order_id);
        
        // Create notification for customer
        await supabase.from('notifications').insert({
          customer_id: returnItem.customer_id,
          title: 'Return Completed',
          message: `Your return for ${returnItem.product_name} has been processed successfully.`,
          type: 'order',
        });
      }
      
      // If status is changing to 'approved', notify customer
      if (status === 'approved' && previousStatus !== 'approved') {
        await supabase.from('notifications').insert({
          customer_id: returnItem.customer_id,
          title: 'Return Approved',
          message: `Your return request for ${returnItem.product_name} has been approved. Please ship the item back.`,
          type: 'order',
        });
      }
      
      // If status is changing to 'rejected', notify customer
      if (status === 'rejected' && previousStatus !== 'rejected') {
        await supabase.from('notifications').insert({
          customer_id: returnItem.customer_id,
          title: 'Return Rejected',
          message: `Your return request for ${returnItem.product_name} has been rejected. ${admin_note ? `Reason: ${admin_note}` : ''}`,
          type: 'order',
        });
        
        // Reset order status back to delivered if it was return_requested
        await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', returnItem.order_id);
      }

      // Update the return record
      const { error } = await supabase.from('returns').update({
        status,
        admin_note: admin_note || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      toast.success('Return request updated');
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update return request');
    },
  });

  const openDetails = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setUpdateForm({
      status: returnItem.status,
      admin_note: returnItem.admin_note || '',
    });
    setDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedReturn) return;
    updateMutation.mutate({
      id: selectedReturn.id,
      status: updateForm.status,
      admin_note: updateForm.admin_note,
      returnItem: selectedReturn,
    });
  };

  const getStatusBadge = (status: string) => {
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

  // Stats
  const pendingReturns = returns?.filter(r => r.status === 'pending').length || 0;
  const approvedReturns = returns?.filter(r => r.status === 'approved').length || 0;
  const completedReturns = returns?.filter(r => r.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedReturns}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedReturns}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">{returns?.length || 0}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Returns</h1>
        <p className="text-muted-foreground">Manage customer return requests</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : returns?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No return requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns?.map((returnItem) => (
            <Card key={returnItem.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    {returnItem.product_image ? (
                      <img 
                        src={returnItem.product_image} 
                        alt={returnItem.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{returnItem.product_name}</p>
                      {getStatusBadge(returnItem.status)}
                    </div>
                    {returnItem.order && (
                      <p className="text-sm text-muted-foreground">
                        Order: {returnItem.order.order_number} • {returnItem.order.full_name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      Reason: {returnItem.reason}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested: {format(new Date(returnItem.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={() => openDetails(returnItem)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              {/* Product with image */}
              <div className="flex gap-4 p-4 bg-muted rounded-lg">
                <div className="w-16 h-16 rounded overflow-hidden bg-background flex-shrink-0">
                  {selectedReturn.product_image ? (
                    <img 
                      src={selectedReturn.product_image} 
                      alt={selectedReturn.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedReturn.product_name}</p>
                  {selectedReturn.order && (
                    <p className="text-sm text-muted-foreground">
                      Order: {selectedReturn.order.order_number}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Customer: {selectedReturn.order?.full_name || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p>{selectedReturn.reason}</p>
                </div>
                {selectedReturn.additional_notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Notes</p>
                    <p className="text-sm">{selectedReturn.additional_notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Requested</p>
                  <p className="text-sm">{format(new Date(selectedReturn.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved (Awaiting Item)</SelectItem>
                    <SelectItem value="completed">Completed (Item Received - Stock Restored)</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Setting to "Completed" will restore reserved stock and mark the order as returned.
                </p>
              </div>

              <div>
                <Label>Admin Note</Label>
                <Textarea
                  value={updateForm.admin_note}
                  onChange={(e) => setUpdateForm({ ...updateForm, admin_note: e.target.value })}
                  placeholder="Add a note for the customer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdate} className="flex-1" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReturns;