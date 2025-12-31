-- Drop all existing policies on customers table to clean up duplicates
DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customers;
DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.customers;

-- Create clean, explicit policies - require authentication
CREATE POLICY "Authenticated users can view own profile"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.customers
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all customers for order management
CREATE POLICY "Admins can view all customers"
ON public.customers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));