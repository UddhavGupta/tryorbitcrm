ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS next_follow_up_date date;