import { ArticleCard, type ArticleCardData } from "@/components/article-card";

export function ArticleGrid({ articles }: { articles: ArticleCardData[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        該当する記事が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
