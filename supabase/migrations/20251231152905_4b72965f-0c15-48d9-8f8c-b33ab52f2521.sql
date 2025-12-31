-- Remove insecure anonymous cart policies
-- Session IDs are client-controlled and cannot be validated at RLS level
-- Guest carts should use local storage (handled by zustand cartStore)

DROP POLICY IF EXISTS "Anonymous can view cart by session" ON public.cart_items;
DROP POLICY IF EXISTS "Anonymous can add to cart by session" ON public.cart_items;
DROP POLICY IF EXISTS "Anonymous can update cart by session" ON public.cart_items;
DROP POLICY IF EXISTS "Anonymous can delete from cart by session" ON public.cart_items;

-- Only authenticated users can use the cart_items table
-- Guest users will use local storage via zustand persist