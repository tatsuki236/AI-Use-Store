import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", user.id)
    .single();

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("status")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">アカウント</h1>

        <div className="space-y-4">
          {/* Email */}
          <div className="bg-card border rounded-xl p-4 sm:p-5">
            <p className="text-xs text-muted-foreground mb-1">メールアドレス</p>
            <p className="text-sm font-medium">{profile?.email ?? user.email}</p>
          </div>

          {/* Seller status */}
          <div className="bg-card border rounded-xl p-4 sm:p-5">
            <p className="text-xs text-muted-foreground mb-1">出品者ステータス</p>
            <p className="text-sm font-medium">
              {seller?.status === "approved"
                ? "承認済み"
                : seller?.status === "pending"
                  ? "審査中"
                  : "未登録"}
            </p>
            {!seller && (
              <Link href="/seller/register" className="inline-block mt-2">
                <Button size="sm" variant="outline">
                  出品者登録
                </Button>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="pt-2">
            <form action="/auth/signout" method="post">
              <Button variant="ghost" className="text-muted-foreground">
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
