"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveArticle, rejectArticle } from "../actions";

export function ReviewActions({
  articleId,
  status,
}: {
  articleId: string;
  status: string;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (status !== "pending_review") {
    return (
      <p className="text-muted-foreground text-sm">
        この記事は審査対象ではありません（ステータス: {status}）
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await approveArticle(articleId);
                router.push("/admin/review");
              } catch (e) {
                setError(e instanceof Error ? e.message : "承認に失敗しました");
              }
            });
          }}
        >
          {isPending ? "処理中..." : "承認して公開する"}
        </Button>
        <Button
          variant="destructive"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => setShowReject(!showReject)}
        >
          却下する
        </Button>
      </div>

      {showReject && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="却下理由を入力..."
            className="flex-1"
          />
          <Button
            variant="destructive"
            disabled={!reason.trim() || isPending}
            className="w-full sm:w-auto"
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await rejectArticle(articleId, reason);
                  router.push("/admin/review");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "却下に失敗しました");
                }
              });
            }}
          >
            {isPending ? "処理中..." : "却下を確定"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
