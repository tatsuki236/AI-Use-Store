import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetadataForm } from "./metadata-form";
import { updateArticleMetadata } from "./actions";
import { WithdrawButton } from "../withdraw-button";

export default async function MetadataEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, price, is_free, thumbnail_url, status, author_id")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (!article) notFound();

  if (article.status !== "published") {
    redirect("/sell");
  }

  const action = updateArticleMetadata.bind(null, article.id);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <div className="mb-6">
          <Link
            href="/sell"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 出品ダッシュボード
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">記事設定</h1>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            公開中
          </Badge>
        </div>

        <div className="bg-card border rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-base font-bold mb-4">メタ情報を編集</h2>
          <p className="text-sm text-muted-foreground mb-4">
            タイトル・価格・サムネイルを変更できます。本文の変更はできません。
          </p>
          <MetadataForm article={article} formAction={action} />
        </div>

        {/* Withdraw section */}
        <div className="bg-card border border-red-200 rounded-xl p-4 sm:p-6">
          <h2 className="text-base font-bold mb-2 text-red-600">記事の取り下げ</h2>
          <p className="text-sm text-muted-foreground mb-4">
            記事を取り下げると下書き状態に戻ります。再編集後、再度審査に提出できます。
          </p>
          <WithdrawButton articleId={article.id} />
        </div>
      </main>
    </div>
  );
}
