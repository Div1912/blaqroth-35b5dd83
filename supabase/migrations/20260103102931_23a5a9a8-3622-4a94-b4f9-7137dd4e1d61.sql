-- Create email_templates table for customizable email templates
CREATE TABLE public.email_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_type TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    heading TEXT NOT NULL,
    message TEXT NOT NULL,
    cta_text TEXT,
    cta_link TEXT,
    color TEXT DEFAULT '#c9a962',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can view email templates"
    ON public.email_templates FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can insert email templates"
    ON public.email_templates FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update email templates"
    ON public.email_templates FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can delete email templates"
    ON public.email_templates FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Insert default templates for order statuses
INSERT INTO public.email_templates (template_type, name, subject, heading, message, cta_text, cta_link, color) VALUES
('order_processing', 'Order Processing', 'Your Order is Being Processed', 'We''re preparing your order!', 'Our team is carefully preparing your items for shipment. You''ll receive another email once it ships.', 'Track Your Order', '/order/{{order_number}}', '#f59e0b'),
('order_shipped', 'Order Shipped', 'Your Order Has Been Shipped! 📦', 'Great news! Your order is on its way!', 'Your package has been shipped{{shipping_partner}}. Track your order using the tracking ID: <strong>{{tracking_id}}</strong>', 'Track Your Order', '/order/{{order_number}}', '#3b82f6'),
('order_delivered', 'Order Delivered', 'Your Order Has Been Delivered! 🎉', 'Your order has arrived!', 'We hope you love your new items! If you have any questions or concerns, please don''t hesitate to reach out.', 'View Order', '/order/{{order_number}}', '#22c55e'),
('order_cancelled', 'Order Cancelled', 'Your Order Has Been Cancelled', 'Order Cancelled', 'Your order has been cancelled. If you have any questions about this cancellation, please contact our support team.', 'Contact Support', '/contact', '#ef4444'),
('promotional_default', 'Promotional Email', 'Special Offer Just For You!', 'Discover Something Special', 'Check out our latest collection and exclusive offers.', 'Shop Now', '/shop', '#c9a962');