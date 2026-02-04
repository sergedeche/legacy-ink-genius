import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  email: string;
  ticket_code: string;
  guest_name: string;
  event_title: string;
  event_date: string;
  seats_count: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, ticket_code, guest_name, event_title, event_date, seats_count }: TicketEmailRequest = await req.json();

    // Validate required fields
    if (!email || !ticket_code || !guest_name || !event_title || !event_date) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format date for display
    const eventDateObj = new Date(event_date);
    const formattedDate = eventDateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = eventDateObj.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format seats text
    const seatsText = seats_count === 1 ? '1 место' : seats_count < 5 ? `${seats_count} места` : `${seats_count} мест`;

    // For now, we'll log the email that would be sent
    // In production, integrate with Resend or another email service
    console.log('Ticket email would be sent to:', email);
    console.log('Ticket details:', {
      ticket_code,
      guest_name,
      event_title,
      formattedDate,
      formattedTime,
      seatsText
    });

    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Send email via Resend
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f3f0; padding: 20px;">
          <div style="max-width: 400px; margin: 0 auto; background: linear-gradient(135deg, #c7923e, #8b6224); border-radius: 16px; overflow: hidden;">
            <div style="padding: 24px; text-align: center; color: #f5f3f0;">
              <div style="font-size: 40px; margin-bottom: 12px;">🎫</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Билет подтверждён</h1>
            </div>
            
            <div style="background-color: #f5f3f0; padding: 24px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 8px; color: #7a6f5d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Код билета</p>
                <div style="background-color: #1a2332; color: #c7923e; font-family: monospace; font-size: 24px; padding: 16px 20px; border-radius: 8px; letter-spacing: 4px;">
                  ${ticket_code}
                </div>
                <p style="margin: 8px 0 0; color: #7a6f5d; font-size: 12px;">Покажите этот код при входе</p>
              </div>
              
              <hr style="border: none; border-top: 2px dashed #d4cfc4; margin: 20px 0;">
              
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0 0 16px; color: #2a2318; font-size: 20px;">${event_title}</h2>
                
                <table style="width: 100%; font-size: 14px; color: #5a5145;">
                  <tr>
                    <td style="padding: 4px 8px;">📅 ${formattedDate}</td>
                    <td style="padding: 4px 8px;">🕐 ${formattedTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 8px;">👤 ${guest_name}</td>
                    <td style="padding: 4px 8px;">👥 ${seatsText}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: rgba(199, 146, 62, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #5a5145; font-size: 12px;">
                  💡 Сохраните это письмо или сделайте скриншот билета
                </p>
              </div>
            </div>
          </div>
          
          <p style="text-align: center; color: #7a6f5d; font-size: 12px; margin-top: 20px;">
            Стратегия наследия — экскурс для тех, кто думает о будущем
          </p>
        </body>
        </html>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Стратегия наследия <tickets@updates.lovable.app>",
          to: [email],
          subject: `🎫 Ваш билет: ${event_title}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resend API error:", errorText);
        throw new Error("Failed to send email");
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No Resend API key - return error
      console.log("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service not configured. Please save your ticket code." 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: unknown) {
    console.error("Error in send-ticket-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
