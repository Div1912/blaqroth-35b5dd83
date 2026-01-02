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
import { RotateCcw, Eye } from 'lucide-react';
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
  created_at: string;
  updated_at: string;
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
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Return[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_note }: { id: string; status: string; admin_note: string }) => {
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
    onError: () => toast.error('Failed to update return request'),
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

  return (
    <div className="space-y-6">
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{returnItem.product_name}</p>
                      {getStatusBadge(returnItem.status)}
                    </div>
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
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Product</p>
                  <p className="font-medium">{selectedReturn.product_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedReturn.order_id}</p>
                </div>
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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
