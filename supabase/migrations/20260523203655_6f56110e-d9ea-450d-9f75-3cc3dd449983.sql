
CREATE TABLE public.relationship_briefs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  content jsonb NOT NULL,
  edited boolean NOT NULL DEFAULT false,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, contact_id)
);

ALTER TABLE public.relationship_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own relationship_briefs all"
  ON public.relationship_briefs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_relationship_briefs_updated_at
  BEFORE UPDATE ON public.relationship_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_relationship_briefs_user ON public.relationship_briefs(user_id);
CREATE INDEX idx_relationship_briefs_contact ON public.relationship_briefs(contact_id);
