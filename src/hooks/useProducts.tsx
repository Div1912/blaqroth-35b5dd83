import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES, QUERY_KEYS } from '@/lib/queryConfig';
import { 
  fetchProducts, 
  fetchProduct, 
  fetchActiveOffers, 
  fetchCategories,
  type DBProduct,
  type FetchProductsOptions 
} from '@/lib/data/products';

// Re-export types for backward compatibility
export type { DBProduct, FetchProductsOptions };

export interface ProductOffer {
  id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  applies_to: 'all' | 'products' | 'variants';
}

export const useProducts = (options?: FetchProductsOptions) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, options],
    queryFn: () => fetchProducts(options),
    staleTime: CACHE_TIMES.PUBLIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: () => fetchProduct(slug),
    staleTime: CACHE_TIMES.PUBLIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
    enabled: !!slug,
  });
};

export const useActiveOffers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeOffers,
    queryFn: fetchActiveOffers,
    staleTime: CACHE_TIMES.PUBLIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: fetchCategories,
    staleTime: CACHE_TIMES.STATIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

// Helper to calculate discounted price
export const calculateDiscountedPrice = (
  basePrice: number,
  priceAdjustment: number | null,
  offers: any[],
  productId: string,
  variantId?: string
): { finalPrice: number; originalPrice: number; discount: number; offerTitle?: string } => {
  const variantPrice = basePrice + (priceAdjustment || 0);
  let bestDiscount = 0;
  let bestOfferTitle: string | undefined;

  for (const offer of offers) {
    let applies = false;

    // Check if offer applies to this product/variant
    if (offer.applies_to === 'all') {
      applies = true;
    } else if (offer.applies_to === 'variants' && variantId) {
      applies = offer.offer_variants?.some((ov: any) => ov.variant_id === variantId);
    } else if (offer.applies_to === 'products') {
      applies = offer.offer_products?.some((op: any) => op.product_id === productId);
    }

    if (applies) {
      let discountAmount = 0;
      if (offer.discount_type === 'percentage') {
        discountAmount = variantPrice * (offer.discount_value / 100);
      } else {
        discountAmount = offer.discount_value;
      }

      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        bestOfferTitle = offer.title;
      }
    }
  }

  return {
    originalPrice: variantPrice,
    finalPrice: variantPrice - bestDiscount,
    discount: bestDiscount,
    offerTitle: bestOfferTitle,
  };
};
