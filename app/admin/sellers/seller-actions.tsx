"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveSeller, rejectSeller } from "./actions";

type Seller = {
  id: string;
  full_name: string;
  address: string;
  phone: string;
  date_of_birth: string;
  status: string;
  rejection_reason: string | null;
};

export function SellerActions({ seller }: { seller: Seller }) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (seller.status === "approved") {
    return (
      <span className="text-sm text-muted-foreground">承認済み</span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
        >
          詳細
        </Button>
        {seller.status === "pending" && (
          <>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    await approveSeller(seller.id);
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
      </div>

      {showDetails && (
        <div className="text-left text-xs space-y-1 bg-muted/50 p-3 rounded-lg">
          <p><span className="font-medium">住所:</span> {seller.address}</p>
          <p><span className="font-medium">電話:</span> {seller.phone}</p>
          <p><span className="font-medium">生年月日:</span> {seller.date_of_birth}</p>
          {seller.rejection_reason && (
            <p><span className="font-medium text-red-600">却下理由:</span> {seller.rejection_reason}</p>
          )}
        </div>
      )}

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
                  await rejectSeller(seller.id, reason);
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
