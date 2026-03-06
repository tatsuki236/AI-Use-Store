// scripts/migration-sync.js
// HP（コード）とSupabaseの差異を解消するマイグレーション
// 実行: node scripts/migration-sync.js

const { Client } = require("pg");

const client = new Client({
  host: "db.swrphzgqjeixmymqyvrq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "ZHZRi9vus$UdDkx",
  ssl: { rejectUnauthorized: false },
});

async function run(label, sql) {
  try {
    await client.query(sql);
    console.log(`  ✓ ${label}`);
  } catch (e) {
    if (
      e.message.includes("already exists") ||
      e.message.includes("duplicate")
    ) {
      console.log(`  - ${label} (既に存在)`);
    } else {
      console.error(`  ✗ ${label}: ${e.message}`);
    }
  }
}

(async () => {
  await client.connect();
  console.log("Connected to Supabase\n");

  // ============================================================
  // 1. is_admin() ヘルパー関数
  // ============================================================
  console.log("1. ヘルパー関数");
  await run(
    "is_admin()",
    `CREATE OR REPLACE FUNCTION public.is_admin()
     RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
       SELECT EXISTS (
         SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
       );
     $$;`
  );

  // ============================================================
  // 1b. profiles テーブル追加カラム
  // ============================================================
  console.log("\n1b. profiles テーブル追加カラム");
  await run(
    "profiles.display_name",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;"
  );
  await run(
    "profiles.avatar_url",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;"
  );

  // Allow anyone to read display_name/avatar for article author display
  await run(
    "policy: Anyone can view public profile fields",
    `DO $$ BEGIN
       DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
       CREATE POLICY "Anyone can view public profile fields"
         ON public.profiles FOR SELECT USING (true);
     END $$;`
  );

  // ============================================================
  // 2. articles テーブル
  // ============================================================
  console.log("\n2. articles テーブル");
  await run(
    "CREATE TABLE articles",
    `CREATE TABLE IF NOT EXISTS public.articles (
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
    );`
  );

  // status カラムに check 制約 (既に存在の場合はスキップ)
  await run(
    "articles status check",
    `DO $$ BEGIN
       ALTER TABLE public.articles ADD CONSTRAINT articles_status_check
         CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$;`
  );

  // 既存テーブルに不足カラムがあれば追加
  const articleColumns = [
    ["price", "integer NOT NULL DEFAULT 0"],
    ["is_free", "boolean NOT NULL DEFAULT false"],
    ["published", "boolean NOT NULL DEFAULT false"],
    ["thumbnail_url", "text"],
    ["status", "text NOT NULL DEFAULT 'draft'"],
    ["rejection_reason", "text"],
    ["rating", "numeric(2,1) NOT NULL DEFAULT 0"],
    ["author_id", "uuid REFERENCES auth.users(id) ON DELETE CASCADE"],
    ["updated_at", "timestamptz NOT NULL DEFAULT now()"],
    ["purchase_count", "integer NOT NULL DEFAULT 0"],
    ["review_count", "integer NOT NULL DEFAULT 0"],
    ["category", "text"],
  ];
  for (const [col, type] of articleColumns) {
    await run(
      `articles.${col}`,
      `ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS ${col} ${type};`
    );
  }

  // RLS
  await run("articles RLS", "ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;");

  const articlePolicies = [
    [
      "Anyone can view published articles",
      "SELECT",
      "USING (published = true)",
    ],
    [
      "Users can view own articles",
      "SELECT",
      "USING (auth.uid() = author_id)",
    ],
    [
      "Users can insert own articles",
      "INSERT",
      "WITH CHECK (auth.uid() = author_id)",
    ],
    [
      "Users can update own articles",
      "UPDATE",
      "USING (auth.uid() = author_id)",
    ],
    ["Admins can manage all articles", "ALL", "USING (public.is_admin())"],
  ];
  for (const [name, action, clause] of articlePolicies) {
    await run(
      `policy: ${name}`,
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "${name}" ON public.articles;
         CREATE POLICY "${name}" ON public.articles FOR ${action} ${clause};
       END $$;`
    );
  }

  // ============================================================
  // 3. purchases テーブル修正
  // ============================================================
  console.log("\n3. purchases テーブル修正");
  await run(
    "purchases.course_id NULLABLE",
    "ALTER TABLE public.purchases ALTER COLUMN course_id DROP NOT NULL;"
  );
  await run(
    "purchases.article_id",
    "ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE;"
  );
  await run(
    "purchases_one_target_check",
    `DO $$ BEGIN
       ALTER TABLE public.purchases ADD CONSTRAINT purchases_one_target_check
         CHECK (
           (course_id IS NOT NULL AND article_id IS NULL) OR
           (course_id IS NULL AND article_id IS NOT NULL)
         );
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$;`
  );
  await run(
    "purchases_user_article_unique",
    "CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_article_unique ON public.purchases (user_id, article_id) WHERE article_id IS NOT NULL;"
  );

  // ============================================================
  // 4. reviews テーブル
  // ============================================================
  console.log("\n4. reviews テーブル");
  await run(
    "CREATE TABLE reviews",
    `CREATE TABLE IF NOT EXISTS public.reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
      rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, article_id)
    );`
  );
  await run("idx_reviews_article_id", "CREATE INDEX IF NOT EXISTS idx_reviews_article_id ON public.reviews(article_id);");
  await run("idx_reviews_user_id", "CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);");
  await run("reviews RLS", "ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;");

  const reviewPolicies = [
    ["Anyone can view reviews", "SELECT", "USING (true)"],
    ["Users can insert own reviews", "INSERT", "WITH CHECK (auth.uid() = user_id)"],
    ["Users can update own reviews", "UPDATE", "USING (auth.uid() = user_id)"],
    ["Users can delete own reviews", "DELETE", "USING (auth.uid() = user_id)"],
    ["Admins can manage all reviews", "ALL", "USING (public.is_admin())"],
  ];
  for (const [name, action, clause] of reviewPolicies) {
    await run(
      `policy: ${name}`,
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "${name}" ON public.reviews;
         CREATE POLICY "${name}" ON public.reviews FOR ${action} ${clause};
       END $$;`
    );
  }

  // ============================================================
  // 5. seller_profiles テーブル
  // ============================================================
  console.log("\n5. seller_profiles テーブル");
  await run(
    "CREATE TABLE seller_profiles",
    `CREATE TABLE IF NOT EXISTS public.seller_profiles (
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
    );`
  );

  // status check
  await run(
    "seller_profiles status check",
    `DO $$ BEGIN
       ALTER TABLE public.seller_profiles ADD CONSTRAINT seller_profiles_status_check
         CHECK (status IN ('pending', 'approved', 'rejected'));
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$;`
  );

  // 不足カラムの追加
  const sellerColumns = [
    ["rejection_reason", "text"],
    ["bank_name", "text"],
    ["branch_name", "text"],
    ["account_number", "text"],
    ["account_holder_name", "text"],
    ["id_document_url", "text"],
    ["verified_address", "text"],
    ["bank_verified_at", "timestamptz"],
    ["updated_at", "timestamptz NOT NULL DEFAULT now()"],
  ];
  for (const [col, type] of sellerColumns) {
    await run(
      `seller_profiles.${col}`,
      `ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS ${col} ${type};`
    );
  }

  await run("seller_profiles RLS", "ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;");

  const sellerPolicies = [
    ["Users can view own seller profile", "SELECT", "USING (auth.uid() = user_id)"],
    ["Users can insert own seller profile", "INSERT", "WITH CHECK (auth.uid() = user_id)"],
    ["Users can update own seller profile", "UPDATE", "USING (auth.uid() = user_id)"],
    ["Admins can manage all seller profiles", "ALL", "USING (public.is_admin())"],
  ];
  for (const [name, action, clause] of sellerPolicies) {
    await run(
      `policy: ${name}`,
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "${name}" ON public.seller_profiles;
         CREATE POLICY "${name}" ON public.seller_profiles FOR ${action} ${clause};
       END $$;`
    );
  }

  // ============================================================
  // 6. withdrawal_requests テーブル
  // ============================================================
  console.log("\n6. withdrawal_requests テーブル");
  await run(
    "CREATE TABLE withdrawal_requests",
    `CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
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
    );`
  );

  await run(
    "withdrawal_requests status check",
    `DO $$ BEGIN
       ALTER TABLE public.withdrawal_requests ADD CONSTRAINT withdrawal_requests_status_check
         CHECK (status IN ('pending', 'approved', 'completed', 'rejected'));
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$;`
  );

  const withdrawalColumns = [
    ["rejection_reason", "text"],
    ["updated_at", "timestamptz NOT NULL DEFAULT now()"],
  ];
  for (const [col, type] of withdrawalColumns) {
    await run(
      `withdrawal_requests.${col}`,
      `ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS ${col} ${type};`
    );
  }

  await run("withdrawal_requests RLS", "ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;");

  const withdrawalPolicies = [
    ["Users can view own withdrawals", "SELECT", "USING (auth.uid() = user_id)"],
    ["Users can insert own withdrawals", "INSERT", "WITH CHECK (auth.uid() = user_id)"],
    ["Admins can manage all withdrawals", "ALL", "USING (public.is_admin())"],
  ];
  for (const [name, action, clause] of withdrawalPolicies) {
    await run(
      `policy: ${name}`,
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "${name}" ON public.withdrawal_requests;
         CREATE POLICY "${name}" ON public.withdrawal_requests FOR ${action} ${clause};
       END $$;`
    );
  }

  // ============================================================
  // 7. stripe_payments テーブル (新規)
  // ============================================================
  console.log("\n7. stripe_payments テーブル");
  await run(
    "CREATE TABLE stripe_payments",
    `CREATE TABLE IF NOT EXISTS public.stripe_payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
      user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
      article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL NOT NULL,
      stripe_session_id text UNIQUE NOT NULL,
      stripe_payment_intent text,
      amount integer NOT NULL,
      platform_fee integer NOT NULL DEFAULT 0,
      seller_amount integer NOT NULL DEFAULT 0,
      currency text NOT NULL DEFAULT 'jpy',
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );`
  );

  await run(
    "stripe_payments status check",
    `DO $$ BEGIN
       ALTER TABLE public.stripe_payments ADD CONSTRAINT stripe_payments_status_check
         CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
     EXCEPTION WHEN duplicate_object THEN NULL;
     END $$;`
  );

  await run("stripe_payments RLS", "ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;");

  await run(
    "policy: Admins can manage all stripe_payments",
    `DO $$ BEGIN
       DROP POLICY IF EXISTS "Admins can manage all stripe_payments" ON public.stripe_payments;
       CREATE POLICY "Admins can manage all stripe_payments"
         ON public.stripe_payments FOR ALL USING (public.is_admin());
     END $$;`
  );
  await run(
    "policy: Users can view own stripe_payments",
    `DO $$ BEGIN
       DROP POLICY IF EXISTS "Users can view own stripe_payments" ON public.stripe_payments;
       CREATE POLICY "Users can view own stripe_payments"
         ON public.stripe_payments FOR SELECT USING (auth.uid() = user_id);
     END $$;`
  );
  // Service role insert policy (for webhook)
  await run(
    "policy: Service role can insert stripe_payments",
    `DO $$ BEGIN
       DROP POLICY IF EXISTS "Service role can insert stripe_payments" ON public.stripe_payments;
       CREATE POLICY "Service role can insert stripe_payments"
         ON public.stripe_payments FOR INSERT WITH CHECK (true);
     END $$;`
  );

  // ============================================================
  // 8. banners テーブル (新規)
  // ============================================================
  console.log("\n8. banners テーブル");
  await run(
    "CREATE TABLE banners",
    `CREATE TABLE IF NOT EXISTS public.banners (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      image_url text NOT NULL,
      link_url text,
      is_active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );`
  );

  await run("banners RLS", "ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;");

  await run(
    "policy: Anyone can view active banners",
    `DO $$ BEGIN
       DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
       CREATE POLICY "Anyone can view active banners"
         ON public.banners FOR SELECT USING (is_active = true);
     END $$;`
  );
  await run(
    "policy: Admins can manage banners",
    `DO $$ BEGIN
       DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
       CREATE POLICY "Admins can manage banners"
         ON public.banners FOR ALL USING (public.is_admin());
     END $$;`
  );

  // ============================================================
  // 8b. likes テーブル (新規)
  // ============================================================
  console.log("\n8b. likes テーブル");
  await run(
    "CREATE TABLE likes",
    `CREATE TABLE IF NOT EXISTS public.likes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, article_id)
    );`
  );
  await run("idx_likes_article_id", "CREATE INDEX IF NOT EXISTS idx_likes_article_id ON public.likes(article_id);");
  await run("idx_likes_user_id", "CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);");
  await run(
    "articles.like_count",
    "ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;"
  );
  await run("likes RLS", "ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;");

  const likesPolicies = [
    ["Anyone can view likes", "SELECT", "USING (true)"],
    ["Users can insert own likes", "INSERT", "WITH CHECK (auth.uid() = user_id)"],
    ["Users can delete own likes", "DELETE", "USING (auth.uid() = user_id)"],
    ["Admins can manage all likes", "ALL", "USING (public.is_admin())"],
  ];
  for (const [name, action, clause] of likesPolicies) {
    await run(
      `policy: ${name}`,
      `DO $$ BEGIN
         DROP POLICY IF EXISTS "${name}" ON public.likes;
         CREATE POLICY "${name}" ON public.likes FOR ${action} ${clause};
       END $$;`
    );
  }

  // ============================================================
  // 9. トリガー・関数
  // ============================================================
  console.log("\n9. トリガー・関数");

  await run(
    "update_article_rating()",
    `CREATE OR REPLACE FUNCTION public.update_article_rating()
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
     END; $$;`
  );

  await run("DROP trg_update_article_rating", "DROP TRIGGER IF EXISTS trg_update_article_rating ON public.reviews;");
  await run(
    "trg_update_article_rating",
    `CREATE TRIGGER trg_update_article_rating
     AFTER INSERT OR UPDATE OR DELETE ON public.reviews
     FOR EACH ROW EXECUTE FUNCTION public.update_article_rating();`
  );

  // purchase_count 自動更新トリガー
  await run(
    "update_article_purchase_count()",
    `CREATE OR REPLACE FUNCTION public.update_article_purchase_count()
     RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
     DECLARE
       target_article_id uuid;
     BEGIN
       IF TG_OP = 'DELETE' THEN target_article_id := OLD.article_id;
       ELSE target_article_id := NEW.article_id; END IF;
       IF target_article_id IS NOT NULL THEN
         UPDATE public.articles SET purchase_count = (
           SELECT COUNT(*) FROM public.purchases p
           WHERE p.article_id = target_article_id AND p.status = 'completed'
         ) WHERE id = target_article_id;
       END IF;
       IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
       RETURN NEW;
     END; $$;`
  );

  await run("DROP trg_update_article_purchase_count", "DROP TRIGGER IF EXISTS trg_update_article_purchase_count ON public.purchases;");
  await run(
    "trg_update_article_purchase_count",
    `CREATE TRIGGER trg_update_article_purchase_count
     AFTER INSERT OR UPDATE OR DELETE ON public.purchases
     FOR EACH ROW EXECUTE FUNCTION public.update_article_purchase_count();`
  );

  // review_count 自動更新トリガー
  await run(
    "update_article_review_count()",
    `CREATE OR REPLACE FUNCTION public.update_article_review_count()
     RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
     DECLARE
       target_article_id uuid;
     BEGIN
       IF TG_OP = 'DELETE' THEN target_article_id := OLD.article_id;
       ELSE target_article_id := NEW.article_id; END IF;
       UPDATE public.articles SET review_count = (
         SELECT COUNT(*) FROM public.reviews r
         WHERE r.article_id = target_article_id
       ) WHERE id = target_article_id;
       IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
       RETURN NEW;
     END; $$;`
  );

  await run("DROP trg_update_article_review_count", "DROP TRIGGER IF EXISTS trg_update_article_review_count ON public.reviews;");
  await run(
    "trg_update_article_review_count",
    `CREATE TRIGGER trg_update_article_review_count
     AFTER INSERT OR UPDATE OR DELETE ON public.reviews
     FOR EACH ROW EXECUTE FUNCTION public.update_article_review_count();`
  );

  // like_count 自動更新トリガー
  await run(
    "update_article_like_count()",
    `CREATE OR REPLACE FUNCTION public.update_article_like_count()
     RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
     DECLARE
       target_article_id uuid;
     BEGIN
       IF TG_OP = 'DELETE' THEN target_article_id := OLD.article_id;
       ELSE target_article_id := NEW.article_id; END IF;
       UPDATE public.articles SET like_count = (
         SELECT COUNT(*) FROM public.likes l
         WHERE l.article_id = target_article_id
       ) WHERE id = target_article_id;
       IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
       RETURN NEW;
     END; $$;`
  );

  await run("DROP trg_update_article_like_count", "DROP TRIGGER IF EXISTS trg_update_article_like_count ON public.likes;");
  await run(
    "trg_update_article_like_count",
    `CREATE TRIGGER trg_update_article_like_count
     AFTER INSERT OR DELETE ON public.likes
     FOR EACH ROW EXECUTE FUNCTION public.update_article_like_count();`
  );

  await run(
    "get_course_lessons()",
    `CREATE OR REPLACE FUNCTION public.get_course_lessons(p_course_id uuid)
     RETURNS TABLE (id uuid, title text, sort_order integer)
     LANGUAGE sql STABLE SECURITY DEFINER AS $$
       SELECT id, title, sort_order FROM public.lessons
       WHERE course_id = p_course_id ORDER BY sort_order;
     $$;`
  );

  await run(
    "get_hero_stats()",
    `CREATE OR REPLACE FUNCTION public.get_hero_stats()
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
     $$;`
  );

  // ============================================================
  // 10. 検証
  // ============================================================
  console.log("\n10. 検証");

  const { rows: tables } = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  console.log("\nテーブル一覧:");
  tables.forEach((r) => console.log(`  ${r.tablename}`));

  const { rows: funcs } = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public'
    ORDER BY routine_name
  `);
  console.log("\n関数一覧:");
  funcs.forEach((r) => console.log(`  ${r.routine_name}`));

  const expectedTables = [
    "profiles", "courses", "lessons", "articles",
    "purchases", "reviews", "seller_profiles", "withdrawal_requests",
    "stripe_payments", "banners", "likes",
  ];
  const existingTables = tables.map((r) => r.tablename);
  const missing = expectedTables.filter((t) => !existingTables.includes(t));
  if (missing.length > 0) {
    console.log(`\n⚠ 不足テーブル: ${missing.join(", ")}`);
  } else {
    console.log("\n✓ 全テーブルが存在します");
  }

  // Check new columns on articles
  const { rows: cols } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'articles'
    ORDER BY ordinal_position
  `);
  console.log("\narticles カラム:");
  cols.forEach((r) => console.log(`  ${r.column_name}`));

  await client.end();
  console.log("\nDone!");
})();
