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
      articles:article_id (title, price)
    `)
    .order("created_at", { ascending: false });

  const pendingCount = purchases?.filter((p) => p.status === "pending").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">購入管理</h1>
          <p className="text-muted-foreground mt-1">
            ユーザーの購入リクエストを承認・管理します
          </p>
        </div>
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
                const article = purchase.articles as unknown as { title: string; price: number } | null;
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
