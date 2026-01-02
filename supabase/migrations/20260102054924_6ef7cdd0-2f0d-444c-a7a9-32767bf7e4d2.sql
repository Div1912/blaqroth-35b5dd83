-- Add explicit deny policy for anonymous access to customers table
-- This follows defense-in-depth principle by explicitly denying unauthenticated access
CREATE POLICY "Block anonymous access to customers"
ON public.customers
FOR SELECT
TO anon
USING (false);