import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VerifyRequest {
  booking_id: string;
}

const REQUIRED_COMMENT = 'СН';

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
  // Narrow parsing to the "уже участвуют" section when present to avoid false positives.
  const lower = html.toLowerCase();
  const markerIndex = lower.indexOf('уже участвуют');
  const slice = markerIndex >= 0 ? html.slice(markerIndex, markerIndex + 60000) : html;

  const donations: Array<{ name: string; amount: number; comment: string }> = [];

  // Match amounts like "200 ₽" or "1 200 ₽".
  const amountRegex = /(\d{1,3}(?:\s\d{3})*|\d+)\s*₽/g;
  let match: RegExpExecArray | null;

  while ((match = amountRegex.exec(slice)) !== null) {
    const rawAmount = match[1].replace(/\s+/g, '');
    const amount = parseInt(rawAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    // Take a wider window around the amount to find name and comment
    const start = Math.max(0, match.index - 600);
    const end = Math.min(slice.length, match.index + match[0].length + 600);
    const chunk = slice.substring(start, end);

    // Capture text nodes that look like a person's name.
    const nameRegex = />\s*([А-Яа-яЁё][А-Яа-яЁёA-Za-z\-\s]{1,40}?)\s*</g;
    const candidates: Array<{ name: string; idx: number }> = [];
    let nm: RegExpExecArray | null;
    while ((nm = nameRegex.exec(chunk)) !== null) {
      const name = nm[1].trim().replace(/\s+/g, ' ');
      if (name.length < 2) continue;

      // Skip obvious non-names that may appear in UI.
      const normalized = normalizeName(name);
      if (
        ['уже участвуют', 'поддержать событие', 'о проекте', 'участники', 'создать событие', 'профиль', 'человек'].some((w) =>
          normalized.includes(w),
        )
      ) {
        continue;
      }

      candidates.push({ name, idx: nm.index });
    }

    if (candidates.length === 0) continue;

    // Prefer the name closest to the amount (latest candidate in the chunk before amount position).
    const chosen = candidates[candidates.length - 1].name;
    
    // Look for "СН" comment in the chunk - can be anywhere near the donation entry
    // Accept both Cyrillic "СН" and Latin "CH" (users often confuse them)
    const commentPatterns = [
      />\s*СН\s*</i,      // Cyrillic <tag>СН</tag>
      />\s*CH\s*</i,      // Latin <tag>CH</tag>
      />\s*сн\s*</i,      // lowercase Cyrillic
      />\s*ch\s*</i,      // lowercase Latin
      /\bСН\b/,           // standalone Cyrillic СН
      /\bCH\b/i,          // standalone Latin CH
      /\bсн\b/i,          // case insensitive Cyrillic
    ];
    const hasComment = commentPatterns.some(pattern => pattern.test(chunk));

    const exists = donations.some(
      (d) => normalizeName(d.name) === normalizeName(chosen) && d.amount === amount,
    );

    if (!exists) {
      donations.push({
        name: chosen,
        amount,
        comment: hasComment ? REQUIRED_COMMENT : '',
      });
    }
  }

  return donations;
}

// Fetch page HTML using Firecrawl (renders JavaScript)
async function fetchPageWithFirecrawl(url: string): Promise<string | null> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return null;
  }

  console.log('Using Firecrawl to fetch:', url);

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['html'],
        onlyMainContent: false,
        waitFor: 3000, // Wait 3 seconds for JS to render
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Firecrawl response success:', data.success);

    // Firecrawl v1 nests content in data.data
    const html = data.data?.html || data.html;
    if (html) {
      console.log('Firecrawl HTML length:', html.length);
      // Log a sample of the HTML around the donors section for debugging
      const lowerHtml = html.toLowerCase();
      const participantsIdx = lowerHtml.indexOf('уже участвуют');
      if (participantsIdx >= 0) {
        const sample = html.substring(participantsIdx, participantsIdx + 3000);
        console.log('HTML sample around participants:', sample);
      }
      return html;
    }

    console.error('Firecrawl returned no HTML');
    return null;
  } catch (error) {
    console.error('Firecrawl fetch error:', error);
    return null;
  }
}

// Fallback: simple fetch without JS rendering
async function fetchPageSimple(url: string): Promise<string | null> {
  console.log('Using simple fetch for:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error('Simple fetch failed:', response.status);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Simple fetch error:', error);
    return null;
  }
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

    // Try Firecrawl first (renders JS), fallback to simple fetch
    let html = await fetchPageWithFirecrawl(estafetaUrl);
    if (!html) {
      console.log('Firecrawl failed, trying simple fetch...');
      html = await fetchPageSimple(estafetaUrl);
    }

    if (!html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          verified: false,
          error: 'Could not check payment status. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('HTML length:', html.length);
    
    // Extract all donations from the page
    const donations = extractDonations(html);
    console.log('Found donations:', donations);
    
    // Search for donations matching the guest name and amount
    const normalizedGuestName = normalizeName(booking.guest_name);
    const expectedAmount = booking.total_amount;
    
    console.log('Looking for:', { normalizedGuestName, expectedAmount });

    // Find matching donation
    const guestTokens = normalizedGuestName
      .split(' ')
      .map((t) => t.trim())
      .filter(Boolean);

    const namesMatch = (normalizedDonorName: string) => {
      if (normalizedGuestName.length < 2 || normalizedDonorName.length < 2) return false;
      if (normalizedDonorName === normalizedGuestName) return true;

      // Require first token to match to avoid "".includes("") style false positives.
      const guestFirst = guestTokens[0];
      if (!guestFirst || guestFirst.length < 2) return false;

      const donorTokens = normalizedDonorName.split(' ').filter(Boolean);
      const firstOk = donorTokens.includes(guestFirst) || normalizedDonorName.startsWith(`${guestFirst} `);
      if (!firstOk) return false;

      // If user provided multiple tokens (e.g. first+last name), require all meaningful tokens.
      const restTokens = guestTokens.slice(1).filter((t) => t.length >= 3);
      return restTokens.every((t) => normalizedDonorName.includes(t));
    };

    let found = false;

    for (const donation of donations) {
      const normalizedDonorName = normalizeName(donation.name);

      console.log('Comparing:', {
        donorName: normalizedDonorName,
        guestName: normalizedGuestName,
        donorAmount: donation.amount,
        expectedAmount,
        comment: donation.comment,
      });

      const amountsMatch = donation.amount === expectedAmount;
      const commentMatch = donation.comment === REQUIRED_COMMENT;

      // For security, require: matching name + matching amount + required comment
      if (amountsMatch && namesMatch(normalizedDonorName) && commentMatch) {
        found = true;
        console.log('Found matching donation!', { donation });
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
        message: `Оплата не найдена. Убедитесь, что указали точное имя и комментарий "${REQUIRED_COMMENT}" при пожертвовании.`,
        minutes_left: minutesLeft,
        expected_name: booking.guest_name,
        expected_amount: booking.total_amount,
        found_donations: donations.length,
        hint: `При пожертвовании обязательно добавьте комментарий "${REQUIRED_COMMENT}" (Стратегия Наследия)`
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
