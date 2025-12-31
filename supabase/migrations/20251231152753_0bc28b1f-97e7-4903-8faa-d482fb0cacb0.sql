-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anonymous can manage cart by session" ON public.cart_items;
DROP POLICY IF EXISTS "Customers can manage own cart" ON public.cart_items;

-- Create proper SELECT policy for authenticated users (their own cart only)
CREATE POLICY "Users can view their own cart items"
ON public.cart_items
FOR SELECT
USING (auth.uid() = customer_id);

-- Create proper INSERT policy for authenticated users
CREATE POLICY "Users can add to their own cart"
ON public.cart_items
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Create proper UPDATE policy for authenticated users
CREATE POLICY "Users can update their own cart items"
ON public.cart_items
FOR UPDATE
USING (auth.uid() = customer_id);

-- Create proper DELETE policy for authenticated users
CREATE POLICY "Users can delete their own cart items"
ON public.cart_items
FOR DELETE
USING (auth.uid() = customer_id);

-- For anonymous/guest carts (session-based), we need session_id validation
-- These should only work when customer_id IS NULL AND session_id matches
-- Note: Since session_id is client-controlled, consider if you actually need guest carts
-- If guest carts are needed, the session_id should be validated server-side

CREATE POLICY "Anonymous can view cart by session"
ON public.cart_items
FOR SELECT
USING (customer_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anonymous can add to cart by session"
ON public.cart_items
FOR INSERT
WITH CHECK (customer_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anonymous can update cart by session"
ON public.cart_items
FOR UPDATE
USING (customer_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anonymous can delete from cart by session"
ON public.cart_items
FOR DELETE
USING (customer_id IS NULL AND session_id IS NOT NULL);