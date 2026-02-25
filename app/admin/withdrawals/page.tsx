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
import { WithdrawalActions } from "./withdrawal-actions";

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

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient();

  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles:user_id(email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">出金管理</h1>
        <p className="text-muted-foreground text-sm mt-1">
          出金申請の審査・振込処理を行います
        </p>
      </div>

      {!withdrawals || withdrawals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          出金申請はまだありません
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申請者</TableHead>
                <TableHead>金額</TableHead>
                <TableHead className="hidden sm:table-cell">口座</TableHead>
                <TableHead className="hidden md:table-cell">身分証</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="hidden sm:table-cell">申請日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <div className="text-sm">
                      {((w as Record<string, unknown>).profiles as { email: string } | null)?.email ?? "-"}
                    </div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {w.bank_name} {w.branch_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    ¥{w.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <div>{w.bank_name} {w.branch_name}</div>
                    <div className="text-muted-foreground">
                      {w.account_number} / {w.account_holder_name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {w.id_document_url ? "提出済み" : "-"}
                  </TableCell>
                  <TableCell>{statusBadge(w.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell whitespace-nowrap">
                    {new Date(w.created_at).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <WithdrawalActions
                      withdrawalId={w.id}
                      status={w.status}
                    />
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
