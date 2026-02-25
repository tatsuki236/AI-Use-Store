import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditUserArticleForm } from "./edit-user-article-form";

export default async function SellEditPage({
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
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (!article) notFound();

  if (article.status !== "draft" && article.status !== "rejected") {
    redirect("/sell");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/sell">
            <Button variant="ghost" size="sm">
              ← 戻る
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">教材を編集</h1>
        </div>

        {article.status === "rejected" && article.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 mb-2">
              却下
            </Badge>
            <p className="text-sm text-red-600">
              却下理由: {article.rejection_reason}
            </p>
          </div>
        )}

        <div className="bg-card border rounded-xl p-4 sm:p-6">
          <EditUserArticleForm article={article} />
        </div>
      </main>
    </div>
  );
}
