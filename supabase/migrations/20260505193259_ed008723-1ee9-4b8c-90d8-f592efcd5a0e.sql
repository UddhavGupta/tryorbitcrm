ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE OR REPLACE FUNCTION public.reminders_set_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.completed AND (OLD.completed IS DISTINCT FROM NEW.completed) THEN
    NEW.completed_at = now();
  ELSIF NOT NEW.completed THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS reminders_completed_at ON public.reminders;
CREATE TRIGGER reminders_completed_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.reminders_set_completed_at();