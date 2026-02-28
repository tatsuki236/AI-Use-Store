import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleBody } from "./article-body";
import { PurchaseButton } from "./purchase-button";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";

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

  if (!article) return { title: "教材が見つかりません" };

  const description = article.content
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
  if (title.includes("AI") || title.includes("ChatGPT")) return "🤖";
  if (title.includes("Python") || title.includes("機械学習")) return "🐍";
  if (title.includes("Next") || title.includes("React")) return "⚛️";
  if (title.includes("デザイン") || title.includes("UI")) return "🎨";
  if (title.includes("Git")) return "🌿";
  if (title.includes("TypeScript") || title.includes("型")) return "📘";
  return "📝";
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
  const paywallMarker = "<!-- paywall -->";
  if (content.includes(paywallMarker)) {
    return content.split(paywallMarker)[0].trim();
  }
  // Fallback: first 3 paragraphs
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.slice(0, 3).join("\n\n");
}

function getFullContent(content: string): string {
  return content.replace(/<!--\s*paywall\s*-->/g, "");
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
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!article) notFound();

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
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {article.title}
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                A
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">AiUseStore</p>
                <time className="text-xs">
                  {new Date(article.created_at).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
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
              {/* Preview with fade-out */}
              <div className="px-6 sm:px-10 relative">
                <ArticleBody content={getPreviewContent(article.content)} />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Purchase Section */}
              <div className="px-6 sm:px-10 pb-10 pt-6">
                <div className="border border-border/60 rounded-xl p-6 text-center bg-muted/30">
                  {isPending ? (
                    <>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600 mb-3 text-sm px-4 py-1">
                        承認待ち
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        購入リクエストは管理者に送信されました。承認されると全文をお読みいただけます。
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold mb-1">
                        この教材を購入して全文を読む
                      </p>
                      <p className="text-3xl font-extrabold text-primary mb-4">
                        ¥{article.price?.toLocaleString()}
                      </p>
                      {user ? (
                        <div className="max-w-xs mx-auto">
                          <PurchaseButton articleId={article.id} />
                        </div>
                      ) : (
                        <div className="max-w-xs mx-auto space-y-2">
                          <Link href="/login" className="block">
                            <Button className="w-full">ログインして購入</Button>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            アカウントをお持ちでない方は
                            <Link href="/signup" className="text-primary hover:underline ml-1">
                              新規登録
                            </Link>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
              ← 教材一覧に戻る
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
