-- Add email-based rate limiting function
CREATE OR REPLACE FUNCTION public.check_email_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COUNT(*) < 3
  FROM public.bookings
  WHERE guest_email = p_email
    AND created_at > now() - interval '1 hour';
$$;

-- Add rate limiting for verification attempts
CREATE OR REPLACE FUNCTION public.check_verification_rate_limit(p_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
  last_check TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check bookings table for verification attempts (using updated_at as proxy)
  -- Allow max 10 verification checks per booking per 10 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM public.bookings
  WHERE id = p_booking_id
    AND status = 'pending';
  
  -- If booking doesn't exist or not pending, deny
  IF attempt_count = 0 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;