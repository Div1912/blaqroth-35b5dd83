-- Drop the old deduct_stock_on_order function as it's been replaced by reserve_stock_on_order
DROP FUNCTION IF EXISTS public.deduct_stock_on_order() CASCADE;