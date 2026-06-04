CREATE TABLE public.donation_tracker (
  id INT PRIMARY KEY DEFAULT 1,
  last_amount BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT ALL ON public.donation_tracker TO service_role;
ALTER TABLE public.donation_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages donation tracker" ON public.donation_tracker FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
INSERT INTO public.donation_tracker (id, last_amount) VALUES (1, 0) ON CONFLICT DO NOTHING;