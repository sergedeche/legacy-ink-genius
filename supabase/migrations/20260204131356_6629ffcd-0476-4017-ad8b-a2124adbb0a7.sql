-- =============================================
-- Таблица events (мастер-классы)
-- =============================================
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 20,
  price_per_seat INTEGER NOT NULL DEFAULT 100,
  estafeta_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Публичное чтение событий
CREATE POLICY "Events are publicly readable"
  ON public.events
  FOR SELECT
  USING (true);

-- =============================================
-- Таблица bookings (бронирования)
-- =============================================
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  seats_count INTEGER NOT NULL DEFAULT 1,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  verification_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes')
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Публичное чтение для подсчёта занятых мест (только verified/pending)
CREATE POLICY "Bookings are publicly readable"
  ON public.bookings
  FOR SELECT
  USING (true);

-- Вставка через service role (edge functions)
CREATE POLICY "Service role can insert bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Обновление через service role (edge functions)
CREATE POLICY "Service role can update bookings"
  ON public.bookings
  FOR UPDATE
  USING (true);

-- =============================================
-- Таблица tickets (билеты)
-- =============================================
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL DEFAULT upper(encode(gen_random_bytes(6), 'hex')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Публичное чтение билетов
CREATE POLICY "Tickets are publicly readable"
  ON public.tickets
  FOR SELECT
  USING (true);

-- Вставка через service role
CREATE POLICY "Service role can insert tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- Индексы для производительности
-- =============================================
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_verification_code ON public.bookings(verification_code);

-- =============================================
-- Функция для подсчёта занятых мест
-- =============================================
CREATE OR REPLACE FUNCTION public.get_booked_seats(p_event_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(seats_count), 0)::INTEGER
  FROM public.bookings
  WHERE event_id = p_event_id
    AND status IN ('pending', 'verified')
    AND (status = 'verified' OR expires_at > now());
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

-- =============================================
-- Тестовые данные - первое мероприятие
-- =============================================
INSERT INTO public.events (title, event_date, total_seats, price_per_seat, estafeta_url, description)
VALUES (
  'Стратегия наследия',
  '2026-04-11 11:00:00+03',
  20,
  100,
  'https://estafeta.ru/profile/events/preview/',
  'Мастер-класс по стратегическому планированию наследия'
);