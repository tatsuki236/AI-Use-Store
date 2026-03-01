import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WithdrawalForm } from "./withdrawal-form";

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          審査中
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
          承認済み
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          振込完了
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

export default async function WithdrawPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!seller || seller.status !== "approved") {
    redirect("/seller/register");
  }

  // Calculate gross sales from completed purchases of seller's articles
  const { data: myArticles } = await supabase
    .from("articles")
    .select("id, price")
    .eq("author_id", user.id);

  let grossSales = 0;
  if (myArticles && myArticles.length > 0) {
    const articleIds = myArticles.map((a) => a.id);
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

  const netBalance = Math.floor(grossSales * 0.80);

  // Fetch withdrawals
  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const completedWithdrawals = (withdrawals ?? [])
    .filter((w) => w.status === "completed")
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingWithdrawals = (withdrawals ?? [])
    .filter((w) => w.status === "pending" || w.status === "approved")
    .reduce((sum, w) => sum + w.amount, 0);

  const availableBalance = Math.max(0, netBalance - completedWithdrawals - pendingWithdrawals);

  const hasPending = withdrawals?.some((w) => w.status === "pending");

  const hasVerifiedBank = !!seller.bank_verified_at;
  const addressChanged = hasVerifiedBank && seller.verified_address !== seller.address;
  const requiresVerification = !hasVerifiedBank || addressChanged;

  const existingBank =
    seller.bank_name
      ? {
          bank_name: seller.bank_name,
          branch_name: seller.branch_name,
          account_number: seller.account_number,
          account_holder_name: seller.account_holder_name,
        }
      : null;

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
          <h1 className="text-xl sm:text-2xl font-bold">出金申請</h1>
        </div>

        {/* Available Balance Card */}
        <div className="bg-card border rounded-xl p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">総売上</p>
              <p className="text-lg font-bold">¥{grossSales.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">手数料 (20%)</p>
              <p className="text-lg font-bold text-muted-foreground">
                -¥{Math.floor(grossSales * 0.20).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">差引後 (80%)</p>
              <p className="text-lg font-bold">¥{netBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="border-t mt-3 pt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">出金可能残高</p>
              <p className="text-2xl font-bold text-emerald-600">
                ¥{availableBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-0.5">
              {completedWithdrawals > 0 && (
                <p>出金済み: ¥{completedWithdrawals.toLocaleString()}</p>
              )}
              {pendingWithdrawals > 0 && (
                <p>申請中: ¥{pendingWithdrawals.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* New withdrawal form */}
        {hasPending ? (
          <div className="bg-card border rounded-xl p-6 sm:p-8 text-center mb-8">
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-600 text-sm px-4 py-1 mb-3"
            >
              審査中
            </Badge>
            <p className="text-sm text-muted-foreground">
              現在審査中の出金申請があります。完了後に新しい申請が可能です。
            </p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-4 sm:p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">新規出金申請</h2>
            {availableBalance > 0 ? (
              <WithdrawalForm
                requiresVerification={requiresVerification}
                existingBank={existingBank}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                出金可能な残高がありません
              </p>
            )}
          </div>
        )}

        {/* Past withdrawals */}
        {withdrawals && withdrawals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">申請履歴</h2>
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-bold text-lg">
                      ¥{w.amount.toLocaleString()}
                    </span>
                    {statusBadge(w.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{w.bank_name} {w.branch_name}</span>
                    <span className="mx-2">|</span>
                    <span>
                      {new Date(w.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
