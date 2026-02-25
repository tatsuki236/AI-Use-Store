const { Client } = require("pg");

const client = new Client({
  host: "db.swrphzgqjeixmymqyvrq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "ZHZRi9vus$UdDkx",
  ssl: { rejectUnauthorized: false },
});

const articles = [
  {
    title: "ChatGPTを使った文章校正テクニック5選",
    content: `## はじめに

ChatGPTは文章の校正・推敲に非常に優れたツールです。今回は実務で使えるテクニックを5つ紹介します。

## 1. トーンの統一

プロンプト例:

> 以下の文章を、ビジネスメールにふさわしいフォーマルなトーンに統一してください。

## 2. 冗長な表現の削除

「〜することができる」→「〜できる」のような簡潔化を依頼しましょう。

## 3. 誤字脱字チェック

単純なスペルチェックだけでなく、同音異義語の誤用も検出してくれます。

## 4. 読みやすさの改善

一文が長すぎる場合、適切に分割する提案をしてもらえます。

## 5. 表現のバリエーション

同じ言い回しが続く場合、言い換え表現を提案してもらいましょう。

---

> 💡 AIは校正の「ツール」です。最終判断は必ず人間が行いましょう。`,
  },
  {
    title: "Python初心者が最初に覚えるべきライブラリ10選",
    content: `## Pythonのエコシステム

Pythonの強みは豊富なライブラリ。初心者が最初に覚えるべき10個を厳選しました。

### データ処理
1. **pandas** - データ分析の定番
2. **numpy** - 数値計算の基盤
3. **matplotlib** - グラフ描画

### Web開発
4. **Flask** - 軽量Webフレームワーク
5. **requests** - HTTP通信

### 自動化
6. **selenium** - ブラウザ自動操作
7. **schedule** - タスクスケジューリング

### AI/機械学習
8. **scikit-learn** - 機械学習
9. **transformers** - NLP（自然言語処理）

### ユーティリティ
10. **pathlib** - ファイルパス操作（標準ライブラリ）

まずはこの10個を使いこなせるようになりましょう！`,
  },
  {
    title: "Next.js App Router移行で気をつけるべき3つのポイント",
    content: `## Pages RouterからApp Routerへ

Next.js 13以降のApp Routerは多くの改善がありますが、移行時には注意点があります。

### 1. Server Componentsがデフォルト

App Routerでは全てのコンポーネントがデフォルトでServer Componentです。useStateやuseEffectを使うには "use client" を先頭に付ける必要があります。

### 2. データフェッチの方法が変わる

getServerSideProps や getStaticProps は廃止。代わりにコンポーネント内で直接 async/await を使います。

### 3. レイアウトの仕組み

layout.tsx はネスト可能で、共通UIの管理がシンプルになりました。

---

移行は段階的に行うのがおすすめです。`,
  },
  {
    title: "エンジニアのためのデザイン入門 - 最低限知るべき4原則",
    content: `## デザインの4原則

デザイナーでなくても、この4つを意識するだけでUIは格段に良くなります。

### 1. 近接 (Proximity)

関連する要素はグループ化し、関連しない要素は離す。

### 2. 整列 (Alignment)

要素を見えない線に沿って配置する。左揃え、中央揃えを統一。

### 3. 反復 (Repetition)

同じスタイルを繰り返し使うことで一貫性を生む。

### 4. コントラスト (Contrast)

重要な要素は大きく、太く。差をはっきりつける。

---

> これらはRobin Williamsの「ノンデザイナーズ・デザインブック」で詳しく解説されています。`,
  },
  {
    title: "Git rebaseとmergeの使い分け完全ガイド",
    content: `## rebase vs merge

チーム開発で必ず出てくるこの議論。それぞれの特徴を整理しました。

### merge
- マージコミットが作られる
- 履歴がそのまま残る
- **安全**

### rebase
- 履歴が直線的になる
- コミットハッシュが変わる
- **注意が必要**

### 使い分けの指針

| 場面 | 推奨 |
|------|------|
| 共有ブランチへの統合 | merge |
| ローカルでの整理 | rebase |
| mainの最新を取り込み | rebase |
| リリースブランチ | merge |

**ゴールデンルール**: プッシュ済みのコミットはrebaseしない。`,
  },
  {
    title: "TypeScriptの型パズルを楽しもう - Utility Types入門",
    content: `## Utility Typesとは

TypeScriptには便利な組み込み型があります。

### Partial<T>

全プロパティをオプショナルにします。更新処理で一部のフィールドだけ変更したいときに便利です。

### Pick<T, K>

特定のプロパティだけ抽出します。APIレスポンスから必要なフィールドだけ取り出すときに使います。

### Omit<T, K>

特定のプロパティを除外します。Pickの逆バージョンです。

### Record<K, V>

キーと値の型を指定したオブジェクト型を作ります。

これらを組み合わせると、複雑な型も簡潔に表現できます。`,
  },
];

(async () => {
  await client.connect();
  console.log("Connected");

  // 1. Create articles table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.articles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      content text NOT NULL DEFAULT '',
      thumbnail_url text,
      is_free boolean NOT NULL DEFAULT true,
      published boolean NOT NULL DEFAULT false,
      author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log("Created articles table");

  // 2. Enable RLS
  await client.query(`ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;`);

  // 3. Policies
  await client.query(`
    CREATE POLICY "Anyone can view published articles"
    ON public.articles FOR SELECT
    USING (published = true);
  `);
  await client.query(`
    CREATE POLICY "Admins can manage articles"
    ON public.articles FOR ALL
    USING (public.is_admin());
  `);
  console.log("Created RLS policies");

  // 4. Seed
  for (const a of articles) {
    await client.query(
      `INSERT INTO public.articles (title, content, is_free, published) VALUES ($1, $2, true, true)`,
      [a.title, a.content]
    );
    console.log(`  Added: ${a.title}`);
  }

  console.log("\nDone!");
  await client.end();
})();
