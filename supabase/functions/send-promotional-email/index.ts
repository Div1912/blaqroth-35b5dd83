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

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const sanitizeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

interface PromotionalEmailRequest {
  subject: string;
  heading: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  color?: string;
  recipientEmails?: string[]; // If not provided, send to all customers
  useTemplate?: boolean; // If true, load default promotional template from DB
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send promotional email");
  
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
    let requestData: PromotionalEmailRequest;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, heading, message, ctaText, ctaLink, color, recipientEmails, useTemplate } = requestData;
    
    // Validate required fields
    if (!subject || !heading || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subject, heading, message' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get recipient emails
    let emails: string[] = [];
    
    if (recipientEmails && recipientEmails.length > 0) {
      // Validate provided emails
      emails = recipientEmails.filter(isValidEmail);
      if (emails.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid email addresses provided' }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // Fetch all customer emails
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('email')
        .not('email', 'is', null);
      
      if (customersError) {
        console.error("Error fetching customers:", customersError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch customer emails' }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      emails = customers?.map(c => c.email).filter(isValidEmail) || [];
    }

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No customers to send emails to' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Admin ${user.email} sending promotional email to ${emails.length} recipients`);

    // Sanitize content
    let finalSubject = subject;
    let finalHeading = heading;
    let finalMessage = message;
    let finalCtaText = ctaText || 'Shop Now';
    let finalCtaLink = ctaLink || 'https://blaqroth.site/shop';
    let accentColor = color || '#c9a962';
    
    // If useTemplate is true, try to load promotional template
    if (useTemplate) {
      const { data: template } = await supabase
        .from('email_templates')
        .select('subject, heading, message, cta_text, cta_link, color')
        .eq('template_type', 'promotional_default')
        .eq('is_active', true)
        .maybeSingle();
      
      if (template) {
        finalSubject = template.subject;
        finalHeading = template.heading;
        finalMessage = template.message;
        finalCtaText = template.cta_text || finalCtaText;
        finalCtaLink = template.cta_link || finalCtaLink;
        accentColor = template.color || accentColor;
      }
    }

    const sanitizedSubject = sanitizeHtml(finalSubject);
    const sanitizedHeading = sanitizeHtml(finalHeading);
    const sanitizedMessage = finalMessage; // Keep HTML for message content
    const sanitizedCtaText = sanitizeHtml(finalCtaText);
    const sanitizedCtaLink = finalCtaLink;

    // Send emails in batches of 50 (Resend limit)
    const batchSize = 50;
    const results: { success: number; failed: number } = { success: 0, failed: 0 };

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "BLAQROTH <onboarding@resend.dev>",
            to: batch,
            subject: sanitizedSubject,
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
                          <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #c9a962;">BLAQROTH</h1>
                        </td>
                      </tr>
                      
                      <!-- Main Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 400; color: #ffffff; text-align: center;">
                            ${sanitizedHeading}
                          </h2>
                          <div style="margin: 0 0 30px; font-size: 16px; line-height: 1.8; color: #a3a3a3; text-align: center;">
                            ${sanitizedMessage}
                          </div>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                          <a href="${sanitizedCtaLink}" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%); color: #000000; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 2px; border-radius: 8px; text-transform: uppercase;">
                            ${sanitizedCtaText}
                          </a>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; background-color: #0d0d0d; border-top: 1px solid #262626; text-align: center;">
                          <p style="margin: 0 0 10px; color: #737373; font-size: 12px;">
                            You're receiving this because you're a valued BLAQROTH customer.
                          </p>
                          <p style="margin: 0; color: #525252; font-size: 11px;">
                            © 2025 BLAQROTH. All rights reserved.
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

        if (emailResponse.ok) {
          results.success += batch.length;
        } else {
          const errorData = await emailResponse.json();
          console.error("Resend error:", errorData);
          results.failed += batch.length;
        }
      } catch (error) {
        console.error("Error sending batch:", error);
        results.failed += batch.length;
      }
    }

    console.log(`Promotional email results: ${results.success} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Email sent to ${results.success} recipients`,
        success: results.success,
        failed: results.failed
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-promotional-email function:", error);
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