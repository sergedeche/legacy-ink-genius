import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_CHAT_ID = '366095894';
const ESTAFETA_URL = 'https://estafeta.ru/events/master-klass/ekskurs-strategiya-naslediya-343403/';

type Donation = { name: string; amount: number; at: Date };

// Parses donor list from estafeta page HTML.
// Each donor row contains a name, an amount like "25 000&nbsp;₽" and a date "DD.MM.YYYY HH:MM:SS"
async function fetchDonations(): Promise<{ total: number | null; donations: Donation[] }> {
  try {
    const res = await fetch(ESTAFETA_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });
    if (!res.ok) return { total: null, donations: [] };
    const html = await res.text();

    // Total amount collected
    let total: number | null = null;
    const statusMatch = html.match(/event-status__value[^>]*>([^<]+)</);
    if (statusMatch && statusMatch[1]) {
      total = parseInt(statusMatch[1].replace(/[^\d]/g, ''), 10) || 0;
    }

    // Strip tags and decode entities to plain text for regex parsing
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ');

    // Pattern: "<Name> <amount> ₽ DD.MM.YYYY HH:MM:SS"
    // Name can be a single letter + space + first name, or multi-word, before the amount.
    const re = /([A-ZА-ЯЁ][A-Za-zА-Яа-яЁё .\-]{0,60}?)\s+(\d[\d  ]*)\s*₽\s+(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/g;
    const donations: Donation[] = [];
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const name = m[1].trim().replace(/\s{2,}/g, ' ');
      const amount = parseInt(m[2].replace(/\D/g, ''), 10);
      if (!amount) continue;
      // Build ISO date in MSK (UTC+3)
      const iso = `${m[5]}-${m[4]}-${m[3]}T${m[6]}:${m[7]}:${m[8]}+03:00`;
      const at = new Date(iso);
      if (isNaN(at.getTime())) continue;
      const key = `${at.toISOString()}|${name}|${amount}`;
      if (seen.has(key)) continue;
      seen.add(key);
      donations.push({ name, amount, at });
    }
    donations.sort((a, b) => a.at.getTime() - b.at.getTime());
    return { total, donations };
  } catch (e) {
    console.error('fetchDonations error:', e);
    return { total: null, donations: [] };
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

    // Tracker: last seen donation timestamp
    const { data: tracker } = await supabase
      .from('donation_tracker')
      .select('last_amount, last_donation_at')
      .eq('id', 1)
      .maybeSingle();

    const lastDonationAt: Date | null = tracker?.last_donation_at
      ? new Date(tracker.last_donation_at as string)
      : null;

    // Fallback window: last 24h if we've never tracked before
    const fallbackSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since = lastDonationAt && lastDonationAt > new Date(0) ? lastDonationAt : fallbackSince;

    const { total, donations } = await fetchDonations();
    const newDonations = donations.filter(d => d.at > since);

    // Persist tracker
    const maxAt = donations.length ? donations[donations.length - 1].at : lastDonationAt;
    if (total !== null || maxAt) {
      await supabase
        .from('donation_tracker')
        .upsert({
          id: 1,
          last_amount: total ?? tracker?.last_amount ?? 0,
          last_donation_at: (maxAt ?? lastDonationAt)?.toISOString() ?? null,
          updated_at: new Date().toISOString(),
        });
    }

    // Verified bookings (last 24h) — to correlate
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: verifiedBookings } = await supabase
      .from('bookings')
      .select('guest_name, guest_email, seats_count, total_amount, verified_at, events(title, event_date)')
      .eq('status', 'verified')
      .gte('verified_at', since24h)
      .neq('guest_email', 'reserve@internal.local')
      .neq('guest_email', 'invite@placeholder.local')
      .order('verified_at', { ascending: true });

    // Pending/expired bookings (last 24h) — to suggest who might be the donor
    const { data: pendingBookings } = await supabase
      .from('bookings')
      .select('guest_name, guest_email, seats_count, total_amount, status, created_at, events(title, event_date)')
      .in('status', ['pending', 'expired'])
      .gte('created_at', since24h)
      .neq('guest_email', 'reserve@internal.local')
      .neq('guest_email', 'invite@placeholder.local')
      .order('created_at', { ascending: true });

    const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
    const verified = verifiedBookings || [];
    const pending = pendingBookings || [];
    const verifiedAmount = verified.reduce((s, b: any) => s + (b.total_amount || 0), 0);

    const parts: string[] = ['🌅 Сводка за сутки'];

    // 1. New donations from estafeta — the source of truth
    if (newDonations.length > 0) {
      const sum = newDonations.reduce((s, d) => s + d.amount, 0);
      const lines = newDonations.map((d, i) => {
        const t = d.at.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        return `${i + 1}. 💖 ${d.name} — ${fmt(d.amount)} ₽\n   🕐 ${t}`;
      });
      parts.push(`\n💳 Новые пожертвования на Эстафете: ${newDonations.length} · ${fmt(sum)} ₽\n\n${lines.join('\n\n')}`);
    } else {
      parts.push('\n💳 Новых пожертвований на Эстафете нет.');
    }

    if (total !== null) {
      parts.push(`\n📊 Всего собрано: ${fmt(total)} ₽`);
    }

    // 2. Verified bookings
    if (verified.length > 0) {
      const lines = verified.map((b: any, i: number) => {
        const ev = b.events?.title || 'мероприятие не указано';
        const evDate = b.events?.event_date
          ? new Date(b.events.event_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' })
          : '—';
        const email = b.guest_email === 'pending@placeholder.local' ? 'без email' : b.guest_email;
        return `${i + 1}. 👤 ${b.guest_name} (${email})\n   🎭 ${ev} — ${evDate}\n   🪑 ${b.seats_count} · 💰 ${fmt(b.total_amount)} ₽`;
      });
      parts.push(`\n✅ Подтверждённых броней: ${verified.length} · ${fmt(verifiedAmount)} ₽\n\n${lines.join('\n\n')}`);
    }

    // 3. Pending/expired bookings (candidates for unmatched donations)
    if (pending.length > 0) {
      const lines = pending.map((b: any, i: number) => {
        const statusLabel = b.status === 'pending' ? '⏳ ожидает' : '⌛ истекла';
        const email = b.guest_email === 'pending@placeholder.local' ? 'без email' : b.guest_email;
        return `${i + 1}. 👤 ${b.guest_name} (${email}) — ${statusLabel}\n   🪑 ${b.seats_count} · 💰 ${fmt(b.total_amount)} ₽`;
      });
      parts.push(`\n📝 Неподтверждённые брони: ${pending.length}\n\n${lines.join('\n\n')}`);
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
      newDonations: newDonations.length,
      total,
      verified: verified.length,
      pending: pending.length,
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
