const { Client } = require("pg");

const client = new Client({
  host: "db.swrphzgqjeixmymqyvrq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "ZHZRi9vus$UdDkx",
  ssl: { rejectUnauthorized: false },
});

// ── カテゴリー別サンプル教材 ──────────────────────────────
const articles = [
  // ━━ ChatGPT活用 ━━
  {
    title: "ChatGPT入門 — 今日から使える基本プロンプト10選",
    is_free: true,
    price: 0,
    rating: 4.8,
    thumbnail_url: "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=800&h=450&fit=crop",
    content: `## はじめに

ChatGPTを使い始めたけど、何を聞けばいいか分からない——そんな方のための入門ガイドです。コピペで使える実践プロンプトを10個厳選しました。

## 1. 要約してもらう

\`\`\`
以下の文章を3行で要約してください。
---
（長い文章をここに貼る）
\`\`\`

最もシンプルで最も使用頻度が高いプロンプトです。

## 2. ビジネスメールを書いてもらう

\`\`\`
以下の要件でビジネスメールを作成してください。
- 宛先: 取引先の田中さん
- 目的: 打ち合わせ日程の調整
- トーン: 丁寧だが簡潔に
\`\`\`

## 3. 文章を校正してもらう

修正箇所を【】で囲んで理由も添えてもらうのがコツ。

## 4. アイデアをブレストする

条件をつけると実用的なアイデアが出やすくなります。

## 5. 表形式で比較してもらう

複数の選択肢を比較するときに最強のフォーマット。

## 6. ステップバイステップで教えてもらう

初心者向けの手順書を作るときに便利。

## 7. 翻訳＋ニュアンス解説

直訳ではなくビジネスで使う際のニュアンスまで聞く。

## 8. 専門用語を分かりやすく

「小学5年生にも分かるように」が魔法のフレーズ。

## 9. 議事録を整理する

メモをフォーマットに沿って構造化してもらう。

## 10. フィードバックをもらう

自分の成果物に対して改善点を3つ挙げてもらう。

---

> 💡 ポイント: **具体的な指示** + **フォーマット指定** + **制約条件** の3つを意識しましょう。`,
  },
  {
    title: "ChatGPT有料プラン完全比較 — Plus・Team・Enterpriseどれを選ぶ？",
    is_free: true,
    price: 0,
    rating: 4.5,
    thumbnail_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    content: `## ChatGPTのプラン選び

2025年現在、ChatGPTには複数のプランがあります。自分に最適なプランを選びましょう。

## プラン比較表

| 項目 | Free | Plus | Team | Enterprise |
|------|------|------|------|------------|
| 月額 | $0 | $20 | $25/人 | 要問合せ |
| GPT-4o | 制限あり | 無制限 | 無制限 | 無制限 |
| 画像生成 | × | ○ | ○ | ○ |
| データ分析 | × | ○ | ○ | ○ |
| 管理機能 | × | × | ○ | ○ |

## 個人ならPlusで十分

月$20で全機能が使えるPlusが最もコスパが高いです。

## チーム利用ならTeam

共有ワークスペースと管理者機能が使えます。

---

> 💡 まずは無料プランで試して、物足りなくなったらPlusに移行するのが王道です。`,
  },
  {
    title: "ChatGPTで月20時間の業務を削減した方法 — 実践テクニック集",
    is_free: false,
    price: 1980,
    rating: 4.7,
    thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
    content: `## はじめに

実際に筆者が業務でChatGPTを活用し、月20時間の工数削減を達成した具体的な方法を解説します。

## 第1章: メール業務の自動化（月5時間削減）

### 定型メールのテンプレート化

毎日の取引先メール、社内報告メール、お礼メールなどをChatGPTで効率化。

### カスタムGPTの活用

自社のトーン&マナーを学習させたカスタムGPTを作成し、ワンクリックでメール下書きを生成。

## 第2章: 議事録・レポート作成（月8時間削減）

### 音声メモ → 議事録変換

Whisper APIと組み合わせた自動議事録生成パイプライン。

### 週次レポートの自動生成

スプレッドシートのデータを読み込ませて、定型レポートを自動作成。

## 第3章: リサーチ業務（月4時間削減）

### 競合調査の効率化
### 市場トレンド分析

## 第4章: その他の活用（月3時間削減）

### プレゼン資料の構成作成
### FAQ対応の下書き

---

> 💡 「全てをAIに任せる」のではなく「80%をAIに任せて20%を人間が仕上げる」のが最適解です。`,
  },

  // ━━ プロンプト設計 ━━
  {
    title: "売上を3倍にしたプロンプト設計術 — 実案件テンプレート集",
    is_free: false,
    price: 2980,
    rating: 4.9,
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    content: `## はじめに

プロンプトエンジニアリングは「AIへの質問の仕方」ではありません。ビジネス成果を出すための設計技術です。

## 第1章: CRISPEフレームワーク

\`\`\`
C - Capacity（役割）
R - Request（依頼）
I - Information（情報）
S - Style（スタイル）
P - Parameters（制約）
E - Example（例示）
\`\`\`

## 第2章: マーケティング用テンプレート

### LP（ランディングページ）コピー生成
### メルマガ件名のA/Bテスト案
### SNS投稿の量産テンプレート

## 第3章: 営業・提案書用テンプレート

### 提案書のストーリー構成
### 競合分析レポート自動生成

## 第4章: ケーススタディ

### Case 1: ECサイトのCVR 1.2% → 3.8%（約3倍）
### Case 2: 採用ページの応募数 2.1倍

---

> 💡 テンプレートは自社の文脈にカスタマイズすることが重要です。`,
  },
  {
    title: "実践プロンプトエンジニアリング — 上級テクニック20選",
    is_free: false,
    price: 2480,
    rating: 4.6,
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    content: `## はじめに

基本的なプロンプトは書ける。でも「もっと精度を上げたい」——そんな中級者以上の方に向けた上級テクニック集です。

## Part 1: 構造化テクニック

### 1. メタプロンプト — AIにプロンプトを書かせる
### 2. Chain-of-Thought — 思考の連鎖
### 3. Few-Shot Learning — 例示学習
### 4. ペルソナスタッキング — 多角的視点
### 5. 否定プロンプト — やらないことの指定

## Part 2: 出力制御テクニック

### 6. JSON出力の強制
### 7. 信頼度スコアの付与
### 8. 段階的な詳細度調整
### 9. 自己評価と修正サイクル
### 10. 出力の一貫性チェック

## Part 3: 複雑タスク向けテクニック

### 11-15. タスク分解、ロールプレイング、デバッグプロンプト等

## Part 4: ビジネス特化テクニック

### 16-20. ブランドボイス注入、競合分析、A/Bテスト生成等

---

> 💡 上級テクニックの本質は「AIに考え方を教える」こと。`,
  },

  // ━━ 画像生成AI ━━
  {
    title: "Midjourney vs Stable Diffusion vs DALL-E — 画像生成AI徹底比較",
    is_free: true,
    price: 0,
    rating: 4.7,
    thumbnail_url: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=450&fit=crop",
    content: `## 画像生成AIの選び方

画像生成AIは群雄割拠。目的に合ったツールを選ぶことが重要です。

## 比較表

| 項目 | Midjourney | Stable Diffusion | DALL-E 3 |
|------|-----------|-----------------|----------|
| 料金 | 月$10〜 | 無料（ローカル） | ChatGPT Plus内 |
| 品質 | ★★★★★ | ★★★★☆ | ★★★★☆ |
| 手軽さ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |
| カスタマイズ性 | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |

## 用途別おすすめ

- **ブログ・SNSのアイキャッチ** → DALL-E 3
- **ハイクオリティなアート** → Midjourney
- **自由度MAXカスタマイズ** → Stable Diffusion

---

> 💡 まずはDALL-E 3で始めて、物足りなくなったらMidjourneyに移行が王道。`,
  },
  {
    title: "Midjourney完全攻略 — 映えるAIアートを量産するプロンプト術",
    is_free: false,
    price: 1980,
    rating: 4.8,
    thumbnail_url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=450&fit=crop",
    content: `## Midjourneyで差をつける

Midjourneyは使い方次第でプロ級の画像が生成できます。この教材ではプロンプトの書き方を体系的に解説します。

## 第1章: 基本構文

\`\`\`
/imagine prompt: [主題], [スタイル], [構図], [雰囲気], [品質] --ar 16:9 --v 6
\`\`\`

## 第2章: スタイル別プロンプト集

### 写真風リアリスティック
### アニメ・イラスト風
### 水彩画・油絵風
### ミニマルデザイン

## 第3章: パラメータ完全ガイド

### --ar（アスペクト比）
### --v（バージョン）
### --s（スタイライズ）
### --c（カオス度）

## 第4章: 商用利用のルールと注意点

---

> 💡 良いプロンプト = 具体的な主題 + 明確なスタイル + 適切なパラメータ`,
  },

  // ━━ AI自動化・効率化 ━━
  {
    title: "ChatGPT × Google Apps Script で業務を完全自動化する方法",
    is_free: false,
    price: 2480,
    rating: 4.6,
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    content: `## この教材で学べること

ChatGPTのAPIとGoogle Apps Script（GAS）を組み合わせて、日常業務を自動化する方法を解説します。

## 第1章: 環境準備

### OpenAI APIキーの取得
### Google Apps Scriptの基本

\`\`\`javascript
function callChatGPT(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
    method: "post",
    headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
    payload: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }] })
  });
  return JSON.parse(response.getContentText()).choices[0].message.content;
}
\`\`\`

## 第2章: 実践レシピ集

### メール自動返信システム
### スプレッドシートデータの自動分析
### Slack通知との連携
### フォーム回答の自動分類

## 第3章: コスト管理とベストプラクティス

---

> 💡 自動化は「小さく始めて徐々に拡大」が成功の秘訣です。`,
  },
  {
    title: "ノーコードAI自動化入門 — Dify × Zapierで作る業務フロー",
    is_free: false,
    price: 1480,
    rating: 4.4,
    thumbnail_url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=450&fit=crop",
    content: `## プログラミング不要のAI自動化

コードを書かずにAI業務フローを構築する方法を解説します。

## 第1章: Difyで社内AIチャットボット構築

### ナレッジベースの作り方
### チャットボットアプリの設定
### 社内FAQボットの完成

## 第2章: Zapierで業務フローを自動化

### トリガーとアクションの基本
### Gmail → ChatGPT → Slack 自動化
### フォーム回答の自動要約

## 第3章: Make（旧Integromat）との使い分け

## 第4章: 実践ユースケース5選

---

> 💡 ノーコードツールでも十分に実用的なAI自動化が実現できます。`,
  },

  // ━━ AI × プログラミング ━━
  {
    title: "Claude API実践ガイド — AIアプリ開発の第一歩",
    is_free: false,
    price: 1980,
    rating: 4.5,
    thumbnail_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
    content: `## Claude APIとは

ClaudeはAnthropicが開発するLLMです。高い推論能力と長いコンテキストウィンドウが特徴。

## 第1章: セットアップ

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 1024,
  messages: [{ role: "user", content: "こんにちは！" }],
});
\`\`\`

## 第2章: ストリーミング
## 第3章: Tool Use（関数呼び出し）
## 第4章: Next.jsとの統合
## 第5章: プロダクション運用

---

> 💡 公式ドキュメントを常に参照しましょう。`,
  },
  {
    title: "非エンジニアのためのRAG入門 — 社内AIチャットボットを作ろう",
    is_free: false,
    price: 3480,
    rating: 4.8,
    thumbnail_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop",
    content: `## RAGとは何か

RAG（Retrieval-Augmented Generation）は、AIに「自社の情報」を教え込む技術です。

## なぜRAGが必要なのか

ChatGPTはあなたの会社のことは知りません。RAGで社内情報に基づいた回答を可能にします。

## 第1章: RAGの仕組み

\`\`\`
[質問] → [検索エンジン] → 関連ドキュメント取得 → [LLM] → [正確な回答]
\`\`\`

## 第2章: ノーコードで構築する（Dify）
## 第3章: コードで構築する（Python + LangChain）
## 第4章: 運用と改善

---

> 💡 RAGは「作って終わり」ではなく、ドキュメントの品質改善を継続することが鍵です。`,
  },

  // ━━ AIビジネス活用 ━━
  {
    title: "AI副業の始め方 — 月5万円を稼ぐ具体的な5つの方法",
    is_free: false,
    price: 1480,
    rating: 4.3,
    thumbnail_url: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=450&fit=crop",
    content: `## AI副業の現実

「AIで副業」の需要は急増中。再現性の高い5つの方法を具体的に解説します。

## 方法1: プロンプト作成代行（1案件 5,000〜30,000円）
## 方法2: AIを使ったライティング
## 方法3: 画像生成AI × デザイン
## 方法4: AI活用コンサルティング
## 方法5: AI教材の販売

## 収益シミュレーション

| 方法 | 月間案件数 | 単価 | 月収 |
|------|----------|------|------|
| プロンプト作成 | 3件 | ¥10,000 | ¥30,000 |
| ライティング | 5件 | ¥5,000 | ¥25,000 |
| 画像生成 | 10件 | ¥3,000 | ¥30,000 |

---

> 💡 AI副業の本質は「AI × あなたの専門性」。AIだけでは差別化できません。`,
  },
  {
    title: "GPT-4o / Claude / Gemini — 最新AIモデル完全比較ガイド",
    is_free: false,
    price: 980,
    rating: 4.6,
    thumbnail_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
    content: `## 2025年、AIモデルをどう選ぶか

主要AIモデルが出揃った2025年。用途に応じた使い分けが重要です。

## 性能比較

| 用途 | 最適モデル | 理由 |
|------|----------|------|
| 長文の分析 | Gemini 1.5 Pro | 100万トークン |
| コード生成 | Claude 3.5 Sonnet | 正確性 |
| 日本語作成 | GPT-4o | 自然な日本語 |
| 数学・論理 | o1 | 推論特化 |
| コスパ重視 | GPT-4o mini | 低価格 |

## 料金比較

| モデル | 入力 (1M) | 出力 (1M) |
|--------|----------|----------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o mini | $0.15 | $0.60 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Gemini 1.5 Pro | $1.25 | $5.00 |

---

> 💡 「最強のモデル」は存在しません。タスクに応じた使い分けが最も賢いアプローチです。`,
  },
  {
    title: "AI時代のキャリア戦略 — エンジニア・非エンジニア別ロードマップ",
    is_free: true,
    price: 0,
    rating: 4.4,
    thumbnail_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop",
    content: `## AI時代にキャリアはどう変わるのか

本質は「AIを使える人 vs 使えない人」の二極化です。

## エンジニア向けロードマップ

### フェーズ1: AI活用の基礎（1-2ヶ月）
### フェーズ2: AI開発の実践（3-6ヶ月）
### フェーズ3: 専門性の確立（6ヶ月-）

## 非エンジニア向けロードマップ

### フェーズ1: まずは日常業務で使う（1ヶ月）
### フェーズ2: 業務フローに組み込む（2-3ヶ月）
### フェーズ3: AI人材としてのポジション確立

---

> 💡 「AIを学ぶ」のではなく「AIで成果を出す」アウトプット思考が重要です。`,
  },
];

(async () => {
  await client.connect();
  console.log("Connected\n");

  // 既存の記事を全削除
  await client.query(`DELETE FROM public.articles`);
  console.log("Deleted existing articles\n");

  // rating カラムがなければ追加
  await client.query(`ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0`);
  await client.query(`ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0`);
  console.log("Ensured rating & price columns exist\n");

  // 新しいサンプル教材を投入
  for (const a of articles) {
    await client.query(
      `INSERT INTO public.articles (title, content, is_free, price, rating, thumbnail_url, published)
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [a.title, a.content, a.is_free, a.price, a.rating, a.thumbnail_url]
    );
    const label = a.is_free ? "無料" : `¥${a.price.toLocaleString()}`;
    console.log(`  [${label}] ★${a.rating} ${a.title}`);
  }

  console.log(`\n${articles.length}件の教材を追加しました！`);
  await client.end();
})();
