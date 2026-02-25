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

  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
            <WithdrawalForm
              requiresVerification={requiresVerification}
              existingBank={existingBank}
            />
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
