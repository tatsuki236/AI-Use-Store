import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function PurchasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      "id, status, created_at, article_id, articles(title)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">購入履歴</h1>

        {!purchases || purchases.length === 0 ? (
          <div className="bg-card border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              購入履歴はまだありません
            </p>
            <Link
              href="/search"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              記事を探す
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => {
              const articleData = purchase.articles as unknown as { title: string } | null;
              const title = articleData?.title;
              const href = `/articles/${purchase.article_id}`;

              return (
                <Link
                  key={purchase.id}
                  href={href}
                  className="block bg-card border rounded-xl p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {title ?? "不明なコンテンツ"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(purchase.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        purchase.status === "completed"
                          ? "text-emerald-600 border-emerald-300 shrink-0"
                          : "shrink-0"
                      }
                    >
                      {purchase.status === "completed" ? "完了" : "処理中"}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
