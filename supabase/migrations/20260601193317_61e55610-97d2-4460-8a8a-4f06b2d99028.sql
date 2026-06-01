-- Pending Granola attendees queue
CREATE TABLE public.granola_pending_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  name text,
  source_note_id text NOT NULL,
  source_note_title text,
  source_meeting_at timestamptz,
  source_excerpt text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_note_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.granola_pending_attendees TO authenticated;
GRANT ALL ON public.granola_pending_attendees TO service_role;

ALTER TABLE public.granola_pending_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own pending attendees all"
ON public.granola_pending_attendees
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER touch_granola_pending_attendees_updated_at
BEFORE UPDATE ON public.granola_pending_attendees
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_granola_pending_attendees_user_status
  ON public.granola_pending_attendees (user_id, status, created_at DESC);

-- Public brief access log (write-only from edge functions)
CREATE TABLE public.brief_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token text NOT NULL,
  ip_hash text,
  user_agent text,
  country text,
  accessed_at timestamptz NOT NULL DEFAULT now()
);

-- Only service_role can read or write the log; no anon/authenticated grants.
GRANT ALL ON public.brief_access_log TO service_role;

ALTER TABLE public.brief_access_log ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated => effectively locked to service_role.

CREATE INDEX idx_brief_access_log_token_time
  ON public.brief_access_log (share_token, accessed_at DESC);
CREATE INDEX idx_brief_access_log_ip_time
  ON public.brief_access_log (ip_hash, accessed_at DESC);
