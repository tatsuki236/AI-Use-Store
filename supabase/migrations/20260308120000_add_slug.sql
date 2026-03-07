ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_unique ON public.articles(slug) WHERE slug IS NOT NULL;
