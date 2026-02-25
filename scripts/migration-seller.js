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
  // 1. seller_profiles テーブル作成
  //    口座・身分証は出金申請時に提出するため nullable
  // ============================================================
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.seller_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      full_name text NOT NULL,
      address text NOT NULL,
      phone text NOT NULL,
      date_of_birth date NOT NULL,
      bank_name text,
      branch_name text,
      account_number text,
      account_holder_name text,
      id_document_url text,
      verified_address text,
      bank_verified_at timestamptz,
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      rejection_reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log("Created seller_profiles table");

  // ============================================================
  // 2. withdrawal_requests テーブル作成
  // ============================================================
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      amount integer NOT NULL CHECK (amount > 0),
      bank_name text NOT NULL,
      branch_name text NOT NULL,
      account_number text NOT NULL,
      account_holder_name text NOT NULL,
      id_document_url text,
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
      rejection_reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log("Created withdrawal_requests table");

  // ============================================================
  // 3. articles テーブルに status カラム追加
  // ============================================================
  const { rows: colCheck } = await client.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'status'
  `);

  if (colCheck.length === 0) {
    await client.query(`
      ALTER TABLE public.articles
      ADD COLUMN status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));
    `);
    console.log("Added status column to articles");

    await client.query(`
      UPDATE public.articles SET status = 'published' WHERE published = true;
    `);
    await client.query(`
      UPDATE public.articles SET status = 'draft' WHERE published = false;
    `);
    console.log("Migrated existing articles status");
  } else {
    console.log("status column already exists on articles, skipping");
  }

  const { rows: rejCheck } = await client.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'rejection_reason'
  `);
  if (rejCheck.length === 0) {
    await client.query(`
      ALTER TABLE public.articles ADD COLUMN rejection_reason text;
    `);
    console.log("Added rejection_reason column to articles");
  }

  // ============================================================
  // 4. RLS: seller_profiles
  // ============================================================
  await client.query(`ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;`);

  const sellerPolicies = [
    "Users can view own seller profile",
    "Users can insert own seller profile",
    "Users can update own seller profile",
    "Admins can view all seller profiles",
    "Admins can update all seller profiles",
  ];
  for (const name of sellerPolicies) {
    await client.query(`DROP POLICY IF EXISTS "${name}" ON public.seller_profiles`);
  }

  await client.query(`
    CREATE POLICY "Users can view own seller profile"
    ON public.seller_profiles FOR SELECT
    USING (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Users can insert own seller profile"
    ON public.seller_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Users can update own seller profile"
    ON public.seller_profiles FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('pending', 'rejected'));
  `);
  await client.query(`
    CREATE POLICY "Admins can view all seller profiles"
    ON public.seller_profiles FOR SELECT
    USING (public.is_admin());
  `);
  await client.query(`
    CREATE POLICY "Admins can update all seller profiles"
    ON public.seller_profiles FOR UPDATE
    USING (public.is_admin());
  `);
  console.log("Created seller_profiles RLS policies");

  // ============================================================
  // 5. RLS: withdrawal_requests
  // ============================================================
  await client.query(`ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;`);

  const withdrawalPolicies = [
    "Users can view own withdrawal requests",
    "Users can insert own withdrawal requests",
    "Admins can view all withdrawal requests",
    "Admins can update all withdrawal requests",
  ];
  for (const name of withdrawalPolicies) {
    await client.query(`DROP POLICY IF EXISTS "${name}" ON public.withdrawal_requests`);
  }

  await client.query(`
    CREATE POLICY "Users can view own withdrawal requests"
    ON public.withdrawal_requests FOR SELECT
    USING (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Users can insert own withdrawal requests"
    ON public.withdrawal_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  `);
  await client.query(`
    CREATE POLICY "Admins can view all withdrawal requests"
    ON public.withdrawal_requests FOR SELECT
    USING (public.is_admin());
  `);
  await client.query(`
    CREATE POLICY "Admins can update all withdrawal requests"
    ON public.withdrawal_requests FOR UPDATE
    USING (public.is_admin());
  `);
  console.log("Created withdrawal_requests RLS policies");

  // ============================================================
  // 6. RLS: articles（著者向け追加）
  // ============================================================
  const articlePolicies = [
    "Authors can view own articles",
    "Authors can insert own articles",
    "Authors can update own articles",
    "Authors can delete own draft articles",
  ];
  for (const name of articlePolicies) {
    await client.query(`DROP POLICY IF EXISTS "${name}" ON public.articles`);
  }

  await client.query(`
    CREATE POLICY "Authors can view own articles"
    ON public.articles FOR SELECT
    USING (auth.uid() = author_id);
  `);
  await client.query(`
    CREATE POLICY "Authors can insert own articles"
    ON public.articles FOR INSERT
    WITH CHECK (auth.uid() = author_id);
  `);
  await client.query(`
    CREATE POLICY "Authors can update own articles"
    ON public.articles FOR UPDATE
    USING (auth.uid() = author_id AND status IN ('draft', 'rejected'));
  `);
  await client.query(`
    CREATE POLICY "Authors can delete own draft articles"
    ON public.articles FOR DELETE
    USING (auth.uid() = author_id AND status = 'draft');
  `);
  console.log("Created articles author RLS policies");

  // ============================================================
  // 7. Storage: id-documents バケット
  // ============================================================
  await client.query(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('id-documents', 'id-documents', false)
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log("Created id-documents storage bucket");

  await client.query(`DROP POLICY IF EXISTS "Users can upload own id documents" ON storage.objects;`);
  await client.query(`DROP POLICY IF EXISTS "Users can view own id documents" ON storage.objects;`);
  await client.query(`DROP POLICY IF EXISTS "Admins can view all id documents" ON storage.objects;`);

  await client.query(`
    CREATE POLICY "Users can upload own id documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'id-documents'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `);
  await client.query(`
    CREATE POLICY "Users can view own id documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'id-documents'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  `);
  await client.query(`
    CREATE POLICY "Admins can view all id documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'id-documents'
      AND public.is_admin()
    );
  `);
  console.log("Created storage policies for id-documents");

  // ============================================================
  // 8. Verify
  // ============================================================
  const { rows } = await client.query(`
    SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename
  `);
  console.log("\nCurrent policies:");
  rows.forEach((r) => console.log(`  ${r.tablename}: ${r.policyname}`));

  await client.end();
  console.log("\nDone!");
})();
