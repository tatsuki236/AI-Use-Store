import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "./review-actions";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*, profiles:author_id(email)")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/review">
          <Button variant="ghost" size="sm">
            ← 一覧へ
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">教材審査</h1>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Article Info */}
        <div className="bg-card border rounded-xl p-4 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold">{article.title}</h2>
            {article.is_free ? (
              <Badge variant="secondary">無料</Badge>
            ) : (
              <Badge variant="outline" className="font-bold">
                ¥{article.price?.toLocaleString()}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              出品者: {((article as Record<string, unknown>).profiles as { email: string } | null)?.email ?? "-"}
            </p>
            <p>
              提出日:{" "}
              {new Date(article.created_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Article Content Preview */}
        <div className="bg-card border rounded-xl p-4 sm:p-6">
          <h3 className="font-bold mb-3">内容プレビュー</h3>
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg whitespace-pre-wrap font-mono text-xs sm:text-sm max-h-[400px] sm:max-h-[500px] overflow-y-auto break-words">
            {article.content}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card border rounded-xl p-4 sm:p-6">
          <h3 className="font-bold mb-3">審査アクション</h3>
          <ReviewActions articleId={article.id} status={article.status} />
        </div>
      </div>
    </div>
  );
}
