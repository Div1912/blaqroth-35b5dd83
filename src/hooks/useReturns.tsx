import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Return {
  id: string;
  order_id: string;
  order_item_id: string | null;
  customer_id: string;
  product_id: string | null;
  product_name: string;
  reason: string;
  additional_notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_note: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export function useReturns() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['returns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Return[];
    },
    enabled: !!user,
  });
}

// Check if an order already has a return request
export function useHasOrderReturn(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order-return', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from('returns')
        .select('id, status')
        .eq('order_id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      orderId,
      orderItemId,
      productId,
      productName,
      reason,
      additionalNotes,
      quantity = 1,
    }: {
      orderId: string;
      orderItemId?: string;
      productId?: string;
      productName: string;
      reason: string;
      additionalNotes?: string;
      quantity?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if return already exists for this order (DB has UNIQUE constraint but check early)
      const { data: existingReturn } = await supabase
        .from('returns')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();
      
      if (existingReturn) {
        throw new Error('A return request already exists for this order');
      }
      
      // Create return request
      const { data, error } = await supabase
        .from('returns')
        .insert({
          order_id: orderId,
          order_item_id: orderItemId || null,
          customer_id: user.id,
          product_id: productId || null,
          product_name: productName,
          reason,
          additional_notes: additionalNotes || null,
          status: 'pending',
          quantity,
        })
        .select()
        .single();
      
      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          throw new Error('A return request already exists for this order');
        }
        throw error;
      }
      
      // Update order status to return_requested
      await supabase
        .from('orders')
        .update({ 
          status: 'return_requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['order-return'] });
    },
  });
}
