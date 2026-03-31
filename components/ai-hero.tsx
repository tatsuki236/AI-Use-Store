"use client";

import Link from "next/link";

type HeroStats = {
  article_count: number;
  user_count: number;
  satisfaction_percent: number;
} | null;

/* ── 共通テキストシャドウ ── */
const headingShadow = {
  textShadow:
    "0 2px 4px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)",
};
const bodyShadow = {
  textShadow:
    "0 1px 3px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.5)",
};
const accentShadow = {
  filter:
    "drop-shadow(0 2px 4px rgba(0,0,0,0.9)) drop-shadow(0 8px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 12px rgba(255,255,255,0.15))",
};

export function AiHero({ heroStats, isLoggedIn }: { heroStats: HeroStats; isLoggedIn?: boolean }) {
  return (
    <section className="relative overflow-hidden flex items-center bg-black" style={{ aspectRatio: "16 / 9" }}>
      {/* Background image — アスペクト比を保って全体表示 */}
      <img
        className="absolute inset-0 z-0 w-full h-full object-contain"
        src="/images/Gemini_Generated_Image_m91bvxm91bvxm91b.png"
        alt=""
        aria-hidden="true"
      />

      {/* 極薄グローバルオーバーレイ（10%のみ） */}
      <div className="absolute inset-0 z-[1] bg-black/10" />

      {/* テキスト背後の局所スクリム — 左下に向かって暗くなるラジアル */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 25% 55%, rgba(0,0,0,0.55) 0%, transparent 70%)",
        }}
      />

      {/* 下部フェード（ページコンテンツとの接続） */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-[1]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:py-32 relative z-10 w-full">
        {/* Eyebrow */}
        <div
          className="hero-fade-up mb-5"
          style={{ animation: "hero-fade-up 0.6s ease-out both" }}
        >
          <span
            className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-orange-400"
            style={accentShadow}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
            AI-Powered Knowledge Platform
          </span>
        </div>

        <div className="max-w-3xl">
          {/* Main heading */}
          <h1
            className="hero-fade-up text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white"
            style={{
              animation: "hero-fade-up 0.7s ease-out 0.1s both",
              ...headingShadow,
            }}
          >
            学びを、もっと
            <br className="sm:hidden" />
            <span className="text-orange-400" style={headingShadow}>
              自由
            </span>
            に。
          </h1>

          {/* Subheading */}
          <p
            className="hero-fade-up mt-5 text-base sm:text-lg text-gray-200 leading-relaxed max-w-xl"
            style={{
              animation: "hero-fade-up 0.7s ease-out 0.2s both",
              ...bodyShadow,
            }}
          >
            AIスキルを、実践的な記事で学べる。
            <br className="hidden sm:inline" />
            あなたのペースで、プロのスキルを。
          </p>

          {/* CTA Buttons */}
          <div
            className="hero-fade-up mt-8 flex flex-wrap items-center gap-3"
            style={{ animation: "hero-fade-up 0.7s ease-out 0.35s both" }}
          >
            {/* PC: 無料で始める + 記事を探す */}
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center h-12 rounded-full px-8 text-base font-semibold bg-orange-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_4px_32px_rgba(249,115,22,0.55)] transition-all duration-200"
            >
              無料で始める
            </Link>
            <Link
              href="/search?q="
              className="hidden sm:inline-flex items-center justify-center h-12 rounded-full px-7 text-base font-medium text-white border border-white/40 backdrop-blur-md bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200"
            >
              記事を探す
            </Link>
            {/* スマホ: 未ログイン時のみ表示 */}
            {!isLoggedIn && (
              <>
                <Link
                  href="/search?q="
                  className="sm:hidden inline-flex items-center justify-center h-12 rounded-full px-8 text-base font-semibold bg-orange-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_4px_32px_rgba(249,115,22,0.55)] transition-all duration-200"
                >
                  記事を探す
                </Link>
                <Link
                  href="/login"
                  className="sm:hidden inline-flex items-center justify-center h-12 rounded-full px-7 text-base font-medium text-white border border-white/40 backdrop-blur-md bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200"
                >
                  ログイン
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Trust Signals — グラスモーフィズム強化 */}
        <div
          className="hero-fade-up mt-10 grid grid-cols-3 gap-3 sm:gap-5 max-w-lg"
          style={{ animation: "hero-fade-up 0.7s ease-out 0.5s both" }}
        >
          <div className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/15 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-black/40 hover:-translate-y-1 transition-all duration-300 text-center">
            <span
              className="block text-2xl sm:text-3xl font-extrabold text-blue-400 leading-none"
              style={accentShadow}
            >
              {heroStats?.article_count?.toLocaleString() ?? "0"}
            </span>
            <span className="block mt-1.5 text-[11px] sm:text-xs text-gray-300 font-medium" style={bodyShadow}>
              公開コンテンツ
            </span>
          </div>
          <div className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/15 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-black/40 hover:-translate-y-1 transition-all duration-300 text-center">
            <span
              className="block text-2xl sm:text-3xl font-extrabold text-blue-400 leading-none"
              style={accentShadow}
            >
              {heroStats?.user_count?.toLocaleString() ?? "0"}
            </span>
            <span className="block mt-1.5 text-[11px] sm:text-xs text-gray-300 font-medium" style={bodyShadow}>
              登録ユーザー
            </span>
          </div>
          <div className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/15 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-black/40 hover:-translate-y-1 transition-all duration-300 text-center">
            <span
              className="block text-2xl sm:text-3xl font-extrabold text-orange-400 leading-none"
              style={accentShadow}
            >
              {heroStats?.satisfaction_percent != null
                ? `${heroStats.satisfaction_percent}%`
                : "--%"}
            </span>
            <span className="block mt-1.5 text-[11px] sm:text-xs text-gray-300 font-medium" style={bodyShadow}>
              学習満足度
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade to blend with page content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
