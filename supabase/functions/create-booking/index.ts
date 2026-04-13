import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-forwarded-for',
};

interface BookingRequest {
  event_id: string;
  guest_name: string;
  guest_email: string;
  seats_count: number;
}

// Input validation functions
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isValidName(name: string): boolean {
  // Allow Cyrillic, Latin, spaces, and hyphens. Min 2, max 100 chars.
  const nameRegex = /^[А-Яа-яЁёA-Za-z\s\-]{2,100}$/;
  return nameRegex.test(name);
}

function sanitizeName(name: string): string {
  // Remove any potentially dangerous characters, keep only allowed ones
  return name
    .trim()
    .replace(/[<>'"&]/g, '')
    .substring(0, 100);
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

    // Get client IP for rate limiting - prefer platform-provided headers over client-spoofable ones
    // cf-connecting-ip is set by Cloudflare and cannot be spoofed by clients
    // x-real-ip is set by nginx/reverse proxy
    // x-forwarded-for is easily spoofable, use only as last resort
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-real-ip') ||
                     req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     'unknown';

    // IP-based rate limiting check
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc('check_booking_rate_limit', { p_client_ip: clientIP });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Слишком много запросов. Попробуйте через час.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { event_id, guest_name, seats_count } = body;
    // Email is now optional at booking time — collected after payment verification
    const guest_email = body.guest_email || 'pending@placeholder.local';

    console.log('Creating booking:', { event_id, guest_name: '[REDACTED]', guest_email: '[REDACTED]', seats_count });

    // Comprehensive input validation
    if (!event_id || !guest_name || seats_count === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Заполните все обязательные поля' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    if (!isValidUUID(event_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Некорректный идентификатор события' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format only if a real email was provided
    const trimmedEmail = guest_email.trim().toLowerCase();
    const isPlaceholderEmail = trimmedEmail === 'pending@placeholder.local';
    
    if (!isPlaceholderEmail && !isValidEmail(trimmedEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Некорректный формат email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email-based rate limiting (skip for placeholder)
    if (!isPlaceholderEmail) {
      const { data: emailRateLimitOk, error: emailRateLimitError } = await supabase
        .rpc('check_email_rate_limit', { p_email: trimmedEmail });

      if (emailRateLimitError) {
        console.error('Email rate limit check error:', emailRateLimitError);
      } else if (!emailRateLimitOk) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Слишком много бронирований с этого email. Попробуйте через час.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate and sanitize name
    const trimmedName = guest_name.trim();
    if (!isValidName(trimmedName)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Имя должно содержать 2-100 символов (буквы, пробелы, дефисы)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const sanitizedName = sanitizeName(trimmedName);

    // Validate seats count
    if (!Number.isInteger(seats_count) || seats_count < 1 || seats_count > 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Количество мест должно быть от 1 до 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return new Response(
        JSON.stringify({ success: false, error: 'Событие не найдено' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check available seats
    const { data: bookedSeats, error: seatsError } = await supabase
      .rpc('get_booked_seats', { p_event_id: event_id });

    if (seatsError) {
      console.error('Error getting booked seats:', seatsError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(seatsError, 'get_booked_seats') }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const availableSeats = event.total_seats - (bookedSeats || 0);
    
    if (seats_count > availableSeats) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Недостаточно мест. Осталось только ${availableSeats}.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount
    const total_amount = seats_count * event.price_per_seat;

    // Create booking with client IP for rate limiting
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_id,
        guest_name: sanitizedName,
        guest_email: trimmedEmail,
        seats_count,
        total_amount,
        status: 'pending',
        client_ip: clientIP,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return new Response(
        JSON.stringify({ success: false, error: getSafeErrorMessage(bookingError, 'create_booking') }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Booking created:', booking.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: {
          id: booking.id,
          verification_code: booking.verification_code,
          total_amount: booking.total_amount,
          seats_count: booking.seats_count,
          guest_name: booking.guest_name,
          expires_at: booking.expires_at,
        },
        event: {
          title: event.title,
          event_date: event.event_date,
          estafeta_url: event.estafeta_url,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: getSafeErrorMessage(error, 'create-booking')
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
