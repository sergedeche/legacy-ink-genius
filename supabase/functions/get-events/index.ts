import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching upcoming events...');

    // Get upcoming events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    // For each event, calculate booked seats
    const eventsWithSeats = await Promise.all(
      (events || []).map(async (event) => {
        // Get booked seats count using the database function
        const { data: bookedSeats, error: seatsError } = await supabase
          .rpc('get_booked_seats', { p_event_id: event.id });

        if (seatsError) {
          console.error('Error getting booked seats:', seatsError);
        }

        const booked = bookedSeats || 0;
        const available = event.total_seats - booked;

        return {
          ...event,
          booked_seats: booked,
          available_seats: available,
        };
      })
    );

    console.log(`Found ${eventsWithSeats.length} upcoming events`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        events: eventsWithSeats,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        } 
      }
    );
  } catch (error: unknown) {
    console.error('Error in get-events:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        events: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
