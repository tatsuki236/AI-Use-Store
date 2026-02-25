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

  // Insert sample courses
  const { rows: courses } = await client.query(`
    INSERT INTO public.courses (id, title, description, price, thumbnail_url) VALUES
    (gen_random_uuid(), 'AI入門 - ChatGPTを使いこなす',
     'ChatGPTの基本操作からプロンプトエンジニアリングまで、AIを実務で活用するための実践講座です。初心者でも安心のステップバイステップ形式。',
     2980, NULL),
    (gen_random_uuid(), 'Python × 機械学習 実践コース',
     'Pythonの基礎から機械学習モデルの構築まで、ハンズオン形式で学びます。scikit-learn, pandas, matplotlibを使った実践的なデータ分析スキルを習得。',
     4980, NULL),
    (gen_random_uuid(), 'Next.js フルスタック開発',
     'Next.js App Routerを使ったモダンなWebアプリケーション開発を学びます。認証、DB連携、デプロイまでカバーする実践コース。',
     3980, NULL),
    (gen_random_uuid(), 'UIデザイン基礎 - Figmaマスター',
     'Figmaを使ったUIデザインの基礎を学びます。デザインシステムの構築からプロトタイピングまで、エンジニアにも役立つデザインスキル。',
     1980, NULL),
    (gen_random_uuid(), 'Git & GitHub 完全ガイド',
     'バージョン管理の基礎からチーム開発のワークフローまで。ブランチ戦略、プルリクエスト、CI/CDの基本を実践的に学べます。',
     0, NULL),
    (gen_random_uuid(), 'TypeScript 実践入門',
     '型安全なJavaScript開発をマスター。基本的な型定義からジェネリクス、ユーティリティ型まで、実務で必要な知識を網羅します。',
     2480, NULL)
    RETURNING id, title;
  `);

  console.log("Created courses:");
  courses.forEach((c) => console.log(`  - ${c.title} (${c.id})`));

  // Insert sample lessons for each course
  for (const course of courses) {
    let lessons;
    if (course.title.includes("AI入門")) {
      lessons = [
        { title: "AIとは何か？基本概念を理解する", content: getSampleMarkdown("ai-1"), sort_order: 1 },
        { title: "ChatGPTの始め方とアカウント設定", content: getSampleMarkdown("ai-2"), sort_order: 2 },
        { title: "プロンプトエンジニアリング入門", content: getSampleMarkdown("ai-3"), sort_order: 3 },
        { title: "実務でのAI活用テクニック", content: getSampleMarkdown("ai-4"), sort_order: 4 },
      ];
    } else if (course.title.includes("Python")) {
      lessons = [
        { title: "Python環境構築とHello World", content: getSampleMarkdown("py-1"), sort_order: 1 },
        { title: "データ型と制御構文", content: getSampleMarkdown("py-2"), sort_order: 2 },
        { title: "pandasでデータ分析", content: getSampleMarkdown("py-3"), sort_order: 3 },
        { title: "scikit-learnで機械学習モデル構築", content: getSampleMarkdown("py-4"), sort_order: 4 },
        { title: "モデルの評価と改善", content: getSampleMarkdown("py-5"), sort_order: 5 },
      ];
    } else if (course.title.includes("Next.js")) {
      lessons = [
        { title: "Next.js App Routerの基礎", content: getSampleMarkdown("next-1"), sort_order: 1 },
        { title: "Server ComponentsとClient Components", content: getSampleMarkdown("next-2"), sort_order: 2 },
        { title: "Supabaseとの連携", content: getSampleMarkdown("next-3"), sort_order: 3 },
        { title: "認証機能の実装", content: getSampleMarkdown("next-4"), sort_order: 4 },
        { title: "Vercelへのデプロイ", content: getSampleMarkdown("next-5"), sort_order: 5 },
      ];
    } else if (course.title.includes("UIデザイン")) {
      lessons = [
        { title: "Figmaの基本操作", content: getSampleMarkdown("fig-1"), sort_order: 1 },
        { title: "カラーとタイポグラフィ", content: getSampleMarkdown("fig-2"), sort_order: 2 },
        { title: "コンポーネント設計", content: getSampleMarkdown("fig-3"), sort_order: 3 },
      ];
    } else if (course.title.includes("Git")) {
      lessons = [
        { title: "Gitの仕組みと初期設定", content: getSampleMarkdown("git-1"), sort_order: 1 },
        { title: "ブランチとマージ", content: getSampleMarkdown("git-2"), sort_order: 2 },
        { title: "GitHubでのチーム開発", content: getSampleMarkdown("git-3"), sort_order: 3 },
        { title: "CI/CDパイプライン入門", content: getSampleMarkdown("git-4"), sort_order: 4 },
      ];
    } else {
      lessons = [
        { title: "TypeScriptとは？JSとの違い", content: getSampleMarkdown("ts-1"), sort_order: 1 },
        { title: "基本的な型定義", content: getSampleMarkdown("ts-2"), sort_order: 2 },
        { title: "インターフェースと型エイリアス", content: getSampleMarkdown("ts-3"), sort_order: 3 },
        { title: "ジェネリクスの活用", content: getSampleMarkdown("ts-4"), sort_order: 4 },
      ];
    }

    for (const lesson of lessons) {
      await client.query(
        `INSERT INTO public.lessons (course_id, title, content, sort_order) VALUES ($1, $2, $3, $4)`,
        [course.id, lesson.title, lesson.content, lesson.sort_order]
      );
    }
    console.log(`  Added ${lessons.length} lessons to "${course.title}"`);
  }

  console.log("\nSeed complete!");
  await client.end();
})();

function getSampleMarkdown(key) {
  const samples = {
    "ai-1": `## AIとは何か？

AI（人工知能）とは、人間の知的な活動をコンピュータで再現する技術の総称です。

### 主なAIの種類

| 種類 | 説明 | 例 |
|------|------|-----|
| 特化型AI | 特定のタスクに特化 | 画像認識、翻訳 |
| 汎用AI | 幅広いタスクに対応 | ChatGPT |
| 生成AI | 新しいコンテンツを生成 | DALL-E, Midjourney |

### なぜ今AIを学ぶべきか

1. **業務効率化** - 日常業務の自動化が可能に
2. **キャリアアップ** - AI活用スキルの需要が急増
3. **創造性の拡張** - アイデア出しや表現の幅が広がる

> 💡 **ポイント**: AIは「人間の代替」ではなく「人間の拡張」として捉えることが大切です。`,

    "ai-2": `## ChatGPTの始め方

### アカウント作成手順

1. OpenAIの公式サイトにアクセス
2. 「Sign Up」をクリック
3. メールアドレスまたはGoogleアカウントで登録
4. 電話番号認証を完了

### 基本的な使い方

\`\`\`
ユーザー: 「〇〇について教えてください」
ChatGPT: 丁寧に説明してくれます
\`\`\`

**無料プランとPlusプランの違い**を理解して、目的に合ったプランを選びましょう。`,

    "ai-3": `## プロンプトエンジニアリング

良い出力を得るための「質問の仕方」を学びます。

### 基本フレームワーク

\`\`\`markdown
# 役割
あなたは〇〇の専門家です。

# タスク
以下の内容について△△してください。

# 制約
- 箇条書きで回答
- 500文字以内
\`\`\`

### 実践テクニック

- **具体的に指示する**: 曖昧な質問は曖昧な回答になる
- **ステップバイステップ**: 複雑な作業は段階的に指示
- **例を示す**: 出力フォーマットの例を添える`,

    "ai-4": "## 実務でのAI活用\n\n日々の業務にAIを組み込むための具体的なテクニックを紹介します。\n\n### 活用シーン\n\n- メール文面の作成・校正\n- 議事録の要約\n- コードレビューの補助\n- データ分析レポートの作成",
    "py-1": "## Python環境構築\n\n### 必要なもの\n\n1. Python 3.10+\n2. pip（パッケージマネージャー）\n3. VSCode（推奨エディタ）\n\n```python\nprint('Hello, World!')\n```\n\nこれがPythonの第一歩です。",
    "py-2": "## データ型と制御構文\n\n### 基本データ型\n\n```python\nname = 'Taro'       # str\nage = 25             # int\nheight = 170.5       # float\nis_student = True    # bool\n```\n\n### 制御構文\n\n```python\nfor i in range(10):\n    if i % 2 == 0:\n        print(f'{i}は偶数')\n```",
    "py-3": "## pandasでデータ分析\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv('data.csv')\nprint(df.describe())\n```\n\npandasはデータ分析の基本ライブラリです。",
    "py-4": "## scikit-learnで機械学習\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX_train, X_test, y_train, y_test = train_test_split(X, y)\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)\n```",
    "py-5": "## モデルの評価\n\n正解率だけでなく、適合率・再現率も確認しましょう。\n\n```python\nfrom sklearn.metrics import classification_report\nprint(classification_report(y_test, y_pred))\n```",
    "next-1": "## Next.js App Router\n\nNext.js 13以降の新しいルーティングシステムについて学びます。\n\n### ファイルベースルーティング\n\n```\napp/\n├── page.tsx          → /\n├── about/page.tsx    → /about\n└── blog/[id]/page.tsx → /blog/:id\n```",
    "next-2": "## Server Components と Client Components\n\n### Server Components（デフォルト）\n- サーバー側でレンダリング\n- データフェッチが直接可能\n\n### Client Components\n```tsx\n'use client'\n// ブラウザで実行される\n```",
    "next-3": "## Supabaseとの連携\n\nSupabaseはオープンソースのFirebase代替です。\n\n```typescript\nimport { createClient } from '@supabase/supabase-js'\nconst supabase = createClient(url, key)\n```",
    "next-4": "## 認証機能の実装\n\nSupabase Authを使った認証フローを実装します。\n\n```typescript\nconst { data, error } = await supabase.auth.signUp({\n  email: 'user@example.com',\n  password: 'password123'\n})\n```",
    "next-5": "## Vercelへのデプロイ\n\n1. GitHubリポジトリを作成\n2. Vercelにログイン\n3. リポジトリをインポート\n4. 環境変数を設定\n5. デプロイ完了！",
    "fig-1": "## Figmaの基本操作\n\nFigmaはブラウザベースのデザインツールです。\n\n### 主要ツール\n- フレーム (F)\n- テキスト (T)\n- 長方形 (R)\n- ペンツール (P)",
    "fig-2": "## カラーとタイポグラフィ\n\n### カラーパレットの作り方\n\n1. プライマリカラーを決める\n2. 明度のバリエーションを作る\n3. セマンティックカラーを定義する",
    "fig-3": "## コンポーネント設計\n\n再利用可能なコンポーネントを設計することで、一貫性のあるUIを効率的に作れます。\n\n- Auto Layout\n- Variants\n- Properties",
    "git-1": "## Gitの仕組み\n\n```bash\ngit init\ngit add .\ngit commit -m 'Initial commit'\n```\n\nGitは**分散型バージョン管理システム**です。",
    "git-2": "## ブランチとマージ\n\n```bash\ngit checkout -b feature/new-feature\n# 作業...\ngit checkout main\ngit merge feature/new-feature\n```",
    "git-3": "## GitHubでのチーム開発\n\n### Pull Requestの流れ\n\n1. featureブランチを作成\n2. 変更をコミット&プッシュ\n3. PRを作成\n4. レビュー&マージ",
    "git-4": "## CI/CDパイプライン\n\nGitHub Actionsを使った自動化の基礎を学びます。\n\n```yaml\nname: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test\n```",
    "ts-1": "## TypeScriptとは\n\nTypeScriptはJavaScriptに**型システム**を追加した言語です。\n\n```typescript\nlet message: string = 'Hello';\nlet count: number = 42;\n```",
    "ts-2": "## 基本的な型定義\n\n```typescript\n// プリミティブ型\nlet name: string = 'Taro';\nlet age: number = 25;\nlet isActive: boolean = true;\n\n// 配列\nlet items: string[] = ['a', 'b', 'c'];\n```",
    "ts-3": "## インターフェースと型エイリアス\n\n```typescript\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\ntype Status = 'active' | 'inactive';\n```",
    "ts-4": "## ジェネリクス\n\n```typescript\nfunction getFirst<T>(items: T[]): T {\n  return items[0];\n}\n\nconst first = getFirst([1, 2, 3]); // number\n```",
  };
  return samples[key] || "## サンプルコンテンツ\n\nこのレッスンの内容は準備中です。";
}
