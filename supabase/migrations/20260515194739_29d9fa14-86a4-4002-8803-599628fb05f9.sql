CREATE TABLE public.custom_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  contact_id uuid,
  title text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'other',
  notes text,
  recurring boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own custom_dates all"
ON public.custom_dates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER custom_dates_touch_updated_at
BEFORE UPDATE ON public.custom_dates
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_custom_dates_user ON public.custom_dates(user_id);
CREATE INDEX idx_custom_dates_contact ON public.custom_dates(contact_id);