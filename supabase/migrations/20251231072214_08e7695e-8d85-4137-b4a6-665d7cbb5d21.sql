-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create unique constraint
CREATE UNIQUE INDEX wishlists_customer_product_unique ON public.wishlists(customer_id, product_id);

-- RLS policies for wishlists
CREATE POLICY "Users can view their own wishlist"
ON public.wishlists FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlists FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlists FOR DELETE
USING (auth.uid() = customer_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = customer_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Add phone column to customers table if not exists
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR DEFAULT '+91';

-- Create index for faster queries
CREATE INDEX idx_notifications_customer_unread ON public.notifications(customer_id, is_read) WHERE is_read = false;
CREATE INDEX idx_wishlists_customer ON public.wishlists(customer_id);