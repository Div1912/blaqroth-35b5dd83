-- Drop the insecure policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a secure policy that only allows admins to create notifications
CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));