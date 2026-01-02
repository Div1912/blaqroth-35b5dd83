import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  switch (status.toLowerCase()) {
    case 'shipped':
      return {
        subject: 'Your Order Has Been Shipped! 📦',
        heading: 'Great news! Your order is on its way!',
        message: trackingId 
          ? `Your package has been shipped${shippingPartner ? ` via ${shippingPartner}` : ''}. Track your order using the tracking ID: <strong>${trackingId}</strong>`
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
        subject: `Order Status Update: ${status}`,
        heading: `Your order status has been updated`,
        message: `Your order status is now: ${status}`,
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
    const { email, customerName, orderNumber, newStatus, trackingId, shippingPartner }: OrderStatusEmailRequest = await req.json();
    
    console.log(`Sending status email to ${email} for order ${orderNumber}, status: ${newStatus}`);

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
        subject: `${statusInfo.subject} - Order #${orderNumber}`,
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
                        ${newStatus}
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
                        Hi ${customerName}, ${statusInfo.message}
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
                                <td style="color: #ffffff; font-size: 14px; text-align: right; padding-bottom: 10px; font-weight: 500;">#${orderNumber}</td>
                              </tr>
                              ${trackingId ? `
                              <tr>
                                <td style="color: #a3a3a3; font-size: 14px; padding-bottom: 10px;">Tracking ID</td>
                                <td style="color: #c9a962; font-size: 14px; text-align: right; padding-bottom: 10px; font-weight: 500;">${trackingId}</td>
                              </tr>
                              ` : ''}
                              ${shippingPartner ? `
                              <tr>
                                <td style="color: #a3a3a3; font-size: 14px;">Shipping Partner</td>
                                <td style="color: #ffffff; font-size: 14px; text-align: right;">${shippingPartner}</td>
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
                      <a href="https://aurea-store.lovable.app/order/${orderNumber}" 
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
