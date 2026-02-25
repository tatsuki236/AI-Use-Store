import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminReviewPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, price, is_free, status, created_at, author_id, profiles:author_id(email)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">教材審査</h1>
        <p className="text-muted-foreground text-sm mt-1">
          ユーザーが提出した教材の審査を行います
        </p>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          審査待ちの教材はありません
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead className="hidden sm:table-cell">出品者</TableHead>
                <TableHead>価格</TableHead>
                <TableHead className="hidden sm:table-cell">提出日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {((article as Record<string, unknown>).profiles as { email: string } | null)?.email ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {((article as Record<string, unknown>).profiles as { email: string } | null)?.email ?? "-"}
                  </TableCell>
                  <TableCell>
                    {article.is_free ? (
                      <Badge variant="secondary">無料</Badge>
                    ) : (
                      `¥${article.price.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(article.created_at).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/review/${article.id}`}>
                      <Button size="sm">審査</Button>
                    </Link>
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
