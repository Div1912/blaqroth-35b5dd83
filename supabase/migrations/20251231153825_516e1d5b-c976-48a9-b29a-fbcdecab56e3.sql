-- Remove the insecure policy
DROP POLICY IF EXISTS "Authenticated users can update stock on purchase" ON public.product_variants;

-- Create a security definer function to deduct stock automatically
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only deduct if variant_id is provided
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.variant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically deduct stock when order items are inserted
DROP TRIGGER IF EXISTS deduct_stock_trigger ON public.order_items;
CREATE TRIGGER deduct_stock_trigger
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.deduct_stock_on_order();