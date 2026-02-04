const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = 'https://estafeta.ru/members/member/chernenko-sergey-156225/';
    
    console.log('Fetching donation amount from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the total amount from event-status__value span
    // Pattern: <span class="event-status__value">4 432 610</span>
    const statusMatch = html.match(/event-status__value[^>]*>([^<]+)</);
    
    let totalAmount = 0;
    
    if (statusMatch && statusMatch[1]) {
      // Extract numbers from the matched string (e.g., "4 432 610" -> 4432610)
      const numStr = statusMatch[1].replace(/[^\d]/g, '');
      totalAmount = parseInt(numStr, 10);
      console.log('Found total amount from event-status:', totalAmount);
    } else {
      // Fallback: find largest amount on page
      const amountMatch = html.match(/(\d[\d\s]+)₽/g);
      if (amountMatch) {
        for (const match of amountMatch) {
          const numStr = match.replace(/[^\d]/g, '');
          const num = parseInt(numStr, 10);
          if (num > totalAmount) {
            totalAmount = num;
          }
        }
      }
      console.log('Fallback parsed amount:', totalAmount);
    }
    
    console.log('Parsed donation amount:', totalAmount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        amount: totalAmount,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        } 
      }
    );
  } catch (error: unknown) {
    console.error('Error fetching donation amount:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        // Fallback amount if fetch fails
        amount: 4432610
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
