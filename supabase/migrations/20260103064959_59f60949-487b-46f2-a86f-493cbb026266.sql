-- Drop the security definer view - we'll calculate available_stock in application code
DROP VIEW IF EXISTS public.product_variants_with_availability;