import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const isApprovedSeller = seller?.status === "approved";

  // Seller sales data
  let grossSales = 0;
  let completedWithdrawals = 0;
  let pendingWithdrawals = 0;

  if (isApprovedSeller) {
    // Fetch seller's articles
    const { data: myArticles } = await supabase
      .from("articles")
      .select("id, price")
      .eq("user_id", user.id);

    if (myArticles && myArticles.length > 0) {
      const articleIds = myArticles.map((a) => a.id);

      // Fetch completed purchases for seller's articles
      const { data: purchases } = await supabase
        .from("purchases")
        .select("article_id")
        .in("article_id", articleIds)
        .eq("status", "completed");

      if (purchases) {
        const priceMap = new Map(myArticles.map((a) => [a.id, a.price ?? 0]));
        grossSales = purchases.reduce(
          (sum, p) => sum + (priceMap.get(p.article_id) ?? 0),
          0
        );
      }
    }

    // Fetch withdrawals
    const { data: withdrawals } = await supabase
      .from("withdrawal_requests")
      .select("amount, status")
      .eq("user_id", user.id);

    if (withdrawals) {
      completedWithdrawals = withdrawals
        .filter((w) => w.status === "completed")
        .reduce((sum, w) => sum + w.amount, 0);
      pendingWithdrawals = withdrawals
        .filter((w) => w.status === "pending" || w.status === "approved")
        .reduce((sum, w) => sum + w.amount, 0);
    }
  }

  const platformFee = Math.floor(grossSales * 0.15);
  const processingFee = Math.floor(grossSales * 0.05);
  const totalFees = platformFee + processingFee;
  const netBalance = grossSales - totalFees;
  const availableBalance = netBalance - completedWithdrawals - pendingWithdrawals;

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

          {/* Seller Dashboard — only for approved sellers */}
          {isApprovedSeller && (
            <div className="bg-card border rounded-xl p-4 sm:p-6">
              <h2 className="text-base font-bold mb-4">売上ダッシュボード</h2>

              {/* Sales summary cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">総売上（税込）</p>
                  <p className="text-xl font-bold">¥{grossSales.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">受取可能額</p>
                  <p className="text-xl font-bold text-emerald-600">
                    ¥{Math.max(0, availableBalance).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Fee breakdown */}
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">プラットフォーム手数料 (15%)</span>
                  <span>-¥{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">決済手数料 (5%)</span>
                  <span>-¥{processingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>手数料合計 (20%)</span>
                  <span>-¥{totalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>差引後 (80%)</span>
                  <span>¥{netBalance.toLocaleString()}</span>
                </div>
              </div>

              {/* Payout status */}
              <div className="space-y-2 text-sm border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">出金済み</span>
                  <span>¥{completedWithdrawals.toLocaleString()}</span>
                </div>
                {pendingWithdrawals > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      出金申請中
                      <Badge variant="outline" className="ml-1.5 text-yellow-600 border-yellow-600 text-[10px] px-1.5 py-0">
                        処理中
                      </Badge>
                    </span>
                    <span>¥{pendingWithdrawals.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Link href="/sell/withdraw">
                  <Button size="sm">出金申請</Button>
                </Link>
                <Link href="/sell">
                  <Button size="sm" variant="outline">教材管理</Button>
                </Link>
              </div>
            </div>
          )}

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
