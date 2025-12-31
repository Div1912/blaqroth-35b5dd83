import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface OrderTrackingTimelineProps {
  order: {
    id: string;
    order_number: string;
    status: string;
    fulfillment_status: string;
    delivery_mode: string;
    shipping_partner: string | null;
    tracking_id: string | null;
    created_at: string;
  };
  onCancel?: () => void;
}

export function OrderTrackingTimeline({ order, onCancel }: OrderTrackingTimelineProps) {
  const isSelfDelivery = order.delivery_mode === 'self';
  const isCancelled = order.fulfillment_status === 'cancelled';
  
  // Define steps based on delivery mode
  const steps = isSelfDelivery
    ? [
        { key: 'pending', label: 'Order Placed', icon: Clock },
        { key: 'packed', label: 'Packed', icon: Package },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
      ]
    : [
        { key: 'pending', label: 'Order Placed', icon: Clock },
        { key: 'packed', label: 'Packed', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
      ];

  const getStepStatus = (stepKey: string) => {
    if (isCancelled) return 'cancelled';
    
    const stepOrder = steps.map(s => s.key);
    const currentIndex = stepOrder.indexOf(order.fulfillment_status || 'pending');
    const stepIndex = stepOrder.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const canCancel = ['pending', 'packed'].includes(order.fulfillment_status || 'pending') && !isCancelled;

  // Get tracking URL based on courier partner
  const getTrackingUrl = () => {
    if (!order.tracking_id || !order.shipping_partner) return null;
    
    const partner = order.shipping_partner.toLowerCase();
    if (partner.includes('delhivery')) {
      return `https://www.delhivery.com/track/package/${order.tracking_id}`;
    } else if (partner.includes('bluedart')) {
      return `https://www.bluedart.com/tracking/${order.tracking_id}`;
    } else if (partner.includes('dtdc')) {
      return `https://www.dtdc.in/tracking/${order.tracking_id}`;
    }
    return null;
  };

  const trackingUrl = getTrackingUrl();

  return (
    <div className="space-y-6">
      {/* Delivery Info */}
      <div className="glass-panel p-4">
        <p className="text-sm text-muted-foreground mb-1">Delivery by</p>
        <p className="font-medium">
          {isSelfDelivery ? 'Blaqroth' : order.shipping_partner || 'Courier Partner'}
        </p>
        {order.tracking_id && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Tracking ID</p>
            <p className="font-mono text-primary">{order.tracking_id}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {isCancelled && (
          <div className="glass-panel p-4 mb-4 border-destructive/50 bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Order Cancelled</span>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            
            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
                
                {/* Icon Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCancelled
                      ? 'bg-destructive/20 text-destructive'
                      : isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </motion.div>
                
                {/* Label */}
                <p className={`mt-2 text-xs text-center ${
                  isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Date */}
      <p className="text-sm text-muted-foreground text-center">
        Ordered on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {trackingUrl && order.fulfillment_status === 'shipped' && (
          <Button variant="glass-gold" asChild className="flex-1">
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Track Package
            </a>
          </Button>
        )}
        
        {canCancel && onCancel && (
          <Button variant="ghost" onClick={onCancel} className="text-destructive hover:text-destructive">
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
