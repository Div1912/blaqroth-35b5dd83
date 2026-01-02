-- Fix race condition in stock deduction - make it atomic with proper error handling
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Only deduct if variant_id is provided
  IF NEW.variant_id IS NOT NULL THEN
    -- Atomic update with stock check - only succeeds if sufficient stock exists
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.variant_id 
      AND stock_quantity >= NEW.quantity;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    -- If no rows were updated, it means insufficient stock
    IF updated_rows = 0 THEN
      RAISE EXCEPTION 'Insufficient stock for variant %. Cannot fulfill order for % units.', NEW.variant_id, NEW.quantity;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;