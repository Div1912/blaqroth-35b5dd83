-- ============================================
-- STRICT INVENTORY MANAGEMENT WITH RETURN-AWARE STOCK
-- ============================================

-- 1. Add total_stock and reserved_stock to product_variants
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS total_stock integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserved_stock integer NOT NULL DEFAULT 0;

-- Migrate existing stock_quantity to total_stock
UPDATE public.product_variants 
SET total_stock = COALESCE(stock_quantity, 0),
    reserved_stock = 0
WHERE total_stock = 0;

-- 2. Add UNIQUE constraint on returns.order_id to prevent duplicate returns
ALTER TABLE public.returns
DROP CONSTRAINT IF EXISTS returns_order_id_unique;

ALTER TABLE public.returns
ADD CONSTRAINT returns_order_id_unique UNIQUE (order_id);

-- 3. Add quantity column to returns for tracking returned quantities
ALTER TABLE public.returns
ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- 4. Add order status values for return flow
-- order.status can be: pending, processing, completed, cancelled, return_requested, returned

-- 5. Create atomic function to reserve stock on checkout
CREATE OR REPLACE FUNCTION public.reserve_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only reserve if variant_id is provided
  IF NEW.variant_id IS NOT NULL THEN
    -- Atomic update: check available stock and reserve
    UPDATE public.product_variants
    SET reserved_stock = reserved_stock + NEW.quantity
    WHERE id = NEW.variant_id 
      AND (total_stock - reserved_stock) >= NEW.quantity;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient available stock for variant %. Cannot reserve % units.', NEW.variant_id, NEW.quantity;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create function to release reserved stock on cancellation
CREATE OR REPLACE FUNCTION public.release_reserved_stock(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.product_variants
  SET reserved_stock = GREATEST(0, reserved_stock - p_quantity)
  WHERE id = p_variant_id;
END;
$$;

-- 7. Create function to finalize sale (return window expired)
CREATE OR REPLACE FUNCTION public.finalize_sale(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Decrease both total_stock and reserved_stock
  UPDATE public.product_variants
  SET total_stock = GREATEST(0, total_stock - p_quantity),
      reserved_stock = GREATEST(0, reserved_stock - p_quantity)
  WHERE id = p_variant_id;
END;
$$;

-- 8. Drop old trigger and create new one for stock reservation
DROP TRIGGER IF EXISTS deduct_stock_on_order_trigger ON public.order_items;

CREATE TRIGGER reserve_stock_on_order_trigger
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.reserve_stock_on_order();

-- 9. Create a view for available stock (convenience)
CREATE OR REPLACE VIEW public.product_variants_with_availability AS
SELECT 
  id,
  product_id,
  color,
  size,
  sku,
  price_adjustment,
  total_stock,
  reserved_stock,
  (total_stock - reserved_stock) AS available_stock,
  created_at
FROM public.product_variants;

-- 10. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);

-- 11. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.release_reserved_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_sale TO authenticated;
GRANT SELECT ON public.product_variants_with_availability TO anon, authenticated;