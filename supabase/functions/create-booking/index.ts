import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BookingRequest {
  event_id: string;
  guest_name: string;
  guest_email: string;
  seats_count: number;
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

    const body: BookingRequest = await req.json();
    const { event_id, guest_name, guest_email, seats_count } = body;

    console.log('Creating booking:', { event_id, guest_name, guest_email, seats_count });

    // Validate input
    if (!event_id || !guest_name || !guest_email || !seats_count) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (seats_count < 1 || seats_count > 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Seats count must be between 1 and 5' }),
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
        JSON.stringify({ success: false, error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check available seats
    const { data: bookedSeats, error: seatsError } = await supabase
      .rpc('get_booked_seats', { p_event_id: event_id });

    if (seatsError) {
      console.error('Error getting booked seats:', seatsError);
      throw seatsError;
    }

    const availableSeats = event.total_seats - (bookedSeats || 0);
    
    if (seats_count > availableSeats) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Not enough seats available. Only ${availableSeats} seats left.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount
    const total_amount = seats_count * event.price_per_seat;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_id,
        guest_name: guest_name.trim(),
        guest_email: guest_email.trim().toLowerCase(),
        seats_count,
        total_amount,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw bookingError;
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
    console.error('Error in create-booking:', error);
    
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
