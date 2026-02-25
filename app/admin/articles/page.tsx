import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DeleteArticleButton } from "./delete-article-button";

export default async function AdminArticlesPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">教材管理</h1>
          <p className="text-muted-foreground mt-1">
            教材の作成・編集・削除を行います
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button>新規教材作成</Button>
        </Link>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          教材がまだありません
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>価格</TableHead>
                <TableHead>公開</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    {article.is_free ? (
                      <Badge variant="secondary">無料</Badge>
                    ) : (
                      `¥${article.price.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell>
                    {article.published ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">公開</Badge>
                    ) : (
                      <Badge variant="outline">下書き</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(article.created_at).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/articles/${article.id}`}>
                      <Button size="sm" variant="outline">編集</Button>
                    </Link>
                    <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
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
