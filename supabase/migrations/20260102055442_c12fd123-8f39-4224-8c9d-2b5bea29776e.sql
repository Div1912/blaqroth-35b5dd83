-- Fix notification RLS policy that breaks user functionality
-- Drop the overly restrictive admin-only policy
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;

-- Allow users to create notifications for themselves (e.g., order confirmations)
CREATE POLICY "Users can create notifications for themselves"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Allow admins to create notifications for any user
CREATE POLICY "Admins can create notifications for users"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));