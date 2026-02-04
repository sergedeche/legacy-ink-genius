-- Fix security issues: Restrict public access to sensitive data

-- 1. Drop overly permissive RLS policies on bookings table
DROP POLICY IF EXISTS "Bookings are publicly readable" ON public.bookings;

-- 2. Create more restrictive policy - bookings can only be read by verification code
-- This is used by edge functions with service role key, so we allow service role full access
CREATE POLICY "Bookings readable by verification code" 
  ON public.bookings 
  FOR SELECT 
  USING (
    -- Allow reading by verification code (passed as header parameter)
    verification_code = current_setting('request.headers', true)::json->>'x-verification-code'
    OR
    -- Allow if accessed from edge function with service role (which bypasses RLS)
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- 3. Drop overly permissive policy on tickets
DROP POLICY IF EXISTS "Tickets are publicly readable" ON public.tickets;

-- 4. Create restrictive policy for tickets - only readable via booking verification
CREATE POLICY "Tickets readable by booking owner"
  ON public.tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = tickets.booking_id 
      AND b.verification_code = current_setting('request.headers', true)::json->>'x-verification-code'
    )
    OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- 5. Add client_ip column to bookings for rate limiting
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_ip TEXT;

-- 6. Create function for rate limiting check
CREATE OR REPLACE FUNCTION public.check_booking_rate_limit(p_client_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.bookings
  WHERE client_ip = p_client_ip
    AND created_at > now() - interval '1 hour';
  
  -- Allow max 5 bookings per IP per hour
  RETURN recent_count < 5;
END;
$$;

-- 7. Change get_booked_seats to SECURITY INVOKER (safer pattern)
DROP FUNCTION IF EXISTS public.get_booked_seats(uuid);

CREATE OR REPLACE FUNCTION public.get_booked_seats(p_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(seats_count), 0)::INTEGER
  FROM public.bookings
  WHERE event_id = p_event_id
    AND status IN ('pending', 'verified')
    AND (status = 'verified' OR expires_at > now());
$$;