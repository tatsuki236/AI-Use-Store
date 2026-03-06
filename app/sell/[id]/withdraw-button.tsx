"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { withdrawArticle } from "./metadata/actions";

export function WithdrawButton({ articleId }: { articleId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleWithdraw() {
    setError(null);
    startTransition(async () => {
      try {
        await withdrawArticle(articleId);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "取り下げに失敗しました"
        );
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => setConfirming(true)}
      >
        取り下げ
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-red-600">
        本当にこの記事を取り下げますか？下書きに戻ります。
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleWithdraw}
          disabled={isPending}
        >
          {isPending ? "処理中..." : "取り下げを確定"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
