import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { AiHero } from "@/components/ai-hero";
import { StarRating } from "@/components/star-rating";
import { ArticleGrid } from "@/components/article-grid";
import { ArticleFilters } from "@/components/article-filters";
import { BannerCarousel } from "@/components/banner-carousel";
import { HorizontalScroll } from "@/components/horizontal-scroll";
import { getGradient, getTag, tagColors, isNew, getExcerpt } from "@/lib/article-utils";
import type { ArticleCardData } from "@/components/article-card";

type SearchParams = {
  category?: string;
  price?: string;
  sort?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hasFilters = params.category || params.price || (params.sort && params.sort !== "newest");

  // Build filtered query
  let query = supabase
    .from("articles")
    .select("id, title, content, thumbnail_url, rating, price, is_free, created_at, purchase_count, review_count, like_count, category, slug")
    .eq("published", true);

  // Category filter
  if (params.category) {
    query = query.eq("category", params.category);
  }

  // Price filter
  if (params.price === "free") {
    query = query.eq("is_free", true);
  } else if (params.price === "paid") {
    query = query.eq("is_free", false);
  } else if (params.price === "0-500") {
    query = query.or("is_free.eq.true,price.lte.500");
  } else if (params.price === "0-1000") {
    query = query.or("is_free.eq.true,price.lte.1000");
  } else if (params.price === "1000-") {
    query = query.eq("is_free", false).gte("price", 1000);
  }

  // Sort
  if (params.sort === "popular") {
    query = query.order("purchase_count", { ascending: false }).order("rating", { ascending: false });
  } else if (params.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (params.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: articles } = await query;

  // Trending: top by purchase_count
  const { data: trending } = await supabase
    .from("articles")
    .select("id, title, thumbnail_url, rating, price, is_free, created_at, purchase_count, review_count, like_count, slug")
    .eq("published", true)
    .order("purchase_count", { ascending: false })
    .order("rating", { ascending: false })
    .limit(8);

  // New arrivals (last 14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: newArrivals } = await supabase
    .from("articles")
    .select("id, title, thumbnail_url, rating, price, is_free, created_at, purchase_count, review_count, like_count, slug")
    .eq("published", true)
    .gte("created_at", twoWeeksAgo)
    .order("created_at", { ascending: false })
    .limit(8);

  // Ranking (top 5 by rating)
  const { data: ranked } = await supabase
    .from("articles")
    .select("id, title, thumbnail_url, rating, price, is_free, created_at, purchase_count, review_count, like_count, slug")
    .eq("published", true)
    .order("rating", { ascending: false })
    .limit(10);

  // Hero stats
  const { data: heroStats } = await supabase.rpc("get_hero_stats");

  // Banners
  const { data: banners } = await supabase
    .from("banners")
    .select("id, title, description, image_url, link_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const featured = !hasFilters ? (articles?.[0] ?? null) : null;
  const gridArticles = articles ?? [];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Banner Carousel */}
      {!hasFilters && banners && banners.length > 0 && (
        <div className="container mx-auto max-w-6xl px-4 pt-4">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Hero (compact when filters active) */}
      {!hasFilters && <AiHero heroStats={heroStats} isLoggedIn={!!user} />}

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Ranking Section */}
        {!hasFilters && ranked && ranked.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-amber-500">&#9733;</span>
              人気ランキング
            </h2>
            <HorizontalScroll>
              {ranked.map((article, i) => {
                const medals = ["bg-amber-400 text-white", "bg-gray-300 text-white", "bg-amber-600 text-white"];
                const medalStyle = i < 3 ? medals[i] : "bg-muted text-muted-foreground";
                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug || article.id}`}
                    className="group flex-shrink-0 w-44"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <article className="bg-card rounded-xl overflow-hidden border border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col relative">
                      <span className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${medalStyle}`}>
                        {i + 1}
                      </span>
                      {article.thumbnail_url ? (
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className={`aspect-[16/10] bg-gradient-to-br ${getGradient(article.title)} flex items-center justify-center`}>
                          <span className="text-xl font-bold text-white/80 drop-shadow-md">AI</span>
                        </div>
                      )}
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
            </HorizontalScroll>
          </section>
        )}

        {/* Featured Article */}
        {featured && (
          <section className="mb-10">
            <Link href={`/articles/${featured.slug || featured.id}`} className="group block">
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 bg-card rounded-2xl overflow-hidden border border-border/60 hover:shadow-xl transition-all duration-300">
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
                    {getExcerpt(featured.content ?? "", 160)}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <StarRating rating={featured.rating ?? 0} />
                    {(featured.review_count ?? 0) > 0 && (
                      <span className="text-[11px] text-muted-foreground">({featured.review_count}件)</span>
                    )}
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

        {/* Trending Section */}
        {!hasFilters && trending && trending.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              トレンド
            </h2>
            <ArticleGrid articles={trending as ArticleCardData[]} />
          </section>
        )}

        {/* New Arrivals Section */}
        {!hasFilters && newArrivals && newArrivals.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              新着
            </h2>
            <ArticleGrid articles={newArrivals as ArticleCardData[]} />
          </section>
        )}

        {/* Filters + All Articles Grid */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">
            {hasFilters ? "検索結果" : "すべての記事"}
          </h2>
          <Suspense fallback={null}>
            <ArticleFilters />
          </Suspense>
          <div className="mt-6">
            <ArticleGrid articles={gridArticles as ArticleCardData[]} />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/40 mt-8">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">A</span>
                </div>
                <span className="font-bold text-base">AiUseStore</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AIスキルを、実践的な記事で学べるAI特化型ナレッジプラットフォーム。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">カテゴリー</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/?category=ChatGPT" className="hover:text-foreground transition-colors">ChatGPT活用</Link></li>
                <li><Link href="/?category=プロンプト" className="hover:text-foreground transition-colors">プロンプト設計</Link></li>
                <li><Link href="/?category=画像生成" className="hover:text-foreground transition-colors">画像生成AI</Link></li>
                <li><Link href="/?category=自動化" className="hover:text-foreground transition-colors">AI自動化・効率化</Link></li>
                <li><Link href="/?category=Claude" className="hover:text-foreground transition-colors">Claude</Link></li>
                <li><Link href="/?category=副業" className="hover:text-foreground transition-colors">AI副業</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">サービス</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">記事一覧</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">新規登録</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">ログイン</Link></li>
              </ul>
            </div>
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
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AiUseStore. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>AI記事プラットフォーム</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
