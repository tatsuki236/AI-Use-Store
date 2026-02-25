import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserArticleForm } from "./user-article-form";

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
          <h1 className="text-xl sm:text-2xl font-bold">新規教材作成</h1>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-6">
          <UserArticleForm />
        </div>
      </main>
    </div>
  );
}
