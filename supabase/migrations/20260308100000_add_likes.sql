-- likes テーブル新規作成
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

CREATE INDEX idx_likes_article_id ON public.likes(article_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

-- articles に like_count カラム追加
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;

-- RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all likes"
  ON public.likes FOR ALL
  USING (public.is_admin());

-- like_count 自動更新トリガー
CREATE OR REPLACE FUNCTION public.update_article_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_article_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_article_id := OLD.article_id;
  ELSE
    target_article_id := NEW.article_id;
  END IF;

  UPDATE public.articles
  SET like_count = (
    SELECT COUNT(*) FROM public.likes l
    WHERE l.article_id = target_article_id
  )
  WHERE id = target_article_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_article_like_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_article_like_count();
