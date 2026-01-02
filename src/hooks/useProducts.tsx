import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  category_id: string | null;
  collection_id: string | null;
  sku: string | null;
  fabric_type: string | null;
  care_instructions: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  product_images: {
    id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
    display_order: number;
  }[];
  product_variants: {
    id: string;
    color: string | null;
    size: string | null;
    sku: string | null;
    price_adjustment: number | null;
    stock_quantity: number | null;
    is_active?: boolean;
  }[];
}

export interface ProductOffer {
  id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  applies_to: 'all' | 'products' | 'variants';
}

export const useProducts = (options?: { featured?: boolean; categorySlug?: string; collectionSlug?: string }) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          collection:collections(id, name, slug),
          product_images(id, url, alt_text, is_primary, display_order),
          product_variants(id, color, size, sku, price_adjustment, stock_quantity)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by collection slug if provided
      let filteredData = data as DBProduct[];
      if (options?.collectionSlug) {
        filteredData = filteredData.filter(p => p.collection?.slug === options.collectionSlug);
      }
      
      return filteredData;
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          product_images(id, url, alt_text, is_primary, display_order),
          product_variants(id, color, size, sku, price_adjustment, stock_quantity)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as DBProduct;
    },
    enabled: !!slug,
  });
};

export const useActiveOffers = () => {
  return useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          offer_products(product_id),
          offer_variants(variant_id)
        `)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (error) throw error;
      return data;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
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
