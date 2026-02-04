import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VerifyRequest {
  booking_id: string;
}

// Normalize name for comparison (remove extra spaces, lowercase)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ё/g, 'е'); // Normalize russian ё to е
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: VerifyRequest = await req.json();
    const { booking_id } = body;

    console.log('Verifying payment for booking:', booking_id);

    if (!booking_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get booking with event details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        events (*)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return new Response(
        JSON.stringify({ success: false, error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already verified
    if (booking.status === 'verified') {
      // Get existing ticket
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('booking_id', booking_id)
        .single();

      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          message: 'Payment already verified',
          ticket: ticket
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(booking.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('bookings')
        .update({ status: 'expired' })
        .eq('id', booking_id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          verified: false,
          error: 'Booking has expired. Please create a new booking.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the estafeta event page to find donations
    const estafetaUrl = booking.events?.estafeta_url || 'https://estafeta.ru/events/master-klass/ekskurs-strategiya-naslediya-343403/';
    
    console.log('Fetching donations from:', estafetaUrl);

    const response = await fetch(estafetaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch estafeta page:', response.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          verified: false,
          error: 'Could not check payment status. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    // Search for donations matching the guest name and amount
    // The page structure may vary, but typically shows donor name and amount
    const normalizedGuestName = normalizeName(booking.guest_name);
    const expectedAmount = booking.total_amount;
    
    console.log('Looking for:', { normalizedGuestName, expectedAmount });

    // Parse donor entries - looking for patterns like:
    // <div class="donor">Name</div> ... <span>100 ₽</span>
    // Or table rows with name and amount
    
    // Try multiple patterns to find donations
    let found = false;
    
    // Pattern 1: Look for name followed by the expected amount
    const namePattern = new RegExp(
      `${booking.guest_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*<[^>]*>[^<]*${expectedAmount}`,
      'i'
    );
    
    if (namePattern.test(html)) {
      found = true;
      console.log('Found match with pattern 1');
    }
    
    // Pattern 2: Look for donor-card or similar structures
    const donorPattern = /<(?:div|span|td)[^>]*class="[^"]*(?:donor|user|name)[^"]*"[^>]*>([^<]+)<[^>]*>[\s\S]*?(\d[\d\s]*?)(?:\s*₽|<)/gi;
    let match;
    
    while ((match = donorPattern.exec(html)) !== null) {
      const donorName = normalizeName(match[1]);
      const amount = parseInt(match[2].replace(/\s/g, ''), 10);
      
      console.log('Found donor:', { donorName, amount });
      
      if (donorName.includes(normalizedGuestName) || normalizedGuestName.includes(donorName)) {
        if (amount === expectedAmount) {
          found = true;
          console.log('Found exact match!');
          break;
        }
      }
    }

    // Pattern 3: Simple text search for name and amount in proximity
    if (!found) {
      const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const simplePattern = new RegExp(
        `${booking.guest_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^₽]{0,100}${expectedAmount}\\s*₽`,
        'i'
      );
      
      if (simplePattern.test(textContent)) {
        found = true;
        console.log('Found match with simple text search');
      }
    }

    if (found) {
      console.log('Payment verified for booking:', booking_id);
      
      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', booking_id);

      if (updateError) {
        console.error('Error updating booking:', updateError);
        throw updateError;
      }

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          booking_id
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        throw ticketError;
      }

      console.log('Ticket created:', ticket.ticket_code);

      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          message: 'Payment verified successfully!',
          ticket: {
            id: ticket.id,
            ticket_code: ticket.ticket_code,
            created_at: ticket.created_at
          },
          booking: {
            guest_name: booking.guest_name,
            seats_count: booking.seats_count,
            total_amount: booking.total_amount
          },
          event: {
            title: booking.events?.title,
            event_date: booking.events?.event_date
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not found yet
    const expiresIn = new Date(booking.expires_at).getTime() - Date.now();
    const minutesLeft = Math.max(0, Math.floor(expiresIn / 60000));

    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: false,
        message: 'Payment not found yet. Please make sure you used the exact name when donating.',
        minutes_left: minutesLeft,
        expected_name: booking.guest_name,
        expected_amount: booking.total_amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in verify-payment:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
