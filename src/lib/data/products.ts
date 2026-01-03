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

export interface FetchProductsOptions {
  featured?: boolean;
  categorySlug?: string;
  collectionSlug?: string;
}

// Centralized product fetching function
export async function fetchProducts(options?: FetchProductsOptions): Promise<DBProduct[]> {
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
}

// Fetch single product by slug
export async function fetchProduct(slug: string): Promise<DBProduct> {
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
}

// Fetch active offers
export async function fetchActiveOffers() {
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
}

// Fetch categories
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}
