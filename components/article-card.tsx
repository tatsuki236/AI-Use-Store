import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { getGradient, getTag, isNew, getExcerpt, getCharCount, tagColors } from "@/lib/article-utils";

export type ArticleCardData = {
  id: string;
  title: string;
  content?: string;
  thumbnail_url: string | null;
  rating: number | null;
  price: number | null;
  is_free: boolean;
  created_at: string;
  purchase_count?: number;
  review_count?: number;
  like_count?: number;
  category?: string;
  slug?: string;
};

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const tag = article.category && tagColors[article.category]
    ? { label: article.category, color: tagColors[article.category] }
    : getTag(article.title);
  const isNewArticle = isNew(article.created_at);
  const isPopular = (article.purchase_count ?? 0) >= 5;

  return (
    <Link href={`/articles/${article.slug || article.id}`} className="group block h-full">
      <article className="bg-card rounded-xl overflow-hidden border border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative">
          {article.thumbnail_url ? (
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={article.thumbnail_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-white flex items-center justify-center p-4">
              <img
                src="/images/logo.png"
                alt="AiUseStore"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isNewArticle && (
              <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full shadow-sm">
                NEW
              </span>
            )}
            {isPopular && (
              <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full shadow-sm">
                人気
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col">
          {tag && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit mb-1.5 ${tag.color}`}>
              {tag.label}
            </span>
          )}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.content && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {getExcerpt(article.content, 80)}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating rating={article.rating ?? 0} />
            {(article.review_count ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({article.review_count})
              </span>
            )}
            {(article.like_count ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {article.like_count}
              </span>
            )}
          </div>
          <div className="mt-auto pt-2 flex items-center justify-between">
            {article.is_free ? (
              <span className="text-sm font-semibold text-emerald-600">無料</span>
            ) : (
              <span className="text-sm font-bold text-primary">¥{article.price?.toLocaleString()}</span>
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              {article.content && (
                <span>{getCharCount(article.content).toLocaleString()}字</span>
              )}
              {(article.purchase_count ?? 0) > 0 && (
                <span>{article.purchase_count}件購入</span>
              )}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
