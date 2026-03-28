import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "seller" ? "seller" : "account";

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // 全プロフィールを取得
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // auth.usersからメール確認状態・プロバイダー情報を取得
  const { data: authData } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });
  const authUsers = authData?.users ?? [];

  const authMap = new Map(
    authUsers.map((u) => [
      u.id,
      {
        emailConfirmedAt: u.email_confirmed_at,
        provider: u.app_metadata?.provider ?? "email",
        lastSignInAt: u.last_sign_in_at,
      },
    ])
  );

  // 出品者プロフィールを取得
  const { data: sellerProfiles } = await supabase
    .from("seller_profiles")
    .select("user_id, status, full_name, created_at");

  const sellerMap = new Map(
    sellerProfiles?.map((s) => [s.user_id, s]) ?? []
  );

  const totalCount = profiles?.length ?? 0;
  const confirmedCount = authUsers.filter((u) => u.email_confirmed_at).length;
  const googleCount = authUsers.filter(
    (u) => u.app_metadata?.provider === "google"
  ).length;
  const emailCount = totalCount - googleCount;

  const sellerTotal = sellerProfiles?.length ?? 0;
  const sellerPending =
    sellerProfiles?.filter((s) => s.status === "pending").length ?? 0;
  const sellerApproved =
    sellerProfiles?.filter((s) => s.status === "approved").length ?? 0;
  const sellerRejected =
    sellerProfiles?.filter((s) => s.status === "rejected").length ?? 0;

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">ユーザー管理</h1>
        <p className="text-muted-foreground text-sm mt-1">
          全 {totalCount} ユーザー
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <Link href="/admin/users?tab=account" className={tabClass("account")}>
          アカウント認証
        </Link>
        <Link href="/admin/users?tab=seller" className={tabClass("seller")}>
          出品者認証
        </Link>
      </div>

      {tab === "account" ? (
        <>
          {/* Account auth summary */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className="px-3 py-1">
              全体: {totalCount}人
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 text-emerald-600 border-emerald-600"
            >
              メール確認済み: {confirmedCount}人
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 text-blue-600 border-blue-600"
            >
              Google: {googleCount}人
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-muted-foreground">
              メール+PW: {emailCount}人
            </Badge>
          </div>

          {/* Account auth table */}
          {!profiles || profiles.length === 0 ? (
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
                    <TableHead>登録方法</TableHead>
                    <TableHead>メール確認</TableHead>
                    <TableHead className="hidden sm:table-cell">ロール</TableHead>
                    <TableHead className="hidden sm:table-cell">登録日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((user) => {
                    const auth = authMap.get(user.id);
                    const isGoogle = auth?.provider === "google";
                    const isConfirmed = !!auth?.emailConfirmedAt;
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
                          {isGoogle ? (
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-600"
                            >
                              Google
                            </Badge>
                          ) : (
                            <Badge variant="outline">メール+PW</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isConfirmed ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                              確認済み
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-yellow-600 border-yellow-600"
                            >
                              未確認
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {user.role === "admin" ? (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                              管理者
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              ユーザー
                            </span>
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
        </>
      ) : (
        <>
          {/* Seller auth summary */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className="px-3 py-1">
              申請数: {sellerTotal}人
            </Badge>
            {sellerPending > 0 && (
              <Badge
                variant="outline"
                className="px-3 py-1 text-yellow-600 border-yellow-600"
              >
                審査待ち: {sellerPending}人
              </Badge>
            )}
            <Badge
              variant="outline"
              className="px-3 py-1 text-emerald-600 border-emerald-600"
            >
              承認済み: {sellerApproved}人
            </Badge>
            {sellerRejected > 0 && (
              <Badge
                variant="outline"
                className="px-3 py-1 text-red-600 border-red-600"
              >
                却下: {sellerRejected}人
              </Badge>
            )}
            <Badge variant="outline" className="px-3 py-1 text-muted-foreground">
              未申請: {totalCount - sellerTotal}人
            </Badge>
          </div>

          {/* Seller auth table */}
          {!profiles || profiles.length === 0 ? (
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
                    <TableHead>出品者状態</TableHead>
                    <TableHead className="hidden sm:table-cell">出品者名</TableHead>
                    <TableHead className="hidden sm:table-cell">申請日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((user) => {
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
                          {seller ? (
                            sellerStatusBadge(seller.status)
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              未申請
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {seller?.full_name || "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {seller
                            ? new Date(seller.created_at).toLocaleDateString(
                                "ja-JP"
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function sellerStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-600"
        >
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
