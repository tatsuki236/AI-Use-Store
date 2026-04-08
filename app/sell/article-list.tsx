"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { withdrawArticle, deleteArticle } from "./actions";

type Article = {
  id: string;
  title: string;
  status: string;
  price: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
};

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="outline">下書き</Badge>;
    case "pending_review":
      return (
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-600"
        >
          審査中
        </Badge>
      );
    case "published":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          公開中
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

export function ArticleList({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [withdrawTarget, setWithdrawTarget] = useState<Article | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleWithdraw() {
    if (!withdrawTarget) return;
    setIsWithdrawing(true);
    try {
      await withdrawArticle(withdrawTarget.id);
      setWithdrawTarget(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteArticle(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            {/* Title + badges */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{article.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {statusBadge(article.status)}
                {article.is_free ? (
                  <Badge variant="secondary" className="text-xs">無料</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    ¥{article.price.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(article.updated_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {article.status === "pending_review" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-yellow-700 border-yellow-400 hover:bg-yellow-50"
                  onClick={() => setWithdrawTarget(article)}
                >
                  審査取り下げ
                </Button>
              )}
              {article.status !== "pending_review" && (
                <>
                  <Link href={`/sell/${article.id}/edit`}>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      編集
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => setDeleteTarget(article)}
                  >
                    削除
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Withdraw confirmation dialog */}
      <Dialog
        open={!!withdrawTarget}
        onOpenChange={(v) => !v && setWithdrawTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>審査を取り下げますか？</DialogTitle>
            <DialogDescription>
              「{withdrawTarget?.title}」の審査提出を取り下げ、下書きに戻します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawTarget(null)}
              disabled={isWithdrawing}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "処理中..." : "取り下げる"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記事を削除しますか？</DialogTitle>
            <DialogDescription>
              「{deleteTarget?.title}」を完全に削除します。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
