"use client";

import Link from "next/link";

type HeroStats = {
  article_count: number;
  user_count: number;
  satisfaction_percent: number;
} | null;

export function AiHero({ heroStats, isLoggedIn }: { heroStats: HeroStats; isLoggedIn?: boolean }) {
  return (
    <section className="relative overflow-hidden min-h-[600px] sm:min-h-[700px] lg:min-h-[85vh] flex items-center bg-black">
      {/* Background video */}
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-90"
        src="/images/hi-ro.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:py-32 relative z-10 w-full">
        {/* Eyebrow */}
        <div
          className="hero-fade-up mb-5"
          style={{ animation: "hero-fade-up 0.6s ease-out both" }}
        >
          <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            AI-Powered Knowledge Platform
          </span>
        </div>

        <div className="max-w-3xl">
          {/* Main heading */}
          <h1
            className="hero-fade-up text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white"
            style={{ animation: "hero-fade-up 0.7s ease-out 0.1s both" }}
          >
            学びを、もっと
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              自由
            </span>
            に。
          </h1>

          {/* Subheading */}
          <p
            className="hero-fade-up mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl"
            style={{ animation: "hero-fade-up 0.7s ease-out 0.2s both" }}
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
              className="hidden sm:inline-flex items-center justify-center h-12 rounded-full px-8 text-base font-semibold bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.45)] transition-all duration-200"
            >
              無料で始める
            </Link>
            <Link
              href="/search?q="
              className="hidden sm:inline-flex items-center justify-center h-12 rounded-full px-7 text-base font-medium text-white border border-white/30 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
            >
              記事を探す
            </Link>
            {/* スマホ: 未ログイン時のみ表示 */}
            {!isLoggedIn && (
              <>
                <Link
                  href="/search?q="
                  className="sm:hidden inline-flex items-center justify-center h-12 rounded-full px-8 text-base font-semibold bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.45)] transition-all duration-200"
                >
                  記事を探す
                </Link>
                <Link
                  href="/login"
                  className="sm:hidden inline-flex items-center justify-center h-12 rounded-full px-7 text-base font-medium text-white border border-white/30 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
                >
                  ログイン
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Trust Signals */}
        <div
          className="hero-fade-up mt-10 grid grid-cols-3 gap-3 sm:gap-5 max-w-lg"
          style={{ animation: "hero-fade-up 0.7s ease-out 0.5s both" }}
        >
          <div className="rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 px-4 py-4 sm:px-5 sm:py-5 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-400 leading-none drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
              {heroStats?.article_count?.toLocaleString() ?? "0"}
            </span>
            <span className="block mt-1.5 text-[11px] sm:text-xs text-gray-400 font-medium">
              公開コンテンツ
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 px-4 py-4 sm:px-5 sm:py-5 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-400 leading-none drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
              {heroStats?.user_count?.toLocaleString() ?? "0"}
            </span>
            <span className="block mt-1.5 text-[11px] sm:text-xs text-gray-400 font-medium">
              登録ユーザー
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 px-4 py-4 sm:px-5 sm:py-5 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-orange-400 leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]">
              {heroStats?.satisfaction_percent != null
                ? `${heroStats.satisfaction_percent}%`
                : "--%"}
            </span>
            <span className="block mt-1.5 text-[11px] sm:text-xs text-gray-400 font-medium">
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
