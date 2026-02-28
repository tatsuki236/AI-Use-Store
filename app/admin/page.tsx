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
import { ApproveButton } from "./approve-button";

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
      articles:article_id (title, price, user_id)
    `)
    .order("created_at", { ascending: false });

  const pendingCount = purchases?.filter((p) => p.status === "pending").length ?? 0;

  // Calculate sales stats from completed purchases
  const completedPurchases = purchases?.filter((p) => p.status === "completed") ?? [];
  const totalSales = completedPurchases.reduce((sum, p) => {
    const article = p.articles as unknown as { title: string; price: number; user_id: string } | null;
    const course = p.courses as unknown as { title: string; price: number } | null;
    const price = p.article_id ? (article?.price ?? 0) : (course?.price ?? 0);
    return sum + price;
  }, 0);

  const platformRevenue = Math.floor(totalSales * 0.20);
  const sellerPayouts = totalSales - platformRevenue;
  const totalTransactions = completedPurchases.length;

  // Monthly sales (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlySales = completedPurchases
    .filter((p) => p.created_at >= monthStart)
    .reduce((sum, p) => {
      const article = p.articles as unknown as { price: number } | null;
      const course = p.courses as unknown as { price: number } | null;
      const price = p.article_id ? (article?.price ?? 0) : (course?.price ?? 0);
      return sum + price;
    }, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">売上レポート</h1>
        <p className="text-muted-foreground mt-1">
          プラットフォーム全体の売上と収益を確認
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">総売上</p>
          <p className="text-2xl font-bold">¥{totalSales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalTransactions}件の取引</p>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">プラットフォーム収益 (20%)</p>
          <p className="text-2xl font-bold text-primary">¥{platformRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">手数料 15% + 決済 5%</p>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-1">出品者への支払い</p>
          <p className="text-2xl font-bold text-emerald-600">¥{sellerPayouts.toLocaleString()}</p>
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

      {/* Purchase Management */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">購入管理</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            未承認: {pendingCount}件
          </Badge>
        )}
      </div>

      {!purchases || purchases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          購入リクエストはまだありません
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
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const profile = purchase.profiles as unknown as { email: string } | null;
                const course = purchase.courses as unknown as { title: string; price: number } | null;
                const article = purchase.articles as unknown as { title: string; price: number; user_id: string } | null;
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
                      {purchase.status === "pending" ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          未承認
                        </Badge>
                      ) : (
                        <Badge variant="default">承認済み</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {purchase.status === "pending" && (
                        <ApproveButton
                          purchaseId={purchase.id}
                          userId={purchase.user_id}
                        />
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
