const { Client } = require("pg");

const client = new Client({
  host: "db.swrphzgqjeixmymqyvrq.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "ZHZRi9vus$UdDkx",
  ssl: { rejectUnauthorized: false },
});

// Unsplash画像をカテゴリー別にプール
const imgPool = {
  ChatGPT: [
    "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1531746790095-e5d2ab1c3460?w=800&h=450&fit=crop",
  ],
  プロンプト: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=450&fit=crop",
  ],
  画像生成: [
    "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800&h=450&fit=crop",
  ],
  自動化: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop",
  ],
  API: [
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=450&fit=crop",
  ],
  Claude: [
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
  ],
  RAG: [
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&h=450&fit=crop",
  ],
  副業: [
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop",
  ],
  Midjourney: [
    "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop",
  ],
  Dify: [
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop",
  ],
  キャリア: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
  ],
  比較: [
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
  ],
};

function pickImg(cat, i) {
  const pool = imgPool[cat] || imgPool["ChatGPT"];
  return pool[i % pool.length];
}

function mkContent(title, sections) {
  return `## はじめに\n\nこの教材では「${title}」について、実践的な内容を解説します。\n\n${sections.map((s, i) => `## 第${i + 1}章: ${s.heading}\n\n${s.body}`).join("\n\n")}\n\n---\n\n> この教材が役に立ったらレビューをお願いします。`;
}

// ── 大量サンプル教材データ ──────────────────────────────
const articles = [
  // ━━━━ ChatGPT (8件) ━━━━
  {
    title: "ChatGPT入門 — 今日から使える基本プロンプト10選",
    is_free: true, price: 0, rating: 4.8, cat: "ChatGPT",
    content: mkContent("ChatGPT基本プロンプト10選", [
      { heading: "要約してもらう", body: "最もシンプルで最も使用頻度が高いプロンプトです。" },
      { heading: "ビジネスメールを書いてもらう", body: "宛先・目的・トーンを指定するのがコツ。" },
      { heading: "文章を校正してもらう", body: "修正箇所を【】で囲んで理由も添えてもらいましょう。" },
      { heading: "表形式で比較してもらう", body: "複数の選択肢を比較するときに最強のフォーマット。" },
    ]),
  },
  {
    title: "ChatGPT有料プラン完全比較 — Plus・Team・Enterpriseどれを選ぶ？",
    is_free: true, price: 0, rating: 4.5, cat: "ChatGPT",
    content: mkContent("ChatGPTプラン比較", [
      { heading: "プラン一覧と料金", body: "Free / Plus / Team / Enterprise の4プランを徹底比較。" },
      { heading: "個人ならPlusで十分", body: "月$20で全機能が使えるPlusが最もコスパが高いです。" },
      { heading: "チーム利用ならTeam", body: "共有ワークスペースと管理者機能が使えます。" },
    ]),
  },
  {
    title: "ChatGPTで月20時間の業務を削減した方法 — 実践テクニック集",
    is_free: false, price: 1980, rating: 4.7, cat: "ChatGPT",
    content: mkContent("ChatGPT業務効率化", [
      { heading: "メール業務の自動化（月5時間削減）", body: "定型メールのテンプレート化とカスタムGPTの活用。" },
      { heading: "議事録・レポート作成（月8時間削減）", body: "Whisper APIと組み合わせた自動議事録生成パイプライン。" },
      { heading: "リサーチ業務（月4時間削減）", body: "競合調査・市場トレンド分析の効率化。" },
    ]),
  },
  {
    title: "ChatGPTのカスタム指示（Custom Instructions）完全活用術",
    is_free: true, price: 0, rating: 4.3, cat: "ChatGPT",
    content: mkContent("Custom Instructions活用術", [
      { heading: "カスタム指示とは", body: "毎回同じ前提条件を伝えなくても済むように、あらかじめ自分の情報や好みの回答スタイルを設定できる機能です。" },
      { heading: "おすすめ設定テンプレート5選", body: "ビジネス用・エンジニア用・マーケター用・学生用・ライター用のテンプレートを紹介。" },
      { heading: "上級者の使い方", body: "カスタム指示を場面に応じて切り替えるテクニック。" },
    ]),
  },
  {
    title: "ChatGPTでSEO記事を書く方法 — 検索上位を狙うAIライティング",
    is_free: false, price: 1480, rating: 4.4, cat: "ChatGPT",
    content: mkContent("ChatGPT SEOライティング", [
      { heading: "キーワードリサーチの自動化", body: "関連キーワードの洗い出しと競合分析をChatGPTで効率化。" },
      { heading: "記事構成の作成", body: "H2/H3の見出し構成をAIに最適化させるプロンプト。" },
      { heading: "本文執筆のコツ", body: "AIっぽさを消す推敲テクニックとファクトチェックの重要性。" },
      { heading: "メタデータの最適化", body: "タイトルタグ・メタディスクリプションの自動生成。" },
    ]),
  },
  {
    title: "ChatGPT × Excel — AIで表計算を10倍効率化",
    is_free: false, price: 980, rating: 4.6, cat: "ChatGPT",
    content: mkContent("ChatGPT×Excel効率化", [
      { heading: "関数の自動生成", body: "やりたいことを日本語で伝えるだけでVLOOKUP、INDEX/MATCHなどの複雑な関数を生成。" },
      { heading: "VBAマクロの作成", body: "プログラミング未経験でもChatGPTにVBAマクロを書いてもらえます。" },
      { heading: "データ分析の支援", body: "ピボットテーブルの設計やグラフの選び方をAIに相談。" },
    ]),
  },
  {
    title: "ChatGPTプラグイン活用大全 — おすすめ30選と使い方",
    is_free: true, price: 0, rating: 4.2, cat: "ChatGPT",
    content: mkContent("ChatGPTプラグイン活用", [
      { heading: "プラグインとは", body: "ChatGPTの機能を拡張する公式アドオン。Web検索、データ分析、画像生成など多数。" },
      { heading: "ビジネス向けプラグインTOP10", body: "Zapier、Noteable、WebPilotなど業務効率化に直結するプラグイン。" },
      { heading: "クリエイティブ向けプラグインTOP10", body: "Canva、DALL-E、Diagramなどコンテンツ制作に役立つプラグイン。" },
      { heading: "開発者向けプラグインTOP10", body: "Code Interpreter、AskTheCode、ScholarAIなど技術者向けプラグイン。" },
    ]),
  },
  {
    title: "ChatGPT × 英語学習 — AIで最速リスニング＆スピーキング上達法",
    is_free: false, price: 1280, rating: 4.5, cat: "ChatGPT",
    content: mkContent("ChatGPT英語学習", [
      { heading: "AI英会話パートナーの作り方", body: "Voice機能を活用した疑似英会話レッスンの始め方。" },
      { heading: "シャドーイング教材の自動生成", body: "レベル別の英文をChatGPTに生成してもらう方法。" },
      { heading: "ビジネス英語メールの添削", body: "ネイティブ視点でのフィードバックをもらうプロンプト。" },
    ]),
  },

  // ━━━━ プロンプト (6件) ━━━━
  {
    title: "売上を3倍にしたプロンプト設計術 — 実案件テンプレート集",
    is_free: false, price: 2980, rating: 4.9, cat: "プロンプト",
    content: mkContent("プロンプト設計術", [
      { heading: "CRISPEフレームワーク", body: "Capacity(役割)・Request(依頼)・Information(情報)・Style(スタイル)・Parameters(制約)・Example(例示)の6要素。" },
      { heading: "マーケティング用テンプレート", body: "LP構成・メルマガ件名・SNS投稿の量産テンプレート。" },
      { heading: "ケーススタディ", body: "ECサイトのCVR 1.2%→3.8%（約3倍）を達成した事例。" },
    ]),
  },
  {
    title: "実践プロンプトエンジニアリング — 上級テクニック20選",
    is_free: false, price: 2480, rating: 4.6, cat: "プロンプト",
    content: mkContent("上級プロンプトテクニック", [
      { heading: "メタプロンプト", body: "AIにプロンプトを書かせるテクニック。" },
      { heading: "Chain-of-Thought", body: "思考の連鎖で複雑な推論を引き出す。" },
      { heading: "Few-Shot Learning", body: "例示を与えて出力パターンを学習させる。" },
      { heading: "否定プロンプト", body: "やらないことを指定して精度を上げる。" },
    ]),
  },
  {
    title: "プロンプトテンプレート100選 — コピペで使えるビジネス用AIプロンプト集",
    is_free: false, price: 1980, rating: 4.7, cat: "プロンプト",
    content: mkContent("プロンプト100選", [
      { heading: "メール・文書作成（20テンプレート）", body: "ビジネスメール、報告書、提案書などのテンプレート。" },
      { heading: "マーケティング（20テンプレート）", body: "広告コピー、SNS投稿、プレスリリースなどのテンプレート。" },
      { heading: "分析・リサーチ（20テンプレート）", body: "市場調査、競合分析、データ分析のテンプレート。" },
      { heading: "その他実務（40テンプレート）", body: "議事録、FAQ作成、翻訳、要約など汎用テンプレート。" },
    ]),
  },
  {
    title: "プロンプトで画像生成AIを制御する — DALL-E/Midjourney共通プロンプト術",
    is_free: false, price: 1480, rating: 4.5, cat: "プロンプト",
    content: mkContent("画像生成プロンプト術", [
      { heading: "プロンプトの基本構造", body: "[主題] + [スタイル] + [構図] + [雰囲気] + [品質]で構成。" },
      { heading: "スタイル指定のコツ", body: "「photorealistic」「watercolor」「flat design」など頻出スタイルの使い分け。" },
      { heading: "ネガティブプロンプト", body: "不要な要素を排除して品質を上げるテクニック。" },
    ]),
  },
  {
    title: "システムプロンプト設計の教科書 — AIアプリ開発者のためのプロンプト術",
    is_free: false, price: 2480, rating: 4.8, cat: "プロンプト",
    content: mkContent("システムプロンプト設計", [
      { heading: "システムプロンプトとは", body: "AIの振る舞いを事前に定義する隠しプロンプト。チャットボットやアプリの品質を左右する。" },
      { heading: "設計パターン集", body: "ペルソナ設定、出力フォーマット制御、安全性ガードレールの実装。" },
      { heading: "テストと改善サイクル", body: "エッジケースの洗い出しとプロンプトの反復改善手法。" },
    ]),
  },
  {
    title: "ChatGPTプロンプトの教科書 — 初心者から上級者まで",
    is_free: true, price: 0, rating: 4.4, cat: "プロンプト",
    content: mkContent("プロンプトの教科書", [
      { heading: "プロンプトの基本", body: "良いプロンプトの3要素：具体性・文脈・制約。" },
      { heading: "中級テクニック", body: "ロールプレイ、段階的指示、出力形式の指定。" },
      { heading: "上級テクニック", body: "Chain-of-Thought、Self-Consistency、Tree-of-Thought。" },
    ]),
  },

  // ━━━━ 画像生成 (6件) ━━━━
  {
    title: "Midjourney vs Stable Diffusion vs DALL-E — 画像生成AI徹底比較",
    is_free: true, price: 0, rating: 4.7, cat: "画像生成",
    content: mkContent("画像生成AI比較", [
      { heading: "3大ツールの特徴", body: "Midjourney=高品質、SD=カスタマイズ性、DALL-E=手軽さ。" },
      { heading: "用途別おすすめ", body: "ブログアイキャッチ→DALL-E、アート→Midjourney、自由度→SD。" },
    ]),
  },
  {
    title: "Midjourney完全攻略 — 映えるAIアートを量産するプロンプト術",
    is_free: false, price: 1980, rating: 4.8, cat: "Midjourney",
    content: mkContent("Midjourney攻略", [
      { heading: "基本構文", body: "/imagine prompt: [主題], [スタイル], [構図], [雰囲気], [品質]" },
      { heading: "スタイル別プロンプト集", body: "写真風、アニメ風、水彩画風、ミニマルデザインのテンプレート。" },
      { heading: "パラメータ完全ガイド", body: "--ar、--v、--s、--c の使い方。" },
    ]),
  },
  {
    title: "Stable Diffusion入門 — ローカル環境で始めるAI画像生成",
    is_free: true, price: 0, rating: 4.3, cat: "画像生成",
    content: mkContent("Stable Diffusion入門", [
      { heading: "環境構築", body: "必要スペック（VRAM 8GB+推奨）とインストール手順。" },
      { heading: "WebUI（AUTOMATIC1111）の使い方", body: "基本操作からimg2img、inpaintingまで。" },
      { heading: "モデルとLoRAの導入", body: "Civitaiからのモデルダウンロードと適用方法。" },
      { heading: "プロンプトの書き方", body: "ポジティブ/ネガティブプロンプトの基本と重み付け。" },
    ]),
  },
  {
    title: "DALL-E 3で商用利用できる画像生成を始めよう",
    is_free: true, price: 0, rating: 4.2, cat: "画像生成",
    content: mkContent("DALL-E 3商用利用", [
      { heading: "DALL-E 3の特徴", body: "ChatGPT内蔵で自然言語プロンプトに最も忠実。" },
      { heading: "商用利用のルール", body: "OpenAIの利用規約と商用利用で気をつけるポイント。" },
      { heading: "実践テンプレート", body: "ブログアイキャッチ、SNS投稿画像、プレゼン素材の作り方。" },
    ]),
  },
  {
    title: "AIアートで稼ぐ — 画像生成AIを使ったストックフォト副業入門",
    is_free: false, price: 1480, rating: 4.1, cat: "画像生成",
    content: mkContent("AIアート副業", [
      { heading: "ストックフォトサイトの選び方", body: "Adobe Stock、Shutterstock、PIXTAのAI画像ポリシー比較。" },
      { heading: "売れる画像のテーマ選び", body: "需要が高いカテゴリーとニッチの見つけ方。" },
      { heading: "量産ワークフロー", body: "Midjourney → Photoshop → 一括アップロードの効率的な流れ。" },
    ]),
  },
  {
    title: "Midjourneyで作るブランドビジュアル — デザイナー不要の時代",
    is_free: false, price: 1980, rating: 4.6, cat: "Midjourney",
    content: mkContent("Midjourneyブランドビジュアル", [
      { heading: "ブランドの世界観をプロンプトで表現する", body: "カラーパレット・トーン・スタイルの統一方法。" },
      { heading: "SNS素材の量産", body: "Instagram、Twitter、YouTubeサムネイルのテンプレート。" },
      { heading: "Webサイト素材の作成", body: "ヒーロー画像、背景、アイコンの生成テクニック。" },
    ]),
  },

  // ━━━━ 自動化 (6件) ━━━━
  {
    title: "ChatGPT × Google Apps Script で業務を完全自動化する方法",
    is_free: false, price: 2480, rating: 4.6, cat: "自動化",
    content: mkContent("GAS×ChatGPT自動化", [
      { heading: "環境準備", body: "OpenAI APIキーの取得とGASの基本。" },
      { heading: "メール自動返信システム", body: "受信メールの内容をAIで分析し自動返信を生成。" },
      { heading: "スプレッドシート自動分析", body: "データを読み込みレポートを自動作成。" },
    ]),
  },
  {
    title: "ノーコードAI自動化入門 — Dify × Zapierで作る業務フロー",
    is_free: false, price: 1480, rating: 4.4, cat: "Dify",
    content: mkContent("Dify×Zapier自動化", [
      { heading: "Difyで社内AIチャットボット構築", body: "ナレッジベースの作り方とチャットボットの設定。" },
      { heading: "Zapierで業務フロー自動化", body: "Gmail→ChatGPT→Slack自動化パイプライン。" },
      { heading: "実践ユースケース5選", body: "問い合わせ対応、レポート生成、データ入力など。" },
    ]),
  },
  {
    title: "Make（旧Integromat）でAI業務自動化 — ノーコード実践ガイド",
    is_free: false, price: 1680, rating: 4.3, cat: "自動化",
    content: mkContent("Make AI自動化", [
      { heading: "Makeの基本操作", body: "シナリオの作成、モジュールの接続、スケジュール設定。" },
      { heading: "AI系モジュールの活用", body: "OpenAI、Anthropic、Google AIモジュールの使い方。" },
      { heading: "実践レシピ10選", body: "フォーム回答→AI分類→Slack通知などの実践的なシナリオ。" },
    ]),
  },
  {
    title: "Python × OpenAI APIで作る自動化ボット入門",
    is_free: false, price: 1980, rating: 4.5, cat: "自動化",
    content: mkContent("Python自動化ボット", [
      { heading: "OpenAI APIの基本", body: "APIキーの取得、Pythonライブラリのセットアップ。" },
      { heading: "Slackボットの作成", body: "Bolt for Pythonを使ったAI Slackボットの開発。" },
      { heading: "定期実行の設定", body: "cronやCloud Functionsでの定期実行方法。" },
      { heading: "エラーハンドリング", body: "レートリミット対策とリトライロジック。" },
    ]),
  },
  {
    title: "AI × RPA — UiPathとChatGPTで実現するハイパー自動化",
    is_free: false, price: 2980, rating: 4.4, cat: "自動化",
    content: mkContent("AI×RPA自動化", [
      { heading: "RPAとAIの違いと組み合わせ方", body: "定型作業はRPA、判断が必要な作業はAIで分担。" },
      { heading: "UiPath × OpenAI連携", body: "UiPathのアクティビティからChatGPT APIを呼び出す方法。" },
      { heading: "実務ユースケース", body: "請求書処理、メール仕分け、レポート生成の自動化。" },
    ]),
  },
  {
    title: "Gmail × ChatGPT 自動化テンプレート集 — メール業務を90%削減",
    is_free: false, price: 980, rating: 4.2, cat: "自動化",
    content: mkContent("Gmail自動化", [
      { heading: "GASでGmailを自動操作", body: "未読メールの取得、フィルタリング、ラベル付与。" },
      { heading: "AIで自動返信を生成", body: "メール内容を解析して適切な返信文を自動生成。" },
      { heading: "ダッシュボードで管理", body: "処理済みメールのログと効果測定。" },
    ]),
  },

  // ━━━━ API (5件) ━━━━
  {
    title: "Claude API実践ガイド — AIアプリ開発の第一歩",
    is_free: false, price: 1980, rating: 4.5, cat: "Claude",
    content: mkContent("Claude API実践", [
      { heading: "セットアップ", body: "Anthropic SDKのインストールとAPIキーの設定。" },
      { heading: "ストリーミング", body: "リアルタイムレスポンスの実装方法。" },
      { heading: "Tool Use（関数呼び出し）", body: "外部APIとの連携をAIに任せる。" },
      { heading: "Next.jsとの統合", body: "Server ActionsでClaudeを呼び出すパターン。" },
    ]),
  },
  {
    title: "OpenAI API完全入門 — GPT-4oを使ったアプリ開発",
    is_free: false, price: 1980, rating: 4.6, cat: "API",
    content: mkContent("OpenAI API入門", [
      { heading: "APIキーの取得と料金体系", body: "無料枠の確認と従量課金の仕組み。" },
      { heading: "Chat Completions API", body: "テキスト生成の基本とパラメータ調整。" },
      { heading: "Function Calling", body: "AIに外部関数を呼ばせるテクニック。" },
      { heading: "Assistants API", body: "ステートフルなAIアシスタントの構築。" },
    ]),
  },
  {
    title: "Gemini API入門 — Googleの最新AIをアプリに組み込む",
    is_free: true, price: 0, rating: 4.2, cat: "API",
    content: mkContent("Gemini API入門", [
      { heading: "Google AI Studioでの試用", body: "ブラウザ上でGeminiを試す方法。" },
      { heading: "APIの基本操作", body: "テキスト生成、マルチモーダル入力、コンテキスト管理。" },
      { heading: "100万トークンの活用", body: "長文コンテキストを活かしたユースケース。" },
    ]),
  },
  {
    title: "LLM APIコスト最適化ガイド — 月額を1/5に削減する方法",
    is_free: false, price: 1480, rating: 4.7, cat: "API",
    content: mkContent("LLM APIコスト最適化", [
      { heading: "コスト構造の理解", body: "入力トークン vs 出力トークン、モデル別料金の比較。" },
      { heading: "プロンプト最適化", body: "トークン数を削減するプロンプトリファクタリング。" },
      { heading: "キャッシング戦略", body: "同じ質問には同じ回答を返すキャッシュの実装。" },
      { heading: "モデルルーティング", body: "タスクの難易度に応じてモデルを使い分けるシステム。" },
    ]),
  },
  {
    title: "Webhook × AI — リアルタイムAI連携アーキテクチャ入門",
    is_free: false, price: 1680, rating: 4.3, cat: "API",
    content: mkContent("Webhook×AI連携", [
      { heading: "Webhookの基本", body: "イベント駆動型のHTTPコールバックの仕組み。" },
      { heading: "StripeやGitHubのWebhook → AI処理", body: "決済やPRイベントをAIで自動処理するパターン。" },
      { heading: "Next.js API Routesで受信", body: "Webhookエンドポイントの実装と検証。" },
    ]),
  },

  // ━━━━ Claude (4件) ━━━━
  {
    title: "Claude 3.5 Sonnet活用術 — ChatGPTとの使い分けガイド",
    is_free: true, price: 0, rating: 4.6, cat: "Claude",
    content: mkContent("Claude活用術", [
      { heading: "Claudeが得意なタスク", body: "長文分析、コード生成、論理的推論で特に強い。" },
      { heading: "ChatGPTとの使い分け", body: "日本語の自然さはGPT-4o、正確性はClaude。" },
      { heading: "Artifacts機能の活用", body: "コード、ドキュメント、図表をインライン生成。" },
    ]),
  },
  {
    title: "Claude × コーディング — AI駆動開発の最前線",
    is_free: false, price: 1980, rating: 4.7, cat: "Claude",
    content: mkContent("Claude×コーディング", [
      { heading: "Claude Codeの使い方", body: "CLI版Claudeでのコーディング支援。" },
      { heading: "大規模リファクタリング", body: "長いコンテキストを活かした大規模コード変更。" },
      { heading: "テスト生成", body: "既存コードからユニットテストを自動生成。" },
    ]),
  },
  {
    title: "Claudeでテクニカルライティング — 技術ドキュメントをAIで効率化",
    is_free: false, price: 1280, rating: 4.4, cat: "Claude",
    content: mkContent("Claudeテクニカルライティング", [
      { heading: "API仕様書の自動生成", body: "コードからAPI仕様書を自動生成するプロンプト。" },
      { heading: "READMEの作成", body: "プロジェクト構造を読み取りREADMEを自動生成。" },
      { heading: "翻訳・ローカライゼーション", body: "技術用語を正確に保った多言語翻訳。" },
    ]),
  },

  // ━━━━ RAG (5件) ━━━━
  {
    title: "非エンジニアのためのRAG入門 — 社内AIチャットボットを作ろう",
    is_free: false, price: 3480, rating: 4.8, cat: "RAG",
    content: mkContent("RAG入門", [
      { heading: "RAGの仕組み", body: "質問→検索→関連ドキュメント取得→LLMで回答生成。" },
      { heading: "ノーコードで構築（Dify）", body: "Difyを使った社内チャットボットの構築手順。" },
      { heading: "コードで構築（LangChain）", body: "Python + LangChainでの本格実装。" },
    ]),
  },
  {
    title: "RAGの精度を劇的に改善する5つのテクニック",
    is_free: false, price: 2480, rating: 4.7, cat: "RAG",
    content: mkContent("RAG精度改善", [
      { heading: "チャンキング戦略の最適化", body: "セマンティックチャンキングで検索精度を向上。" },
      { heading: "埋め込みモデルの選定", body: "OpenAI、Cohere、Voyagerの埋め込みモデル比較。" },
      { heading: "リランキングの導入", body: "初回検索結果を再ランク付けして精度を上げる。" },
      { heading: "ハイブリッド検索", body: "ベクトル検索 + キーワード検索の組み合わせ。" },
      { heading: "評価メトリクスの設計", body: "Faithfulness、Relevance、Answerabilityの計測。" },
    ]),
  },
  {
    title: "LangChain実践入門 — PythonでRAGアプリを作る",
    is_free: false, price: 2980, rating: 4.5, cat: "RAG",
    content: mkContent("LangChain実践入門", [
      { heading: "LangChainとは", body: "LLMアプリ開発のためのPythonフレームワーク。" },
      { heading: "ベクトルストアの構築", body: "Pinecone、Weaviate、Chromaの比較と実装。" },
      { heading: "チェーンの設計", body: "RetrievalQA、ConversationalRetrievalChainの使い方。" },
      { heading: "デプロイ", body: "FastAPIで本番環境にデプロイする方法。" },
    ]),
  },
  {
    title: "Supabase × pgvector でRAGを構築する方法",
    is_free: false, price: 1980, rating: 4.4, cat: "RAG",
    content: mkContent("Supabase RAG", [
      { heading: "pgvectorの導入", body: "Supabaseでベクトル拡張を有効化する手順。" },
      { heading: "埋め込みの保存と検索", body: "OpenAI Embeddingsでベクトルを生成しSupabaseに保存。" },
      { heading: "Next.jsとの統合", body: "フロントからの質問→検索→回答生成のフルフロー実装。" },
    ]),
  },
  {
    title: "社内ナレッジベースをAIで構築 — RAG × Notion連携",
    is_free: false, price: 1680, rating: 4.3, cat: "RAG",
    content: mkContent("RAG×Notion連携", [
      { heading: "Notion APIでデータ取得", body: "Notionのページやデータベースをプログラムで取得。" },
      { heading: "自動同期パイプライン", body: "Notionの更新を検知しベクトルDBに自動反映。" },
      { heading: "AIチャットインターフェース", body: "社内向けチャットUIの構築。" },
    ]),
  },

  // ━━━━ 副業 (5件) ━━━━
  {
    title: "AI副業の始め方 — 月5万円を稼ぐ具体的な5つの方法",
    is_free: false, price: 1480, rating: 4.3, cat: "副業",
    content: mkContent("AI副業入門", [
      { heading: "プロンプト作成代行", body: "1案件5,000〜30,000円。企業のAI導入を支援。" },
      { heading: "AIライティング", body: "SEO記事やメルマガをAI活用で効率的に執筆。" },
      { heading: "画像生成AI × デザイン", body: "ストック素材やSNS素材の制作。" },
    ]),
  },
  {
    title: "AIコンサルタントとして独立する方法 — 月収50万円ロードマップ",
    is_free: false, price: 2980, rating: 4.5, cat: "副業",
    content: mkContent("AIコンサルタント独立", [
      { heading: "AIコンサルタントの市場", body: "中小企業のAI導入支援は需要過多の売り手市場。" },
      { heading: "必要なスキルセット", body: "技術力よりもヒアリング力と業務理解が重要。" },
      { heading: "案件獲得の方法", body: "SNS発信、セミナー登壇、紹介経由の3つのチャネル。" },
      { heading: "料金設定と契約", body: "時間単価 vs プロジェクト単価の使い分け。" },
    ]),
  },
  {
    title: "AI教材の作り方 — noteやBrainで月10万円の不労所得を作る",
    is_free: false, price: 1980, rating: 4.2, cat: "副業",
    content: mkContent("AI教材の作り方", [
      { heading: "テーマ選定", body: "「自分が1年前に知りたかったこと」がベストテーマ。" },
      { heading: "構成と執筆", body: "読者のBefore/Afterを明確にした構成法。" },
      { heading: "販売プラットフォーム比較", body: "note、Brain、Udemy、自社サイトの手数料と特徴。" },
      { heading: "マーケティング", body: "Twitter/X、メルマガ、無料記事からの導線設計。" },
    ]),
  },
  {
    title: "AIを活用したフリーランスエンジニアの稼ぎ方",
    is_free: false, price: 1480, rating: 4.4, cat: "副業",
    content: mkContent("フリーランスAI活用", [
      { heading: "AI開発案件の見つけ方", body: "クラウドソーシング、エージェント、直営業の比較。" },
      { heading: "生産性3倍の開発フロー", body: "Copilot + Claude + Cursor を組み合わせた開発環境。" },
      { heading: "ポートフォリオの作り方", body: "AIプロジェクトのショーケースで差別化。" },
    ]),
  },
  {
    title: "AI × SNS運用で稼ぐ — フォロワー1万人を目指す戦略",
    is_free: false, price: 980, rating: 4.1, cat: "副業",
    content: mkContent("AI×SNS運用", [
      { heading: "コンテンツ企画の自動化", body: "ChatGPTでバズるネタを毎日量産する方法。" },
      { heading: "投稿文の最適化", body: "プラットフォーム別の最適な文字数・ハッシュタグ戦略。" },
      { heading: "収益化モデル", body: "アフィリエイト、スポンサー、自社商品への導線。" },
    ]),
  },

  // ━━━━ Dify (4件) ━━━━
  {
    title: "Dify入門 — ノーコードでAIアプリを30分で作る",
    is_free: true, price: 0, rating: 4.5, cat: "Dify",
    content: mkContent("Dify入門", [
      { heading: "Difyとは", body: "オープンソースのLLMアプリ開発プラットフォーム。" },
      { heading: "チャットボットを作ってみよう", body: "プロンプト設定→テスト→公開の3ステップ。" },
      { heading: "ナレッジベースの追加", body: "PDFやWebページをアップロードしてRAGを構築。" },
    ]),
  },
  {
    title: "Difyで社内FAQ AIを構築 — 問い合わせ対応を80%削減",
    is_free: false, price: 1980, rating: 4.6, cat: "Dify",
    content: mkContent("Dify社内FAQ AI", [
      { heading: "社内ドキュメントの整理", body: "FAQ、マニュアル、規定をDifyに読み込ませる準備。" },
      { heading: "チャットフローの設計", body: "質問分類→回答生成→エスカレーション判断のフロー。" },
      { heading: "Slack連携", body: "DifyのAPIをSlackボットから呼び出す方法。" },
      { heading: "運用と改善", body: "未回答ログの分析とナレッジベースの拡充。" },
    ]),
  },
  {
    title: "Difyワークフロー実践 — 複雑なAI業務フローを構築する",
    is_free: false, price: 2480, rating: 4.4, cat: "Dify",
    content: mkContent("Difyワークフロー実践", [
      { heading: "ワークフロー機能とは", body: "条件分岐、ループ、外部API呼び出しを含む複雑なフロー。" },
      { heading: "実践例：レポート自動生成", body: "データ取得→分析→レポート作成→メール送信の自動化。" },
      { heading: "実践例：コンテンツ審査", body: "投稿内容のAI審査→承認/却下/要修正の自動判定。" },
    ]),
  },

  // ━━━━ キャリア (4件) ━━━━
  {
    title: "AI時代のキャリア戦略 — エンジニア・非エンジニア別ロードマップ",
    is_free: true, price: 0, rating: 4.4, cat: "キャリア",
    content: mkContent("AI時代のキャリア戦略", [
      { heading: "エンジニア向けロードマップ", body: "AI活用の基礎→AI開発の実践→専門性の確立。" },
      { heading: "非エンジニア向けロードマップ", body: "日常業務で使う→業務フローに組み込む→AI人材としてのポジション確立。" },
    ]),
  },
  {
    title: "プロンプトエンジニアという職業 — 年収・スキル・なり方",
    is_free: true, price: 0, rating: 4.3, cat: "キャリア",
    content: mkContent("プロンプトエンジニアのキャリア", [
      { heading: "プロンプトエンジニアとは", body: "AIへの指示を最適化するスペシャリスト。" },
      { heading: "必要なスキル", body: "言語能力、論理的思考、ドメイン知識の3つ。" },
      { heading: "年収と求人動向", body: "日本では年収500〜1000万円。海外ではさらに高水準。" },
      { heading: "キャリアパス", body: "AI企画、AI PMへのキャリアアップが一般的。" },
    ]),
  },
  {
    title: "AI時代に求められるスキルTOP10 — 2025年版",
    is_free: true, price: 0, rating: 4.5, cat: "キャリア",
    content: mkContent("AI時代のスキルTOP10", [
      { heading: "テクニカルスキル5選", body: "プロンプト設計、データリテラシー、API連携、自動化、セキュリティ。" },
      { heading: "ソフトスキル5選", body: "批判的思考、クリエイティビティ、コミュニケーション、適応力、倫理観。" },
      { heading: "学習ロードマップ", body: "3ヶ月で基礎を固める具体的な学習計画。" },
    ]),
  },
  {
    title: "エンジニア転職でAIスキルをアピールする方法 — 職務経歴書テンプレート付き",
    is_free: false, price: 980, rating: 4.2, cat: "キャリア",
    content: mkContent("AI転職アピール", [
      { heading: "AIスキルの棚卸し", body: "ツール利用経験、開発経験、業務改善実績を整理。" },
      { heading: "職務経歴書のテンプレート", body: "AI活用実績を効果的にアピールする記述例。" },
      { heading: "面接対策", body: "「AIで何を解決したか」を具体的に語るフレームワーク。" },
    ]),
  },

  // ━━━━ 比較 (4件) ━━━━
  {
    title: "GPT-4o / Claude / Gemini — 最新AIモデル完全比較ガイド",
    is_free: false, price: 980, rating: 4.6, cat: "比較",
    content: mkContent("最新AIモデル比較", [
      { heading: "性能比較", body: "長文分析→Gemini、コード→Claude、日本語→GPT-4o。" },
      { heading: "料金比較", body: "GPT-4o: $2.50/$10、Claude: $3/$15、Gemini: $1.25/$5（1Mトークンあたり）。" },
    ]),
  },
  {
    title: "AIコーディングアシスタント比較 — Copilot vs Cursor vs Claude Code",
    is_free: true, price: 0, rating: 4.7, cat: "比較",
    content: mkContent("AIコーディングアシスタント比較", [
      { heading: "GitHub Copilot", body: "VS Code統合が最も成熟。月$10。" },
      { heading: "Cursor", body: "エディタごとAI対応。大規模リファクタリングに強い。" },
      { heading: "Claude Code", body: "CLIベース。自律的なコード変更が可能。" },
      { heading: "用途別おすすめ", body: "補完重視→Copilot、編集重視→Cursor、自律重視→Claude Code。" },
    ]),
  },
  {
    title: "ノーコードAIツール比較 — Dify vs FlowiseAI vs Langflow",
    is_free: true, price: 0, rating: 4.3, cat: "比較",
    content: mkContent("ノーコードAIツール比較", [
      { heading: "Dify", body: "最もUIが洗練。非エンジニアに最適。" },
      { heading: "FlowiseAI", body: "LangChain/LlamaIndexのビジュアルビルダー。技術者向け。" },
      { heading: "Langflow", body: "LangChainのフローチャートUI。カスタマイズ性が高い。" },
    ]),
  },
  {
    title: "AI搭載ノートアプリ比較 — Notion AI vs Obsidian + AI vs Mem",
    is_free: true, price: 0, rating: 4.2, cat: "比較",
    content: mkContent("AIノートアプリ比較", [
      { heading: "Notion AI", body: "既存のNotionワークスペースにAIを統合。月$10追加。" },
      { heading: "Obsidian + AIプラグイン", body: "ローカルファースト＋好みのAIモデルを接続。" },
      { heading: "Mem", body: "AI-nativeのノートアプリ。自動整理が特徴。" },
      { heading: "選び方のポイント", body: "チーム利用→Notion、プライバシー重視→Obsidian、個人利用→Mem。" },
    ]),
  },
];

// created_at を分散させる（最新から過去30日にバラけさせる）
function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

(async () => {
  await client.connect();
  console.log("Connected\n");

  // 既存の記事を全削除
  await client.query(`DELETE FROM public.articles`);
  console.log("Deleted existing articles\n");

  // カラムが存在することを確認
  await client.query(`ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0`);
  await client.query(`ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0`);
  console.log("Ensured rating & price columns exist\n");

  let count = 0;
  for (const a of articles) {
    const cat = a.cat;
    const thumb = a.thumbnail_url || pickImg(cat, count);
    const createdAt = randomDate(30);

    await client.query(
      `INSERT INTO public.articles (title, content, is_free, price, rating, thumbnail_url, published, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)`,
      [a.title, a.content, a.is_free, a.price, a.rating, thumb, createdAt]
    );
    const label = a.is_free ? "無料" : `¥${a.price.toLocaleString()}`;
    console.log(`  [${label}] ★${a.rating} [${cat}] ${a.title}`);
    count++;
  }

  console.log(`\n✅ ${articles.length}件の教材を追加しました！`);

  // カテゴリー別件数を表示
  const { rows } = await client.query(`
    SELECT
      CASE
        WHEN title LIKE '%ChatGPT%' THEN 'ChatGPT'
        WHEN title LIKE '%プロンプト%' THEN 'プロンプト'
        WHEN title LIKE '%画像生成%' THEN '画像生成'
        WHEN title LIKE '%自動化%' OR title LIKE '%自動%' THEN '自動化'
        WHEN title LIKE '%API%' THEN 'API'
        WHEN title LIKE '%Claude%' THEN 'Claude'
        WHEN title LIKE '%RAG%' THEN 'RAG'
        WHEN title LIKE '%副業%' OR title LIKE '%稼%' THEN '副業'
        WHEN title LIKE '%Midjourney%' THEN 'Midjourney'
        WHEN title LIKE '%Dify%' THEN 'Dify'
        WHEN title LIKE '%キャリア%' OR title LIKE '%転職%' OR title LIKE '%スキル%' THEN 'キャリア'
        WHEN title LIKE '%比較%' OR title LIKE '%vs%' THEN '比較'
        ELSE 'その他'
      END as category,
      COUNT(*) as cnt
    FROM public.articles
    WHERE published = true
    GROUP BY category
    ORDER BY cnt DESC
  `);
  console.log("\n📊 カテゴリー別件数:");
  rows.forEach((r) => console.log(`  ${r.category}: ${r.cnt}件`));

  await client.end();
})();
