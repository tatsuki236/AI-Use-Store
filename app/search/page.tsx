import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ArticleGrid } from "@/components/article-grid";
import { ArticleFilters } from "@/components/article-filters";
import type { ArticleCardData } from "@/components/article-card";

export const metadata = {
  title: "検索結果",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const supabase = await createClient();

  let dbQuery = supabase
    .from("articles")
    .select("id, title, content, created_at, is_free, price, rating, thumbnail_url, purchase_count, review_count")
    .eq("published", true);

  // Text search
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
  }

  // Category filter
  if (params.category) {
    dbQuery = dbQuery.ilike("title", `%${params.category}%`);
  }

  // Price filter
  if (params.price === "free") {
    dbQuery = dbQuery.eq("is_free", true);
  } else if (params.price === "paid") {
    dbQuery = dbQuery.eq("is_free", false);
  } else if (params.price === "0-500") {
    dbQuery = dbQuery.or("is_free.eq.true,price.lte.500");
  } else if (params.price === "0-1000") {
    dbQuery = dbQuery.or("is_free.eq.true,price.lte.1000");
  } else if (params.price === "1000-") {
    dbQuery = dbQuery.eq("is_free", false).gte("price", 1000);
  }

  // Sort
  if (params.sort === "popular") {
    dbQuery = dbQuery.order("purchase_count", { ascending: false }).order("rating", { ascending: false });
  } else if (params.sort === "price_asc") {
    dbQuery = dbQuery.order("price", { ascending: true });
  } else if (params.sort === "price_desc") {
    dbQuery = dbQuery.order("price", { ascending: false });
  } else {
    dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  const { data: articles } = await dbQuery.limit(40);

  const totalResults = articles?.length ?? 0;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <h1 className="text-2xl font-bold">
          {query ? `「${query}」の検索結果` : "検索"}
        </h1>
        {query && (
          <p className="text-sm text-muted-foreground mt-1">
            {totalResults}件見つかりました
          </p>
        )}

        {/* Filters */}
        <div className="mt-6">
          <Suspense fallback={null}>
            <ArticleFilters />
          </Suspense>
        </div>

        {/* Results Grid */}
        <div className="mt-6">
          {(articles && articles.length > 0) || query ? (
            <ArticleGrid articles={(articles ?? []) as ArticleCardData[]} />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              検索キーワードを入力してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
