-- Allow users to cancel their own orders (update status to cancelled)
CREATE POLICY "Customers can cancel their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (
  auth.uid() = customer_id 
  AND status = 'cancelled' 
  AND fulfillment_status = 'cancelled'
);