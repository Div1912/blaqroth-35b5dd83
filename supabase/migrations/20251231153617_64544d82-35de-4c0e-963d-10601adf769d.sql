-- Allow authenticated users to update stock when placing orders
CREATE POLICY "Authenticated users can update stock on purchase"
ON public.product_variants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);