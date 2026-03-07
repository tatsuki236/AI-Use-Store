import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleEditor } from "@/components/article-editor";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createUserArticle } from "./actions";

export default async function SellNewPage() {
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

  if (!profile?.display_name?.trim()) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <main className="container mx-auto max-w-md px-4 py-12">
          <div className="bg-card border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2">ニックネームを設定してください</h2>
            <p className="text-sm text-muted-foreground mb-4">
              記事を投稿するにはニックネームの設定が必要です。
            </p>
            <Link href="/account">
              <Button>アカウント設定へ</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <ArticleEditor formAction={createUserArticle} />;
}
