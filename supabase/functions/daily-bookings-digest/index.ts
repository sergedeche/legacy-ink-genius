import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_CHAT_ID = '366095894';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('guest_name, guest_email, seats_count, total_amount, verified_at, events(title, event_date)')
      .eq('status', 'verified')
      .gte('verified_at', since)
      .neq('guest_email', 'reserve@internal.local')
      .neq('guest_email', 'invite@placeholder.local')
      .order('verified_at', { ascending: true });

    if (error) throw error;

    console.log(`Found ${bookings?.length || 0} new verified bookings in last 24h`);

    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: 'No new bookings' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
    const totalAmount = bookings.reduce((s, b) => s + (b.total_amount || 0), 0);
    const totalSeats = bookings.reduce((s, b) => s + (b.seats_count || 0), 0);

    const lines = bookings.map((b: any, i: number) => {
      const ev = b.events?.title || 'мероприятие не указано';
      const evDate = b.events?.event_date
        ? new Date(b.events.event_date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', timeZone: 'Europe/Moscow',
          })
        : '—';
      const email = b.guest_email === 'pending@placeholder.local' ? 'без email' : b.guest_email;
      return `${i + 1}. 👤 ${b.guest_name} (${email})\n   🎭 ${ev} — ${evDate}\n   🪑 ${b.seats_count} мест · 💰 ${fmt(b.total_amount)} ₽`;
    });

    const message = `🌅 Сводка за сутки\n\n📩 Новых броней: ${bookings.length}\n🪑 Всего мест: ${totalSeats}\n💰 Сумма: ${fmt(totalAmount)} ₽\n\n${lines.join('\n\n')}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY')!;

    const tgRes = await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
    });

    const tgData = await tgRes.json();
    if (!tgRes.ok) {
      console.error('Telegram API error:', tgData);
      throw new Error(`Telegram failed: ${JSON.stringify(tgData)}`);
    }

    return new Response(JSON.stringify({ success: true, count: bookings.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('daily-bookings-digest error:', e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
