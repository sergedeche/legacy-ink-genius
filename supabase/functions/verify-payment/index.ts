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

// Extract donations from the HTML page
function extractDonations(html: string): Array<{ name: string; amount: number; comment: string }> {
  const donations: Array<{ name: string; amount: number; comment: string }> = [];
  
  // Pattern for donor entries on estafeta.ru
  // Looking for patterns like: <span class="name">Сергей</span> ... 200 ₽
  // Or structured blocks with donor info
  
  // Try to find donation cards/blocks
  // Pattern 1: Name in one element, amount in another (common structure)
  const blockPatterns = [
    // Match name followed by amount with ₽ symbol
    /(?:class="[^"]*(?:name|user|donor)[^"]*"[^>]*>|<(?:strong|b|span)[^>]*>)\s*([А-Яа-яЁёA-Za-z\s]+?)\s*<[^>]*>[\s\S]*?(\d+)\s*₽/gi,
    // Match person icon + name + amount pattern
    />\s*([А-Яа-яЁё][А-Яа-яЁёA-Za-z\s]{1,30})\s*<[^>]*>[\s\S]{0,200}?(\d+)\s*₽/gi,
  ];
  
  for (const pattern of blockPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const name = match[1].trim();
      const amount = parseInt(match[2], 10);
      
      // Skip empty names or very short names
      if (name && name.length >= 2 && amount > 0) {
        // Look for comment "СН" near this match
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(html.length, match.index + match[0].length + 200);
        const context = html.substring(contextStart, contextEnd);
        const hasComment = /СН|сн/i.test(context);
        
        donations.push({
          name,
          amount,
          comment: hasComment ? 'СН' : ''
        });
      }
    }
  }
  
  // Pattern 2: Extract from text content directly
  // Remove HTML tags and look for "Name ... 200 ₽" patterns
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\s+/g, ' ');
  
  // Look for patterns like "Сергей 200 ₽" or "Сергей ... 200 ₽"
  const textPattern = /([А-Яа-яЁё][А-Яа-яЁёA-Za-z\s]{1,25}?)\s+(\d+)\s*₽/g;
  let textMatch;
  
  while ((textMatch = textPattern.exec(textContent)) !== null) {
    const name = textMatch[1].trim();
    const amount = parseInt(textMatch[2], 10);
    
    if (name && name.length >= 2 && amount > 0) {
      // Check if this donation is already found
      const exists = donations.some(d => 
        normalizeName(d.name) === normalizeName(name) && d.amount === amount
      );
      
      if (!exists) {
        // Look for СН comment
        const contextStart = Math.max(0, textMatch.index - 50);
        const contextEnd = Math.min(textContent.length, textMatch.index + textMatch[0].length + 100);
        const context = textContent.substring(contextStart, contextEnd);
        const hasComment = /СН|сн/i.test(context);
        
        donations.push({
          name,
          amount,
          comment: hasComment ? 'СН' : ''
        });
      }
    }
  }
  
  return donations;
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
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
    console.log('HTML length:', html.length);
    
    // Extract all donations from the page
    const donations = extractDonations(html);
    console.log('Found donations:', donations);
    
    // Search for donations matching the guest name and amount
    const normalizedGuestName = normalizeName(booking.guest_name);
    const expectedAmount = booking.total_amount;
    
    console.log('Looking for:', { normalizedGuestName, expectedAmount });

    // Find matching donation
    let found = false;
    
    for (const donation of donations) {
      const normalizedDonorName = normalizeName(donation.name);
      
      console.log('Comparing:', { 
        donorName: normalizedDonorName, 
        guestName: normalizedGuestName,
        donorAmount: donation.amount,
        expectedAmount,
        comment: donation.comment
      });
      
      // Check if names match (partial match allowed - first name only)
      const namesMatch = 
        normalizedDonorName === normalizedGuestName ||
        (normalizedDonorName.length >= 2 && normalizedGuestName.includes(normalizedDonorName)) ||
        (normalizedGuestName.length >= 2 && normalizedDonorName.includes(normalizedGuestName));
      
      // Check if amounts match
      const amountsMatch = donation.amount === expectedAmount;
      
      // For security, we require: matching name + matching amount
      // Comment "СН" is optional but provides extra confidence
      if (namesMatch && amountsMatch) {
        found = true;
        console.log('Found matching donation!', { 
          donation, 
          hasComment: donation.comment === 'СН' 
        });
        break;
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
        message: 'Оплата не найдена. Убедитесь, что указали точное имя при донате и добавили комментарий "СН".',
        minutes_left: minutesLeft,
        expected_name: booking.guest_name,
        expected_amount: booking.total_amount,
        found_donations: donations.length,
        hint: 'При донате укажите имя и добавьте комментарий "СН" (Стратегия Наследия)'
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
