import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { PaywallOverlay } from "@/components/paywall-overlay";
import { ArticleBody } from "./article-body";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";
import { LikeButton } from "./like-button";
import { getCharCount } from "@/lib/article-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title, content")
    .eq("id", id)
    .single();

  if (!article) return { title: "記事が見つかりません" };

  const description = article.content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*>`\-\n|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: article.title,
    description,
    openGraph: { title: article.title, description },
  };
}

function getArticleIcon(title: string): string {
  if (title.includes("AI") || title.includes("ChatGPT")) return "\u{1F916}";
  if (title.includes("Python") || title.includes("機械学習")) return "\u{1F40D}";
  if (title.includes("Next") || title.includes("React")) return "\u269B\uFE0F";
  if (title.includes("デザイン") || title.includes("UI")) return "\u{1F3A8}";
  if (title.includes("Git")) return "\u{1F33F}";
  if (title.includes("TypeScript") || title.includes("型")) return "\u{1F4D8}";
  return "\u{1F4DD}";
}

function getThumbnailColor(title: string): string {
  const colors = [
    "from-violet-400 to-indigo-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-cyan-500",
    "from-rose-400 to-pink-500",
    "from-emerald-400 to-teal-500",
    "from-fuchsia-400 to-purple-500",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getPreviewContent(content: string): string {
  // HTML paywall marker (from Tiptap editor)
  if (content.includes("data-paywall")) {
    return content.split(/<div[^>]*data-paywall[^>]*>[\s\S]*?<\/div>/)[0].trim();
  }
  // Markdown paywall marker (legacy)
  if (content.includes("<!-- paywall -->")) {
    return content.split("<!-- paywall -->")[0].trim();
  }
  // Fallback: first 3 paragraphs (Markdown) or first portion (HTML)
  if (/<(?:p|h[1-6]|div)\b/i.test(content)) {
    const parts = content.split(/<\/(?:p|h[1-6])>/i);
    return parts.slice(0, 3).join("</p>") + "</p>";
  }
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.slice(0, 3).join("\n\n");
}

function getBlurPreviewContent(content: string): string {
  // Get content after paywall for blurred preview
  if (content.includes("data-paywall")) {
    const parts = content.split(/<div[^>]*data-paywall[^>]*>[\s\S]*?<\/div>/);
    if (parts.length > 1) {
      // Take first 2-3 paragraphs after paywall
      const afterPaywall = parts[1].trim();
      const paragraphs = afterPaywall.split(/<\/(?:p|h[1-6])>/i);
      return paragraphs.slice(0, 3).join("</p>") + "</p>";
    }
  }
  if (content.includes("<!-- paywall -->")) {
    const parts = content.split("<!-- paywall -->");
    if (parts.length > 1) {
      const afterPaywall = parts[1].trim();
      const paragraphs = afterPaywall.split(/\n\n+/);
      return paragraphs.slice(0, 3).join("\n\n");
    }
  }
  return "";
}

function getFullContent(content: string): string {
  return content
    .replace(/<div[^>]*data-paywall[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<!--\s*paywall\s*-->/g, "");
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*, profiles:author_id(display_name, email, avatar_url)")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!article) notFound();

  const authorProfile = article.profiles as { display_name: string | null; email: string | null; avatar_url: string | null } | null;
  const authorName = authorProfile?.display_name || authorProfile?.email?.split("@")[0] || "ユーザー";
  const authorInitial = authorName.charAt(0).toUpperCase();

  // Check user login and purchase status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let purchaseStatus: string | null = null;
  if (user && !article.is_free) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("status")
      .eq("user_id", user.id)
      .eq("article_id", id)
      .single();
    purchaseStatus = purchase?.status ?? null;
  }

  const isFree = article.is_free;
  const hasAccess = isFree || purchaseStatus === "completed";
  const isPending = purchaseStatus === "pending";

  // Fetch reviews for this article
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, user_id, rating, comment, created_at")
    .eq("article_id", id)
    .order("created_at", { ascending: false });

  // Check if current user already reviewed
  const existingReview = user
    ? (reviews ?? []).find((r) => r.user_id === user.id) ?? null
    : null;

  // Check if current user has liked
  let hasLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("article_id", id)
      .single();
    hasLiked = !!like;
  }

  const charCount = getCharCount(article.content);

  const blurPreview = !hasAccess ? getBlurPreviewContent(article.content) : "";

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      {/* Hero Image */}
      {article.thumbnail_url ? (
        <div className="w-full max-h-[400px] overflow-hidden">
          <img
            src={article.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-full h-48 sm:h-72 bg-gradient-to-br ${getThumbnailColor(article.title)} flex items-center justify-center`}>
          <span className="text-6xl sm:text-8xl drop-shadow-lg">{getArticleIcon(article.title)}</span>
        </div>
      )}

      {/* Article Card */}
      <main className="container mx-auto max-w-3xl px-4 -mt-8 relative z-10 pb-16">
        <div className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden">
          {/* Article Header */}
          <div className="px-6 sm:px-10 pt-8 sm:pt-10">
            <div className="flex items-center gap-2 mb-3">
              {isFree ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  無料
                </Badge>
              ) : (
                <Badge variant="outline" className="font-bold text-primary border-primary/30">
                  ¥{article.price?.toLocaleString()}
                </Badge>
              )}
              {(article.purchase_count ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">{article.purchase_count}件購入</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {article.title}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={article.rating ?? 0} size="md" />
              {(article.review_count ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">({article.review_count}件のレビュー)</span>
              )}
              <LikeButton
                articleId={id}
                initialLiked={hasLiked}
                initialCount={article.like_count ?? 0}
                isLoggedIn={!!user}
              />
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              {authorProfile?.avatar_url ? (
                <img
                  src={authorProfile.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {authorInitial}
                </div>
              )}
              <div>
                <p className="text-foreground text-sm font-medium">{authorName}</p>
                <div className="flex items-center gap-2 text-xs">
                  <time>
                    {new Date(article.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="text-muted-foreground/50">|</span>
                  <span>約{charCount.toLocaleString()}文字</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 sm:mx-10 my-6 border-t border-border/60" />

          {/* Article Content */}
          {hasAccess ? (
            <div className="px-6 sm:px-10 pb-10">
              <ArticleBody content={getFullContent(article.content)} />
            </div>
          ) : (
            <>
              {/* Preview content */}
              <div className="px-6 sm:px-10">
                <ArticleBody content={getPreviewContent(article.content)} />
              </div>

              {/* Blurred preview of paid content */}
              {blurPreview && (
                <div className="px-6 sm:px-10 relative select-none" aria-hidden="true">
                  <div className="blur-sm opacity-50 pointer-events-none">
                    <ArticleBody content={blurPreview} />
                  </div>
                </div>
              )}

              {/* Paywall Overlay */}
              <div className="px-6 sm:px-10 pb-10">
                <PaywallOverlay
                  price={article.price ?? 0}
                  articleId={article.id}
                  isLoggedIn={!!user}
                  isPending={isPending}
                />
              </div>
            </>
          )}
        </div>

        {/* Review Section */}
        <div className="mt-8 bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden px-6 sm:px-10 py-8">
          <h2 className="text-lg font-bold mb-6">レビュー</h2>

          {/* Review Form - show if user is logged in and has access */}
          {user && hasAccess && (
            <div className="mb-8 pb-6 border-b border-border/60">
              <ReviewForm
                articleId={id}
                existingReview={existingReview ? { rating: existingReview.rating, comment: existingReview.comment } : null}
              />
            </div>
          )}

          {/* Review List */}
          <ReviewList reviews={reviews ?? []} />
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/">
            <Button variant="outline" className="rounded-full px-6">
              ← 記事一覧に戻る
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
