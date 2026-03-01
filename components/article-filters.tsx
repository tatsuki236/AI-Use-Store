"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const categories = [
  "すべて", "ChatGPT", "プロンプト", "画像生成", "自動化", "API",
  "Claude", "RAG", "副業", "Midjourney", "Dify",
];

const priceFilters = [
  { label: "すべて", value: "" },
  { label: "無料", value: "free" },
  { label: "有料", value: "paid" },
  { label: "~¥500", value: "0-500" },
  { label: "~¥1,000", value: "0-1000" },
  { label: "¥1,000+", value: "1000-" },
];

const sortOptions = [
  { label: "新着順", value: "newest" },
  { label: "人気順", value: "popular" },
  { label: "価格安い順", value: "price_asc" },
  { label: "価格高い順", value: "price_desc" },
];

export function ArticleFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentPrice = searchParams.get("price") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "すべて") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-4">
      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = cat === "すべて" ? !currentCategory : currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => updateParams("category", cat === "すべて" ? "" : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Price + Sort row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">価格:</span>
          <div className="flex gap-1">
            {priceFilters.map((pf) => {
              const isActive = pf.value === currentPrice;
              return (
                <button
                  key={pf.value}
                  onClick={() => updateParams("price", pf.value)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {pf.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">並び替え:</span>
          <select
            value={currentSort}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="text-xs bg-muted/60 border border-border/60 rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
