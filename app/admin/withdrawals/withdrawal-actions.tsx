"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveWithdrawal, completeWithdrawal, rejectWithdrawal } from "./actions";

export function WithdrawalActions({
  withdrawalId,
  status,
}: {
  withdrawalId: string;
  status: string;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "completed") {
    return <span className="text-sm text-muted-foreground">振込完了</span>;
  }

  if (status === "rejected") {
    return <span className="text-sm text-red-500">却下済み</span>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 justify-end">
        {status === "pending" && (
          <>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    await approveWithdrawal(withdrawalId);
                    window.location.reload();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "承認に失敗しました");
                  }
                });
              }}
            >
              {isPending ? "処理中..." : "承認"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => setShowReject(!showReject)}
            >
              却下
            </Button>
          </>
        )}
        {status === "approved" && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await completeWithdrawal(withdrawalId);
                  window.location.reload();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "処理に失敗しました");
                }
              });
            }}
          >
            {isPending ? "処理中..." : "振込完了"}
          </Button>
        )}
      </div>

      {showReject && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="却下理由を入力..."
            className="text-sm flex-1"
          />
          <Button
            size="sm"
            variant="destructive"
            disabled={!reason.trim() || isPending}
            className="w-full sm:w-auto"
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await rejectWithdrawal(withdrawalId, reason);
                  setShowReject(false);
                  setReason("");
                  window.location.reload();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "却下に失敗しました");
                }
              });
            }}
          >
            {isPending ? "処理中..." : "送信"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
