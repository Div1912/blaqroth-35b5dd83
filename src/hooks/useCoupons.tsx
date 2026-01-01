import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number | null;
  max_discount: number | null;
  description: string | null;
  start_date: string;
  end_date: string;
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: ['active-coupons'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, min_order_value, max_discount, description, start_date, end_date')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('discount_value', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
