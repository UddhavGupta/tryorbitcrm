ALTER TABLE public.relationship_briefs ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

CREATE OR REPLACE FUNCTION public.get_shared_brief(_token text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'content', b.content,
    'updated_at', b.updated_at,
    'edited', b.edited,
    'contact', jsonb_build_object(
      'name', c.name,
      'last_name', c.last_name,
      'title', c.title,
      'company', c.company
    )
  )
  FROM public.relationship_briefs b
  JOIN public.contacts c ON c.id = b.contact_id
  WHERE b.share_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_brief(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_brief(text) TO anon, authenticated;