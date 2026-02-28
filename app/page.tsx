import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "@/components/category-row";
import { HeroGlow } from "@/components/ui/hero-glow";

function getExcerpt(content: string, maxLength = 90): string {
  return content
    .replace(/[#*>`\-\n|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

const tagColors: Record<string, string> = {
  ChatGPT: "bg-emerald-100 text-emerald-700",
  プロンプト: "bg-amber-100 text-amber-700",
  画像生成: "bg-pink-100 text-pink-700",
  自動化: "bg-sky-100 text-sky-700",
  API: "bg-violet-100 text-violet-700",
  Claude: "bg-indigo-100 text-indigo-700",
  RAG: "bg-blue-100 text-blue-700",
  副業: "bg-orange-100 text-orange-700",
  Midjourney: "bg-rose-100 text-rose-700",
  Dify: "bg-teal-100 text-teal-700",
  キャリア: "bg-purple-100 text-purple-700",
  比較: "bg-cyan-100 text-cyan-700",
};

function getTag(title: string): { label: string; color: string } | null {
  for (const [key, color] of Object.entries(tagColors)) {
    if (title.includes(key)) return { label: key, color };
  }
  return null;
}

const cardGradients = [
  "from-violet-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-cyan-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-400 to-purple-500",
];

function getGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cardGradients[Math.abs(hash) % cardGradients.length];
}

function isNew(dateStr: string): boolean {
  const created = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${filled ? "text-amber-400" : half ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-${star}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${star})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </>
            ) : (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        );
      })}
      <span className="text-[11px] font-medium text-muted-foreground ml-0.5">{rating.toFixed(1)}</span>
    </span>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const { data: ranked } = await supabase
    .from("articles")
    .select("id, title, thumbnail_url, rating, price, is_free")
    .eq("published", true)
    .order("rating", { ascending: false })
    .limit(5);

  const { data: heroStats } = await supabase.rpc("get_hero_stats");

  const featured = articles?.[0];
  const rest = articles?.slice(1);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <HeroGlow />
        <div className="container mx-auto max-w-6xl px-4 py-16 sm:py-24 relative">
          <div className="max-w-2xl">
            <h1
              className="hero-fade-up text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]"
              style={{ animation: "hero-fade-up 0.7s ease-out both" }}
            >
              学びを、もっと
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">自由</span>に。
            </h1>
            <p
              className="hero-fade-up mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed"
              style={{ animation: "hero-fade-up 0.7s ease-out 0.15s both" }}
            >
              AIスキルを、実践的な教材で学べる<br className="hidden sm:inline" />
              AI特化型ナレッジプラットフォーム
            </p>
            <div
              className="hero-fade-up mt-7 flex gap-3"
              style={{ animation: "hero-fade-up 0.7s ease-out 0.3s both" }}
            >
              <Link href="/signup">
                <Button className="h-11 rounded-full px-8 shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200">
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Signals - Glassmorphism */}
          <div
            className="hero-fade-up mt-12 flex flex-wrap gap-4 sm:gap-6"
            style={{ animation: "hero-fade-up 0.7s ease-out 0.45s both" }}
          >
            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/80 dark:border-white/10 px-5 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">{heroStats?.article_count?.toLocaleString() ?? "0"}</span>
              <span className="text-xs sm:text-sm text-muted-foreground leading-tight">公開中の<br />コンテンツ</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/80 dark:border-white/10 px-5 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">{heroStats?.user_count?.toLocaleString() ?? "0"}</span>
              <span className="text-xs sm:text-sm text-muted-foreground leading-tight">登録<br />ユーザー</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/80 dark:border-white/10 px-5 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{heroStats?.satisfaction_percent != null ? `${heroStats.satisfaction_percent}%` : "--%"}</span>
              <span className="text-xs sm:text-sm text-muted-foreground leading-tight">学習<br />満足度</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto max-w-6xl px-4 py-10 flex gap-8">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Column */}
        <main className="flex-1 min-w-0">
          {/* Ranking */}
          {ranked && ranked.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-amber-500">&#9733;</span>
                人気ランキング
              </h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2" style={{ scrollSnapType: "x mandatory" }}>
                {ranked.map((article, i) => {
                  const medals = ["bg-amber-400 text-white", "bg-gray-300 text-white", "bg-amber-600 text-white"];
                  const medalStyle = i < 3 ? medals[i] : "bg-muted text-muted-foreground";
                  return (
                    <Link
                      key={article.id}
                      href={`/articles/${article.id}`}
                      className="group flex-shrink-0 w-44"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <article className="bg-card rounded-xl overflow-hidden border border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col relative">
                        {/* Rank badge */}
                        <span className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${medalStyle}`}>
                          {i + 1}
                        </span>
                        {/* Thumbnail */}
                        {article.thumbnail_url ? (
                          <div className="aspect-[16/10] overflow-hidden">
                            <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className={`aspect-[16/10] bg-gradient-to-br ${getGradient(article.title)} flex items-center justify-center`}>
                            <span className="text-xl font-bold text-white/80 drop-shadow-md">AI</span>
                          </div>
                        )}
                        {/* Info */}
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </p>
                          <div className="mt-1.5">
                            <StarRating rating={article.rating ?? 0} />
                          </div>
                          <div className="mt-auto pt-2">
                            {article.is_free ? (
                              <span className="text-sm font-semibold text-emerald-600">無料</span>
                            ) : (
                              <span className="text-sm font-bold text-primary">¥{article.price?.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Featured Article */}
          {featured && (
            <section className="mb-10">
              <Link href={`/articles/${featured.id}`} className="group block">
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 bg-card rounded-2xl overflow-hidden border border-border/60 hover:shadow-xl transition-all duration-300">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-primary px-2.5 py-1 rounded-full shadow-sm">
                      注目
                    </span>
                    {isNew(featured.created_at) && (
                      <span className="text-[11px] font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full shadow-sm">
                        NEW
                      </span>
                    )}
                  </div>
                  {/* Image */}
                  {featured.thumbnail_url ? (
                    <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={featured.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className={`aspect-[4/3] md:aspect-auto bg-gradient-to-br ${getGradient(featured.title)} flex items-center justify-center`}>
                      <span className="text-7xl drop-shadow-lg">AI</span>
                    </div>
                  )}
                  {/* Text */}
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      {(() => {
                        const tag = getTag(featured.title);
                        return tag ? (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tag.color}`}>
                            {tag.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {getExcerpt(featured.content, 160)}
                    </p>
                    <div className="mt-3">
                      <StarRating rating={featured.rating ?? 0} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <time>
                        {new Date(featured.created_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                      </time>
                      <span className="ml-auto">
                        {featured.is_free ? (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                            無料
                          </span>
                        ) : (
                          <span className="font-bold text-primary text-sm">
                            ¥{featured.price?.toLocaleString()}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Category Rows */}
          {rest && rest.length > 0 && (() => {
            const grouped: Record<string, typeof rest> = {};
            rest.forEach((article) => {
              const tag = getTag(article.title);
              const key = tag?.label ?? "その他";
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(article);
            });

            return (
              <section>
                <h2 className="text-lg font-bold mb-5">最新の教材</h2>
                {Object.entries(grouped).map(([label, articles]) => {
                  const color = tagColors[label] ?? "bg-gray-100 text-gray-700";
                  return (
                    <CategoryRow
                      key={label}
                      title={label}
                      color={color}
                      articles={articles}
                    />
                  );
                })}
              </section>
            );
          })()}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/40 mt-16">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Branding */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">A</span>
                </div>
                <span className="font-bold text-base">AiUseStore</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AIスキルを、実践的な教材で学べるAI特化型ナレッジプラットフォーム。
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold mb-3">カテゴリー</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search?q=ChatGPT" className="hover:text-foreground transition-colors">ChatGPT活用</Link></li>
                <li><Link href="/search?q=プロンプト" className="hover:text-foreground transition-colors">プロンプト設計</Link></li>
                <li><Link href="/search?q=画像生成" className="hover:text-foreground transition-colors">画像生成AI</Link></li>
                <li><Link href="/search?q=自動化" className="hover:text-foreground transition-colors">AI自動化・効率化</Link></li>
                <li><Link href="/search?q=プログラミング" className="hover:text-foreground transition-colors">AI × プログラミング</Link></li>
                <li><Link href="/search?q=ビジネス" className="hover:text-foreground transition-colors">AIビジネス活用</Link></li>
              </ul>
            </div>

            {/* Service */}
            <div>
              <h4 className="text-sm font-semibold mb-3">サービス</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">教材一覧</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">新規登録</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">ログイン</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold mb-3">サポート</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="/legal" className="hover:text-foreground transition-colors">特定商取引法に基づく表記</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">お問い合わせ</Link></li>
                <li><a href="mailto:info@aiusestore.com" className="hover:text-foreground transition-colors">info@aiusestore.com</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AiUseStore. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>AI教材プラットフォーム</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
