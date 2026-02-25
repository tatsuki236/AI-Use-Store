"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approvePurchase } from "./actions";

export function ApproveButton({
  purchaseId,
  userId,
}: {
  purchaseId: string;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      await approvePurchase(purchaseId, userId);
    } catch {
      alert("承認に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleApprove} disabled={loading}>
      {loading ? "処理中..." : "承認する"}
    </Button>
  );
}
