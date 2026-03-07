import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="outline">下書き</Badge>;
    case "pending_review":
      return (
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-600"
        >
          審査中
        </Badge>
      );
    case "published":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          公開中
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          却下
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function SellDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (!seller || seller.status !== "approved") {
    redirect("/seller/register");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const hasDisplayName = !!profile?.display_name?.trim();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, status, price, is_free, created_at, updated_at")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">出品ダッシュボード</h1>
            <p className="text-muted-foreground text-sm mt-1">
              あなたの記事を管理できます
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/sell/withdraw">
              <Button variant="outline" size="sm" className="sm:size-default">
                出金申請
              </Button>
            </Link>
            <Link href="/sell/new">
              <Button size="sm" className="sm:size-default">新規記事作成</Button>
            </Link>
          </div>
        </div>

        {!hasDisplayName && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">ニックネームが未設定です</p>
              <p className="text-xs text-amber-700 mt-0.5">記事を投稿するにはニックネームの設定が必要です。</p>
            </div>
            <Link href="/account">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0">
                設定する
              </Button>
            </Link>
          </div>
        )}

        {!articles || articles.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 sm:p-12 text-center">
            <p className="text-muted-foreground mb-4">
              まだ記事がありません
            </p>
            <Link href="/sell/new">
              <Button>最初の記事を作成する</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                {/* Title + badges */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {statusBadge(article.status)}
                    {article.is_free ? (
                      <Badge variant="secondary" className="text-xs">無料</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        ¥{article.price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.updated_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {(article.status === "draft" ||
                    article.status === "rejected") && (
                    <Link href={`/sell/${article.id}/edit`}>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        編集
                      </Button>
                    </Link>
                  )}
                  {article.status === "published" && (
                    <>
                      <Link href={`/sell/${article.id}/metadata`}>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          設定変更
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
