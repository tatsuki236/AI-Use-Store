"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  rating: number | null;
  price: number | null;
  is_free: boolean;
};

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

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <svg
            key={star}
            className={`w-3 h-3 ${filled ? "text-amber-400" : half ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-sm-${star}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-sm-${star})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </>
            ) : (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        );
      })}
      <span className="text-[10px] font-medium text-muted-foreground ml-0.5">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export function CategoryRow({
  title,
  color,
  articles,
}: {
  title: string;
  color: string;
  articles: Article[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-8">
      {/* Category heading */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}
        >
          {title}
        </span>
        <span className="text-xs text-muted-foreground">
          {articles.length}件
        </span>
      </div>

      {/* Scroll container */}
      <div className="group/row relative">
        {/* Left button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-md border border-border/60 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="左へスクロール"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-md border border-border/60 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="右へスクロール"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group/card flex-shrink-0 w-56"
              style={{ scrollSnapAlign: "start" }}
            >
              <article className="bg-card rounded-xl overflow-hidden border border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                {/* Thumbnail */}
                {article.thumbnail_url ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={article.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className={`aspect-[16/10] bg-gradient-to-br ${getGradient(article.title)} flex items-center justify-center`}
                  >
                    <span className="text-2xl font-bold text-white/80 drop-shadow-md">
                      AI
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover/card:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <div className="mt-1.5">
                    <StarRating rating={article.rating ?? 0} />
                  </div>
                  <div className="mt-auto pt-2">
                    {article.is_free ? (
                      <span className="text-sm font-semibold text-emerald-600">
                        無料
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        ¥{article.price?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
