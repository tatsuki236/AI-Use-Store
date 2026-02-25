import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "検索結果",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${rating >= star ? "text-amber-400" : rating >= star - 0.5 ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[11px] font-medium text-muted-foreground ml-0.5">{rating.toFixed(1)}</span>
    </span>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const supabase = await createClient();

  const { data: articles } = query
    ? await supabase
        .from("articles")
        .select("id, title, content, created_at, is_free, price, rating, thumbnail_url")
        .eq("published", true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const totalResults = articles?.length ?? 0;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto max-w-6xl py-8 px-4 flex gap-8">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">
            {query ? `「${query}」の検索結果` : "検索"}
          </h1>
          {query && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalResults}件見つかりました
            </p>
          )}

          {/* Articles */}
          {articles && articles.length > 0 && (
            <section className="mt-8">
              <div className="space-y-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="flex gap-4 bg-card rounded-xl border border-border/60 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    {article.thumbnail_url && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                        <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold truncate">{article.title}</h3>
                        {article.is_free ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shrink-0">
                            無料
                          </Badge>
                        ) : (
                          <span className="font-bold text-primary shrink-0">¥{article.price.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {article.content
                          .replace(/[#*>`\-\n|]/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .slice(0, 120)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <StarRating rating={article.rating ?? 0} />
                        <time>
                          {new Date(article.created_at).toLocaleDateString("ja-JP", {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              「{query}」に一致する教材が見つかりませんでした
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
