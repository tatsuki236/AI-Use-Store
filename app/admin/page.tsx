import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch all purchases with user, course, and article info
  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      id,
      status,
      created_at,
      user_id,
      course_id,
      article_id,
      profiles:user_id (email),
      courses:course_id (title, price),
      articles:article_id (title, price, author_id)
    `)
    .order("created_at", { ascending: false });

  // Fetch Stripe payment data
  const { data: stripePayments } = await supabase
    .from("stripe_payments")
    .select("id, amount, platform_fee, seller_amount, status, created_at, stripe_session_id, article_id")
    .order("created_at", { ascending: false });

  // Calculate stats from Stripe payments (completed)
  const completedStripePayments = stripePayments?.filter((p) => p.status === "completed") ?? [];
  const totalSales = completedStripePayments.reduce((sum, p) => sum + p.amount, 0);
  const platformRevenue = completedStripePayments.reduce((sum, p) => sum + p.platform_fee, 0);
  const sellerPayouts = completedStripePayments.reduce((sum, p) => sum + p.seller_amount, 0);
  const totalTransactions = completedStripePayments.length;

  // Monthly sales (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlySales = completedStripePayments
    .filter((p) => p.created_at >= monthStart)
    .reduce((sum, p) => sum + p.amount, 0);

  // Fallback: if no Stripe data, calculate from purchases as before
  const fallbackTotal = totalSales === 0
    ? (purchases?.filter((p) => p.status === "completed") ?? []).reduce((sum, p) => {
        const article = p.articles as unknown as { price: number } | null;
        const course = p.courses as unknown as { price: number } | null;
        return sum + (p.article_id ? (article?.price ?? 0) : (course?.price ?? 0));
      }, 0)
    : totalSales;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">売上レポート</h1>
        <p className="text-muted-foreground mt-1">
          Stripe決済データに基づくプラットフォーム全体の売上と収益
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">総売上</p>
          <p className="text-2xl font-bold">¥{(totalSales || fallbackTotal).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalTransactions || purchases?.filter(p => p.status === "completed").length || 0}件の取引</p>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">プラットフォーム収益 (20%)</p>
          <p className="text-2xl font-bold text-primary">¥{(platformRevenue || Math.floor(fallbackTotal * 0.20)).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">手数料 15% + 決済 5%</p>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">出品者への支払い</p>
          <p className="text-2xl font-bold text-emerald-600">¥{(sellerPayouts || fallbackTotal - Math.floor(fallbackTotal * 0.20)).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">売上の80%</p>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">今月の売上</p>
          <p className="text-2xl font-bold">¥{monthlySales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {now.getFullYear()}年{now.getMonth() + 1}月
          </p>
        </div>
      </div>

      {/* Stripe Payments Table */}
      {completedStripePayments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Stripe決済履歴</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>セッションID</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>手数料</TableHead>
                  <TableHead>出品者分</TableHead>
                  <TableHead>日時</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stripePayments ?? []).slice(0, 20).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">
                      {payment.stripe_session_id.slice(0, 20)}...
                    </TableCell>
                    <TableCell>¥{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>¥{payment.platform_fee.toLocaleString()}</TableCell>
                    <TableCell>¥{payment.seller_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      {payment.status === "completed" ? (
                        <Badge variant="default">完了</Badge>
                      ) : payment.status === "failed" ? (
                        <Badge variant="destructive">失敗</Badge>
                      ) : (
                        <Badge variant="outline">{payment.status}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Purchase History */}
      <h2 className="text-lg font-bold mb-4">購入履歴</h2>

      {!purchases || purchases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          購入データはまだありません
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>購入内容</TableHead>
                <TableHead>価格</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const profile = purchase.profiles as unknown as { email: string } | null;
                const course = purchase.courses as unknown as { title: string; price: number } | null;
                const article = purchase.articles as unknown as { title: string; price: number; author_id: string } | null;
                const isArticle = purchase.article_id != null;
                const itemTitle = isArticle ? article?.title : course?.title;
                const itemPrice = isArticle ? article?.price : course?.price;
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {profile?.email ?? "不明"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={isArticle ? "text-blue-600 border-blue-300" : "text-purple-600 border-purple-300"}>
                        {isArticle ? "教材" : "コース"}
                      </Badge>
                    </TableCell>
                    <TableCell>{itemTitle ?? "不明"}</TableCell>
                    <TableCell>¥{itemPrice?.toLocaleString() ?? 0}</TableCell>
                    <TableCell>
                      {new Date(purchase.created_at).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      {purchase.status === "completed" ? (
                        <Badge variant="default">完了</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          処理中
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
