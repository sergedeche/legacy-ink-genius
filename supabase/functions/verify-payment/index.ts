import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VerifyRequest {
  booking_id: string;
}

// Input validation
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Get safe error message for clients (hide internal details)
function getSafeErrorMessage(error: unknown, context: string): string {
  if (error instanceof Error) {
    console.error(`[${context}] Internal error:`, error.message, error.stack);
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }
  return 'Произошла ошибка. Попробуйте позже.';
}

// Generate expected donor name format: "Имя П" from "Имя Фамилия"
function getExpectedDonorName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) {
    return parts[0] || '';
  }
  const firstName = parts[0];
  const lastNameInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${lastNameInitial}`;
}

// Normalize name for comparison (remove extra spaces, lowercase)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Strip common punctuation (e.g. "Тамара Ц." -> "тамара ц")
    .replace(/[.,!?:;"'«»()\[\]{}]/g, '')
    .replace(/ё/g, 'е'); // Normalize russian ё to е
}

// Parse date string like "04.02.2026 16:52:19" to Date object
function parseDonationDate(dateStr: string): Date | null {
  // Format: DD.MM.YYYY HH:MM:SS
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  
  const [, day, month, year, hour, minute, second] = match;
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // months are 0-indexed
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
}

// Extract donations from the HTML page
function extractDonations(html: string): Array<{ name: string; amount: number; donatedAt: Date | null }> {
  // Narrow parsing to the "уже участвуют" section when present to avoid false positives.
  const lower = html.toLowerCase();
  const markerIndex = lower.indexOf('уже участвуют');
  const slice = markerIndex >= 0 ? html.slice(markerIndex, markerIndex + 60000) : html;

  // 1) Prefer strict extraction from the participant blocks (much less noise than generic heuristics)
  // Example structure:
  // <span class="user__name">Богдан</span> ... <span class="user__sum">100 ₽</span> ... <div class="user__date"><span>04.02.2026 16:52:19</span>
  const strict: Array<{ name: string; amount: number; donatedAt: Date | null }> = [];
  const strictRegex = /user__name[^>]*>\s*([^<]+?)\s*<\/span>[\s\S]{0,500}?user__sum[^>]*>\s*([\d\s]+)\s*₽\s*<\/span>(?:[\s\S]{0,800}?user__date[^>]*>[\s\S]{0,200}?<span>\s*(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2})\s*<\/span>)?/gi;
  let sm: RegExpExecArray | null;
  while ((sm = strictRegex.exec(slice)) !== null) {
    const name = sm[1].trim().replace(/\s+/g, ' ');
    const rawAmount = (sm[2] || '').replace(/\s+/g, '');
    const amount = parseInt(rawAmount, 10);
    if (!name || !Number.isFinite(amount) || amount <= 0) continue;

    const donatedAt = sm[3] ? parseDonationDate(sm[3]) : null;
    const exists = strict.some(
      (d) => normalizeName(d.name) === normalizeName(name) && d.amount === amount && String(d.donatedAt) === String(donatedAt),
    );
    if (!exists) strict.push({ name, amount, donatedAt });
  }

  if (strict.length > 0) {
    return strict;
  }

  const donations: Array<{ name: string; amount: number; donatedAt: Date | null }> = [];

  // Match amounts like "200 ₽" or "1 200 ₽".
  const amountRegex = /(\d{1,3}(?:\s\d{3})*|\d+)\s*₽/g;
  let match: RegExpExecArray | null;

  while ((match = amountRegex.exec(slice)) !== null) {
    const rawAmount = match[1].replace(/\s+/g, '');
    const amount = parseInt(rawAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    // Take a wider window around the amount to find name, date, and comment
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

      // Additional common UI / non-donor labels that appear close to currency values
      if (['оферты', 'войти', 'благотворительное пожертвование', 'пожертвование'].includes(normalized)) {
        continue;
      }

      candidates.push({ name, idx: nm.index });
    }

    if (candidates.length === 0) continue;

    // Prefer the name closest to the amount (latest candidate in the chunk before amount position).
    const chosen = candidates[candidates.length - 1].name;
    
    // Extract date from the chunk (format: DD.MM.YYYY HH:MM:SS)
    const dateMatch = chunk.match(/(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2})/);
    const donatedAt = dateMatch ? parseDonationDate(dateMatch[1]) : null;
    
    const exists = donations.some(
      (d) => normalizeName(d.name) === normalizeName(chosen) && d.amount === amount,
    );

    if (!exists) {
      donations.push({
        name: chosen,
        amount,
        donatedAt,
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
        JSON.stringify({ success: false, error: 'Не указан идентификатор бронирования' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    if (!isValidUUID(booking_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Некорректный идентификатор бронирования' }),
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
    // Cache-busting: the donors list may be CDN-cached; user can already see new donation while our fetch gets stale HTML.
    const fetchUrl = `${estafetaUrl}${estafetaUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}`;

    console.log('Fetching donations from:', fetchUrl);

    // Try Firecrawl first (renders JS), fallback to simple fetch
    let html = await fetchPageWithFirecrawl(fetchUrl);
    if (!html) {
      console.log('Firecrawl failed, trying simple fetch...');
      html = await fetchPageSimple(fetchUrl);
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
    
    // Generate expected donor name format: "Имя П" from full name
    const expectedDonorName = getExpectedDonorName(booking.guest_name);
    const expectedAmount = booking.total_amount;
    const bookingCreatedAt = new Date(booking.created_at);
    
    console.log('Looking for:', { expectedDonorName, expectedAmount, bookingCreatedAt: bookingCreatedAt.toISOString() });

    let found = false;

    for (const donation of donations) {
      const normalizedDonorName = normalizeName(donation.name);

      console.log('Comparing:', {
        donorName: normalizedDonorName,
        expectedDonorName: normalizeName(expectedDonorName),
        donorAmount: donation.amount,
        expectedAmount,
        donatedAt: donation.donatedAt?.toISOString() || 'unknown',
        bookingCreatedAt: bookingCreatedAt.toISOString(),
      });

      const amountsMatch = donation.amount === expectedAmount;
      
      // Match by expected format: "Имя П" (first name + first letter of last name)
      const expectedNormalized = normalizeName(expectedDonorName);
      const nameMatches = normalizedDonorName === expectedNormalized ||
        normalizedDonorName.startsWith(expectedNormalized) ||
        expectedNormalized.startsWith(normalizedDonorName);
      
      // CRITICAL: Only accept donations made AFTER the booking was created
      // This prevents using old donations for new bookings
      const donationIsRecent = donation.donatedAt && donation.donatedAt > bookingCreatedAt;

      if (amountsMatch && nameMatches && donationIsRecent) {
        found = true;
        console.log('Found matching donation!', { donation, expectedDonorName, donatedAt: donation.donatedAt?.toISOString() });
        break;
      } else if (amountsMatch && nameMatches && !donationIsRecent) {
        console.log('Donation matches but is too old (before booking creation)', { 
          donatedAt: donation.donatedAt?.toISOString(), 
          bookingCreatedAt: bookingCreatedAt.toISOString() 
        });
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

      // Check if ticket already exists (race condition protection)
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('*')
        .eq('booking_id', booking_id)
        .single();

      let ticket = existingTicket;

      if (!existingTicket) {
        // Create ticket
        const { data: newTicket, error: ticketError } = await supabase
          .from('tickets')
          .insert({ booking_id })
          .select()
          .single();

        if (ticketError) {
          // Handle race condition: another request may have created it
          if (ticketError.code === '23505') {
            const { data: t } = await supabase
              .from('tickets')
              .select('*')
              .eq('booking_id', booking_id)
              .single();
            ticket = t;
          } else {
            console.error('Error creating ticket:', ticketError);
            throw ticketError;
          }
        } else {
          ticket = newTicket;
        }
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

    // expectedDonorName already defined above

    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: false,
        message: `Оплата не найдена. Убедитесь, что при пожертвовании указали имя "${expectedDonorName}".`,
        minutes_left: minutesLeft,
        expected_name: expectedDonorName,
        expected_amount: booking.total_amount,
        found_donations: donations.length,
        hint: `При пожертвовании укажите имя: ${expectedDonorName}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: getSafeErrorMessage(error, 'verify-payment')
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
