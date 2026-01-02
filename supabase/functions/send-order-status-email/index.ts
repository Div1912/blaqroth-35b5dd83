import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Valid order statuses
const VALID_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled', 'pending', 'confirmed'] as const;
type OrderStatus = typeof VALID_STATUSES[number];

// Input validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const isValidOrderNumber = (orderNumber: string): boolean => {
  // Order numbers should be alphanumeric with possible hyphens
  const orderRegex = /^[A-Za-z0-9-]{1,50}$/;
  return orderRegex.test(orderNumber);
};

const sanitizeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const isValidTrackingId = (trackingId: string): boolean => {
  // Tracking IDs are typically alphanumeric
  const trackingRegex = /^[A-Za-z0-9-]{1,100}$/;
  return trackingRegex.test(trackingId);
};

const isValidShippingPartner = (partner: string): boolean => {
  // Shipping partner names should be alphanumeric with spaces
  const partnerRegex = /^[A-Za-z0-9\s-]{1,100}$/;
  return partnerRegex.test(partner);
};

const isValidCustomerName = (name: string): boolean => {
  // Names should be letters, spaces, and common characters
  const nameRegex = /^[A-Za-z\s.'-]{1,100}$/;
  return nameRegex.test(name);
};

interface OrderStatusEmailRequest {
  email: string;
  customerName: string;
  orderNumber: string;
  newStatus: string;
  trackingId?: string;
  shippingPartner?: string;
}

const getStatusMessage = (status: string, trackingId?: string, shippingPartner?: string) => {
  const sanitizedTrackingId = trackingId ? sanitizeHtml(trackingId) : undefined;
  const sanitizedPartner = shippingPartner ? sanitizeHtml(shippingPartner) : undefined;
  
  switch (status.toLowerCase()) {
    case 'shipped':
      return {
        subject: 'Your Order Has Been Shipped! 📦',
        heading: 'Great news! Your order is on its way!',
        message: sanitizedTrackingId 
          ? `Your package has been shipped${sanitizedPartner ? ` via ${sanitizedPartner}` : ''}. Track your order using the tracking ID: <strong>${sanitizedTrackingId}</strong>`
          : 'Your package has been shipped and is on its way to you.',
        color: '#3b82f6'
      };
    case 'delivered':
      return {
        subject: 'Your Order Has Been Delivered! 🎉',
        heading: 'Your order has arrived!',
        message: 'We hope you love your new items! If you have any questions or concerns, please don\'t hesitate to reach out.',
        color: '#22c55e'
      };
    case 'processing':
      return {
        subject: 'Your Order is Being Processed',
        heading: 'We\'re preparing your order!',
        message: 'Our team is carefully preparing your items for shipment. You\'ll receive another email once it ships.',
        color: '#f59e0b'
      };
    case 'cancelled':
      return {
        subject: 'Your Order Has Been Cancelled',
        heading: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions about this cancellation, please contact our support team.',
        color: '#ef4444'
      };
    default:
      return {
        subject: `Order Status Update: ${sanitizeHtml(status)}`,
        heading: `Your order status has been updated`,
        message: `Your order status is now: ${sanitizeHtml(status)}`,
        color: '#6b7280'
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send order status email");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.log("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate input
    let requestData: OrderStatusEmailRequest;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, customerName, orderNumber, newStatus, trackingId, shippingPartner } = requestData;
    
    // Validate required fields
    if (!email || !customerName || !orderNumber || !newStatus) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, customerName, orderNumber, newStatus' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate customer name
    if (!isValidCustomerName(customerName)) {
      return new Response(
        JSON.stringify({ error: 'Invalid customer name format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate order number
    if (!isValidOrderNumber(orderNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid order number format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate tracking ID if provided
    if (trackingId && !isValidTrackingId(trackingId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid tracking ID format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate shipping partner if provided
    if (shippingPartner && !isValidShippingPartner(shippingPartner)) {
      return new Response(
        JSON.stringify({ error: 'Invalid shipping partner format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Admin ${user.email} sending status email to ${email} for order ${orderNumber}, status: ${newStatus}`);

    // Sanitize all user input for HTML
    const sanitizedCustomerName = sanitizeHtml(customerName);
    const sanitizedOrderNumber = sanitizeHtml(orderNumber);
    const statusInfo = getStatusMessage(newStatus, trackingId, shippingPartner);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AUREA <onboarding@resend.dev>",
        to: [email],
        subject: `${statusInfo.subject} - Order #${sanitizedOrderNumber}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #262626;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #262626;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #c9a962;">AUREA</h1>
                    </td>
                  </tr>
                  
                  <!-- Status Badge -->
                  <tr>
                    <td style="padding: 30px 40px 20px; text-align: center;">
                      <span style="display: inline-block; padding: 8px 24px; background-color: ${statusInfo.color}20; color: ${statusInfo.color}; border-radius: 50px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid ${statusInfo.color}40;">
                        ${sanitizeHtml(newStatus)}
                      </span>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 20px 40px 30px;">
                      <h2 style="margin: 0 0 15px; font-size: 24px; font-weight: 400; color: #ffffff; text-align: center;">
                        ${statusInfo.heading}
                      </h2>
                      <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.6; color: #a3a3a3; text-align: center;">
                        Hi ${sanitizedCustomerName}, ${statusInfo.message}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Order Details -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1f1f1f; border-radius: 12px; border: 1px solid #333333;">
                        <tr>
                          <td style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #a3a3a3; font-size: 14px; padding-bottom: 10px;">Order Number</td>
                                <td style="color: #ffffff; font-size: 14px; text-align: right; padding-bottom: 10px; font-weight: 500;">#${sanitizedOrderNumber}</td>
                              </tr>
                              ${trackingId ? `
                              <tr>
                                <td style="color: #a3a3a3; font-size: 14px; padding-bottom: 10px;">Tracking ID</td>
                                <td style="color: #c9a962; font-size: 14px; text-align: right; padding-bottom: 10px; font-weight: 500;">${sanitizeHtml(trackingId)}</td>
                              </tr>
                              ` : ''}
                              ${shippingPartner ? `
                              <tr>
                                <td style="color: #a3a3a3; font-size: 14px;">Shipping Partner</td>
                                <td style="color: #ffffff; font-size: 14px; text-align: right;">${sanitizeHtml(shippingPartner)}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 40px 40px; text-align: center;">
                      <a href="https://aurea-store.lovable.app/order/${encodeURIComponent(orderNumber)}" 
                         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #c9a962 0%, #a8893f 100%); color: #000000; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 1px; border-radius: 8px; text-transform: uppercase;">
                        Track Your Order
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0d0d0d; border-top: 1px solid #262626; text-align: center;">
                      <p style="margin: 0 0 10px; color: #737373; font-size: 12px;">
                        If you have any questions, please contact our support team.
                      </p>
                      <p style="margin: 0; color: #525252; font-size: 11px;">
                        © 2025 AUREA. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: emailResponse.ok ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-status-email function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
