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
    }: {
      orderId: string;
      orderItemId?: string;
      productId?: string;
      productName: string;
      reason: string;
      additionalNotes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
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
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });
}
