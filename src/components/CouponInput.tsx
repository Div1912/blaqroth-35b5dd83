import { useState } from 'react';
import { Ticket, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/formatCurrency';

interface CouponInputProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount: number | null;
  discountAmount: number;
}

export function CouponInput({ subtotal, appliedCoupon, onApply, onRemove }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())
      .maybeSingle();

    if (error || !coupon) {
      toast.error('Invalid or expired coupon code');
      setLoading(false);
      return;
    }

    // Check minimum order value
    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      toast.error(`Minimum order value of ${formatPrice(coupon.min_order_value)} required`);
      setLoading(false);
      return;
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      toast.error('This coupon has reached its usage limit');
      setLoading(false);
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    onApply({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type as 'percentage' | 'flat',
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount,
      discountAmount,
    });

    toast.success(`Coupon applied! You save ${formatPrice(discountAmount)}`);
    setCode('');
    setLoading(false);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Check className="h-5 w-5 text-primary" />
          <div>
            <span className="font-mono font-bold text-primary">{appliedCoupon.code}</span>
            <p className="text-sm text-muted-foreground">
              -{formatPrice(appliedCoupon.discountAmount)} discount applied
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="pl-10 uppercase bg-secondary/50"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
      </div>
      <Button variant="glass" onClick={handleApply} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
      </Button>
    </div>
  );
}
