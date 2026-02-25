// scripts/migrate-to-paid-articles.js
// 記事→教材 有料化のためのDB移行スクリプト
// 実行: node scripts/migrate-to-paid-articles.js

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("環境変数が設定されていません:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL");
  console.error("  SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log("=== 教材有料化マイグレーション開始 ===\n");

  // Step 1: articles テーブルに price カラム追加
  console.log("1. articles テーブルに price カラム追加...");
  const { error: e1 } = await supabase.rpc("exec_sql", {
    sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0;`,
  });
  if (e1) {
    console.log("   price カラムは既に存在するか、RPC未対応のためSQLで直接実行してください:");
    console.log("   ALTER TABLE articles ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0;");
  } else {
    console.log("   完了");
  }

  // Step 2: purchases.course_id を NULLABLE に変更
  console.log("2. purchases.course_id を NULLABLE に変更...");
  const { error: e2 } = await supabase.rpc("exec_sql", {
    sql: `ALTER TABLE purchases ALTER COLUMN course_id DROP NOT NULL;`,
  });
  if (e2) {
    console.log("   RPC未対応のためSQLで直接実行してください:");
    console.log("   ALTER TABLE purchases ALTER COLUMN course_id DROP NOT NULL;");
  } else {
    console.log("   完了");
  }

  // Step 3: purchases に article_id カラム追加
  console.log("3. purchases に article_id カラム追加...");
  const { error: e3 } = await supabase.rpc("exec_sql", {
    sql: `ALTER TABLE purchases ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES articles(id);`,
  });
  if (e3) {
    console.log("   RPC未対応のためSQLで直接実行してください:");
    console.log("   ALTER TABLE purchases ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES articles(id);");
  } else {
    console.log("   完了");
  }

  // Step 4: CHECK 制約 — course_id か article_id のどちらか一方のみ
  console.log("4. CHECK 制約追加...");
  const { error: e4 } = await supabase.rpc("exec_sql", {
    sql: `
      DO $$ BEGIN
        ALTER TABLE purchases ADD CONSTRAINT purchases_one_target_check
          CHECK (
            (course_id IS NOT NULL AND article_id IS NULL) OR
            (course_id IS NULL AND article_id IS NOT NULL)
          );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `,
  });
  if (e4) {
    console.log("   RPC未対応のためSQLで直接実行してください:");
    console.log(`   ALTER TABLE purchases ADD CONSTRAINT purchases_one_target_check
     CHECK ((course_id IS NOT NULL AND article_id IS NULL) OR (course_id IS NULL AND article_id IS NOT NULL));`);
  } else {
    console.log("   完了");
  }

  // Step 5: UNIQUE 部分インデックス
  console.log("5. UNIQUE 部分インデックス作成...");
  const { error: e5 } = await supabase.rpc("exec_sql", {
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_article_unique ON purchases (user_id, article_id) WHERE article_id IS NOT NULL;`,
  });
  if (e5) {
    console.log("   RPC未対応のためSQLで直接実行してください:");
    console.log("   CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_article_unique ON purchases (user_id, article_id) WHERE article_id IS NOT NULL;");
  } else {
    console.log("   完了");
  }

  // Step 6: articles に rating カラム追加
  console.log("6. articles テーブルに rating カラム追加...");
  const { error: e6 } = await supabase.rpc("exec_sql", {
    sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0;`,
  });
  if (e6) {
    console.log("   RPC未対応のためSQLで直接実行してください:");
    console.log("   ALTER TABLE articles ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0;");
  } else {
    console.log("   完了");
  }

  console.log("\n=== マイグレーション完了 ===");
  console.log("\nRPC (exec_sql) が利用できない場合は、以下のSQLをSupabase SQL Editorで実行してください:\n");
  console.log(`
-- 1. articles に price カラム追加
ALTER TABLE articles ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0;

-- 2. purchases.course_id を NULLABLE に変更
ALTER TABLE purchases ALTER COLUMN course_id DROP NOT NULL;

-- 3. purchases に article_id カラム追加
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES articles(id);

-- 4. CHECK 制約: course_id か article_id のどちらか一方のみ
DO $$ BEGIN
  ALTER TABLE purchases ADD CONSTRAINT purchases_one_target_check
    CHECK (
      (course_id IS NOT NULL AND article_id IS NULL) OR
      (course_id IS NULL AND article_id IS NOT NULL)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. UNIQUE 部分インデックス
CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_article_unique
  ON purchases (user_id, article_id) WHERE article_id IS NOT NULL;

-- 6. articles に rating カラム追加
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0;
  `);
}

migrate().catch(console.error);
