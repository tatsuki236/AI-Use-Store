"use client";

import { useState } from "react";
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
          onClick={async () => {
            await approveArticle(articleId);
          }}
        >
          承認して公開する
        </Button>
        <Button
          variant="destructive"
          className="w-full sm:w-auto"
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
            disabled={!reason.trim()}
            className="w-full sm:w-auto"
            onClick={async () => {
              await rejectArticle(articleId, reason);
            }}
          >
            却下を確定
          </Button>
        </div>
      )}
    </div>
  );
}
