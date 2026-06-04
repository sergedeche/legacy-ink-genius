import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_CHAT_ID = '366095894';
const ESTAFETA_URL = 'https://estafeta.ru/events/master-klass/ekskurs-strategiya-naslediya-343403/';

async function fetchDonationTotal(): Promise<number | null> {
  try {
    const res = await fetch(ESTAFETA_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/event-status__value[^>]*>([^<]+)</);
    if (m && m[1]) return parseInt(m[1].replace(/[^\d]/g, ''), 10) || 0;
    return null;
  } catch (e) {
    console.error('fetchDonationTotal error:', e);
    return null;
  }
}

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

    const { data: verifiedBookings, error: vErr } = await supabase
      .from('bookings')
      .select('guest_name, guest_email, seats_count, total_amount, verified_at, events(title, event_date)')
      .eq('status', 'verified')
      .gte('verified_at', since)
      .neq('guest_email', 'reserve@internal.local')
      .neq('guest_email', 'invite@placeholder.local')
      .order('verified_at', { ascending: true });
    if (vErr) throw vErr;

    const { data: pendingBookings, error: pErr } = await supabase
      .from('bookings')
      .select('guest_name, guest_email, seats_count, total_amount, status, created_at, events(title, event_date)')
      .in('status', ['pending', 'expired'])
      .gte('created_at', since)
      .neq('guest_email', 'reserve@internal.local')
      .neq('guest_email', 'invite@placeholder.local')
      .order('created_at', { ascending: true });
    if (pErr) throw pErr;

    // Donation tracker delta
    const currentTotal = await fetchDonationTotal();
    let prevTotal = 0;
    const { data: tracker } = await supabase
      .from('donation_tracker')
      .select('last_amount')
      .eq('id', 1)
      .maybeSingle();
    if (tracker) prevTotal = Number(tracker.last_amount) || 0;

    let delta: number | null = null;
    if (currentTotal !== null) {
      delta = currentTotal - prevTotal;
      await supabase
        .from('donation_tracker')
        .upsert({ id: 1, last_amount: currentTotal, updated_at: new Date().toISOString() });
    }

    const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
    const verified = verifiedBookings || [];
    const pending = pendingBookings || [];
    const verifiedAmount = verified.reduce((s, b: any) => s + (b.total_amount || 0), 0);
    const verifiedSeats = verified.reduce((s, b: any) => s + (b.seats_count || 0), 0);

    const formatBooking = (b: any, i: number, withStatus = false) => {
      const ev = b.events?.title || 'мероприятие не указано';
      const evDate = b.events?.event_date
        ? new Date(b.events.event_date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', timeZone: 'Europe/Moscow',
          })
        : '—';
      const email = b.guest_email === 'pending@placeholder.local' ? 'без email' : b.guest_email;
      const statusLabel = withStatus
        ? (b.status === 'pending' ? ' ⏳ ожидает оплаты' : ' ⌛ истекла')
        : '';
      return `${i + 1}. 👤 ${b.guest_name} (${email})${statusLabel}\n   🎭 ${ev} — ${evDate}\n   🪑 ${b.seats_count} мест · 💰 ${fmt(b.total_amount)} ₽`;
    };

    const parts: string[] = ['🌅 Сводка за сутки'];

    if (verified.length === 0) {
      parts.push('\n✅ Новых подтверждённых броней: нет.');
    } else {
      const lines = verified.map((b: any, i: number) => formatBooking(b, i));
      parts.push(`\n✅ Подтверждённых броней: ${verified.length}\n🪑 Мест: ${verifiedSeats} · 💰 ${fmt(verifiedAmount)} ₽\n\n${lines.join('\n\n')}`);
    }

    // Donation total delta — surfaces payments that came in without booking verification
    if (currentTotal !== null && delta !== null) {
      const unaccounted = delta - verifiedAmount;
      parts.push(`\n💳 Сбор на Эстафете: ${fmt(currentTotal)} ₽`);
      if (delta > 0) {
        parts.push(`📈 За сутки прибавилось: ${fmt(delta)} ₽`);
        if (unaccounted > 0) {
          parts.push(`⚠️ Не привязано к броням: ${fmt(unaccounted)} ₽ — возможно, кто-то оплатил, но не подтвердил бронь.`);
        }
      } else if (delta === 0) {
        parts.push('➖ Новых поступлений нет.');
      }
    } else {
      parts.push('\n⚠️ Не удалось получить сумму сбора с Эстафеты.');
    }

    if (pending.length > 0) {
      const lines = pending.map((b: any, i: number) => formatBooking(b, i, true));
      parts.push(`\n📝 Неподтверждённые брони за сутки: ${pending.length}\n\n${lines.join('\n\n')}`);
    }

    const message = parts.join('\n');

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

    return new Response(JSON.stringify({
      success: true,
      verified: verified.length,
      pending: pending.length,
      currentTotal,
      delta,
    }), {
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
