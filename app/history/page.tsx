import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: views } = await supabase
    .from("article_views")
    .select(
      "id, viewed_at, article_id, articles(title, slug)"
    )
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">閲覧履歴</h1>

        {!views || views.length === 0 ? (
          <div className="bg-card border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              閲覧履歴はまだありません
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
            {views.map((view) => {
              const articleData = view.articles as unknown as { title: string; slug?: string } | null;
              const title = articleData?.title;
              const href = `/articles/${articleData?.slug || view.article_id}`;

              return (
                <Link
                  key={view.id}
                  href={href}
                  className="block bg-card border rounded-xl p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {title ?? "不明な記事"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(view.viewed_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
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
