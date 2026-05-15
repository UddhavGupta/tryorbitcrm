ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS contacts_tags_gin ON public.contacts USING GIN (tags);