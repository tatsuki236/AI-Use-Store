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

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // 全ユーザーを取得
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // 出品者プロフィールを取得してマップ化
  const { data: sellerProfiles } = await supabase
    .from("seller_profiles")
    .select("user_id, status, full_name");

  const sellerMap = new Map(
    sellerProfiles?.map((s) => [s.user_id, s]) ?? []
  );

  const totalCount = users?.length ?? 0;
  const sellerCount = sellerProfiles?.length ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">ユーザー管理</h1>
        <p className="text-muted-foreground text-sm mt-1">
          登録ユーザーの一覧です
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <Badge variant="outline" className="text-base px-3 py-1">
            全ユーザー: {totalCount}人
          </Badge>
          <Badge variant="outline" className="text-base px-3 py-1 text-emerald-600 border-emerald-600">
            出品者申請済み: {sellerCount}人
          </Badge>
          <Badge variant="outline" className="text-base px-3 py-1 text-muted-foreground">
            未申請: {totalCount - sellerCount}人
          </Badge>
        </div>
      </div>

      {!users || users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          登録ユーザーはいません
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メール</TableHead>
                <TableHead className="hidden sm:table-cell">表示名</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>出品者状態</TableHead>
                <TableHead className="hidden sm:table-cell">登録日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const seller = sellerMap.get(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{user.email}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {user.display_name || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {user.display_name || "-"}
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                          管理者
                        </Badge>
                      ) : (
                        <Badge variant="outline">ユーザー</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {seller ? (
                        sellerStatusBadge(seller.status)
                      ) : (
                        <span className="text-xs text-muted-foreground">未申請</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("ja-JP")}
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

function sellerStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          審査待ち
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          承認済み
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
