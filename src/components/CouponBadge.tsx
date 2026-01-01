import { Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatPrice } from '@/lib/formatCurrency';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number | null;
  description: string | null;
}

interface CouponBadgeProps {
  coupons: Coupon[];
}

export function CouponBadge({ coupons }: CouponBadgeProps) {
  if (!coupons || coupons.length === 0) return null;

  const bestCoupon = coupons[0]; // First coupon (could be best offer)

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    }
    return `${formatPrice(coupon.discount_value)} OFF`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className="bg-green-600/90 hover:bg-green-600 text-white cursor-pointer gap-1 text-xs"
          >
            <Ticket className="h-3 w-3" />
            {getDiscountText(bestCoupon)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-background border border-border p-3 max-w-xs"
        >
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Use code at checkout:</p>
            {coupons.slice(0, 3).map((coupon) => (
              <div key={coupon.id} className="flex items-center gap-2">
                <code className="px-2 py-1 bg-primary/20 text-primary font-mono font-bold rounded text-sm">
                  {coupon.code}
                </code>
                <span className="text-muted-foreground text-sm">
                  {getDiscountText(coupon)}
                  {coupon.min_order_value && coupon.min_order_value > 0 && (
                    <span className="block text-xs">Min: {formatPrice(coupon.min_order_value)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
