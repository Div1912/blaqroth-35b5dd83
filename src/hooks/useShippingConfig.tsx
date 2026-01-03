import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { CACHE_TIMES, QUERY_KEYS } from '@/lib/queryConfig';
import { fetchShippingConfig } from '@/lib/data/content';

export function useShippingConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.shippingConfig,
    queryFn: fetchShippingConfig,
    staleTime: CACHE_TIMES.STATIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}

export function getEstimatedDeliveryDate(config: Record<string, string> | undefined, isExpress = false): string {
  if (!config) return 'Loading...';
  
  const deliveryDays = isExpress 
    ? config.express_delivery_days || '2-3'
    : config.standard_delivery_days || '5-7';
  
  const [minDays, maxDays] = deliveryDays.split('-').map(Number);
  const startDate = addDays(new Date(), minDays);
  const endDate = addDays(new Date(), maxDays);
  
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
}

export function getReturnWindow(config: Record<string, string> | undefined): number {
  if (!config) return 7;
  return parseInt(config.return_window_days || '7', 10);
}

export function getReturnPolicy(config: Record<string, string> | undefined): string {
  if (!config) return 'Easy returns within 7 days of delivery';
  return config.return_policy || 'Easy returns within 7 days of delivery';
}

export function getFreeShippingThreshold(config: Record<string, string> | undefined): number {
  if (!config) return 2999;
  return parseInt(config.free_shipping_threshold || '2999', 10);
}

export function getShippingCost(config: Record<string, string> | undefined): number {
  if (!config) return 99;
  return parseInt(config.shipping_cost || '99', 10);
}
