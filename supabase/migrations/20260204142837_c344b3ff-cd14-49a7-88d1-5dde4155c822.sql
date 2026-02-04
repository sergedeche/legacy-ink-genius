-- Create a view that shows bookings with event details
CREATE VIEW public.bookings_with_events AS
SELECT 
  b.id as booking_id,
  b.guest_name,
  b.guest_email,
  b.seats_count,
  b.total_amount,
  b.status,
  b.created_at as booking_created_at,
  b.verified_at,
  e.title as event_title,
  e.event_date,
  t.ticket_code
FROM public.bookings b
LEFT JOIN public.events e ON b.event_id = e.id
LEFT JOIN public.tickets t ON t.booking_id = b.id
ORDER BY e.event_date DESC, b.created_at DESC;