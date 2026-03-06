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
import { SellerActions } from "./seller-actions";

function statusBadge(status: string) {
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

export default async function AdminSellersPage() {
  const supabase = await createClient();

  const { data: sellers } = await supabase
    .from("seller_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch emails separately
  const userIds = sellers?.map((s) => s.user_id).filter(Boolean) ?? [];
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)
    : { data: [] as { id: string; email: string }[] };

  const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">出品者管理</h1>
        <p className="text-muted-foreground text-sm mt-1">
          出品者の審査・承認を行います
        </p>
      </div>

      {!sellers || sellers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          出品者の申請はまだありません
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead className="hidden sm:table-cell">メール</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="hidden sm:table-cell">申請日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div className="font-medium">{seller.full_name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {emailMap.get(seller.user_id) ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {emailMap.get(seller.user_id) ?? "-"}
                  </TableCell>
                  <TableCell>{statusBadge(seller.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(seller.created_at).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <SellerActions seller={seller} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
