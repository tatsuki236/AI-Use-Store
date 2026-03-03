-- ============================================
-- HP ↔ Supabase 同期マイグレーション
-- Supabase SQL Editor で実行してください
-- ============================================

-- 0. ヘルパー関数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================
-- 1. articles テーブル (不足テーブル)
-- ============================================
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'draft',
  rejection_reason text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- articles: 既存テーブルに不足カラムがあれば追加
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- articles: status check 制約
DO $$ BEGIN
  ALTER TABLE public.articles ADD CONSTRAINT articles_status_check
    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- articles: RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
CREATE POLICY "Anyone can view published articles"
  ON public.articles FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Users can view own articles" ON public.articles;
CREATE POLICY "Users can view own articles"
  ON public.articles FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert own articles" ON public.articles;
CREATE POLICY "Users can insert own articles"
  ON public.articles FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
CREATE POLICY "Users can update own articles"
  ON public.articles FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;
CREATE POLICY "Admins can manage all articles"
  ON public.articles FOR ALL USING (public.is_admin());

-- ============================================
-- 2. purchases テーブル修正
-- ============================================
ALTER TABLE public.purchases ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE;

DO $$ BEGIN
  ALTER TABLE public.purchases ADD CONSTRAINT purchases_one_target_check
    CHECK (
      (course_id IS NOT NULL AND article_id IS NULL) OR
      (course_id IS NULL AND article_id IS NOT NULL)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_article_unique
  ON public.purchases (user_id, article_id) WHERE article_id IS NOT NULL;

-- ============================================
-- 3. reviews テーブル (不足テーブル)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_article_id ON public.reviews(article_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL USING (public.is_admin());

-- ============================================
-- 4. seller_profiles テーブル (不足テーブル)
-- ============================================
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  date_of_birth text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  bank_name text,
  branch_name text,
  account_number text,
  account_holder_name text,
  id_document_url text,
  verified_address text,
  bank_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- seller_profiles: 既存テーブルに不足カラムがあれば追加
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS branch_name text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS account_holder_name text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS id_document_url text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS verified_address text;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS bank_verified_at timestamptz;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.seller_profiles ADD CONSTRAINT seller_profiles_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own seller profile" ON public.seller_profiles;
CREATE POLICY "Users can view own seller profile"
  ON public.seller_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own seller profile" ON public.seller_profiles;
CREATE POLICY "Users can insert own seller profile"
  ON public.seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own seller profile" ON public.seller_profiles;
CREATE POLICY "Users can update own seller profile"
  ON public.seller_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all seller profiles" ON public.seller_profiles;
CREATE POLICY "Admins can manage all seller profiles"
  ON public.seller_profiles FOR ALL USING (public.is_admin());

-- ============================================
-- 5. withdrawal_requests テーブル (不足テーブル)
-- ============================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  bank_name text NOT NULL,
  branch_name text NOT NULL,
  account_number text NOT NULL,
  account_holder_name text NOT NULL,
  id_document_url text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.withdrawal_requests ADD CONSTRAINT withdrawal_requests_status_check
    CHECK (status IN ('pending', 'approved', 'completed', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Users can insert own withdrawals"
  ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawals"
  ON public.withdrawal_requests FOR ALL USING (public.is_admin());

-- ============================================
-- 6. トリガー・関数
-- ============================================

-- レビュー変更時に articles.rating を自動更新
CREATE OR REPLACE FUNCTION public.update_article_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_article_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN target_article_id := OLD.article_id;
  ELSE target_article_id := NEW.article_id; END IF;

  UPDATE public.articles SET rating = (
    SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)
    FROM public.reviews r WHERE r.article_id = target_article_id
  ) WHERE id = target_article_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_update_article_rating ON public.reviews;
CREATE TRIGGER trg_update_article_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_article_rating();

-- コースのレッスンタイトル取得
CREATE OR REPLACE FUNCTION public.get_course_lessons(p_course_id uuid)
RETURNS TABLE (id uuid, title text, sort_order integer)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id, title, sort_order FROM public.lessons
  WHERE course_id = p_course_id ORDER BY sort_order;
$$;

-- ヒーロー統計情報
CREATE OR REPLACE FUNCTION public.get_hero_stats()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT json_build_object(
    'article_count', (SELECT COUNT(*) FROM public.articles WHERE published = true),
    'user_count', (SELECT COUNT(*) FROM public.profiles),
    'satisfaction_percent', (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((AVG(rating) / 5.0) * 100)
        ELSE NULL END
      FROM public.reviews
    )
  );
$$;

-- ============================================
-- 7. 検証クエリ (最後に実行して確認)
-- ============================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
