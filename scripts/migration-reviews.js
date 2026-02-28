const { Client } = require("pg");

const client = new Client({
  host: "db.swrphzgqjeixmymqyvrq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "ZHZRi9vus$UdDkx",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log("Connected");

  // ============================================================
  // 1. reviews テーブル作成
  // ============================================================
  await client.query(`
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
  `);
  console.log("Created reviews table");

  // ============================================================
  // 2. インデックス作成
  // ============================================================
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_reviews_article_id ON public.reviews(article_id);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
  `);
  console.log("Created indexes on reviews");

  // ============================================================
  // 3. トリガー: レビュー変更時に articles.rating を自動更新
  // ============================================================
  await client.query(`
    CREATE OR REPLACE FUNCTION public.update_article_rating()
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
      SET rating = (
        SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)
        FROM public.reviews r
        WHERE r.article_id = target_article_id
      )
      WHERE id = target_article_id;

      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;
      RETURN NEW;
    END;
    $$;
  `);
  console.log("Created update_article_rating function");

  await client.query(`
    DROP TRIGGER IF EXISTS trg_update_article_rating ON public.reviews;
  `);
  await client.query(`
    CREATE TRIGGER trg_update_article_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_article_rating();
  `);
  console.log("Created trigger on reviews");

  // ============================================================
  // 4. RLS ポリシー: reviews
  // ============================================================
  await client.query(`ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;`);

  const reviewPolicies = [
    "Anyone can view reviews",
    "Users can insert own reviews",
    "Users can update own reviews",
    "Users can delete own reviews",
    "Admins can manage all reviews",
  ];
  for (const name of reviewPolicies) {
    await client.query(`DROP POLICY IF EXISTS "${name}" ON public.reviews`);
  }

  await client.query(`
    CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);
  `);
  await client.query(`
    CREATE POLICY "Users can insert own reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Admins can manage all reviews"
    ON public.reviews FOR ALL
    USING (public.is_admin());
  `);
  console.log("Created reviews RLS policies");

  // ============================================================
  // 5. RPC関数: get_hero_stats()
  // ============================================================
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_hero_stats()
    RETURNS json
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    AS $$
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
  `);
  console.log("Created get_hero_stats RPC function");

  // ============================================================
  // 6. Verify
  // ============================================================
  const { rows } = await client.query(`
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews'
    ORDER BY policyname
  `);
  console.log("\nReviews policies:");
  rows.forEach((r) => console.log(`  ${r.policyname}`));

  const { rows: funcCheck } = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name IN ('update_article_rating', 'get_hero_stats')
  `);
  console.log("\nFunctions created:");
  funcCheck.forEach((r) => console.log(`  ${r.routine_name}`));

  await client.end();
  console.log("\nDone!");
})();
