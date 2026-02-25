"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { purchaseArticle } from "./actions";
import { useRouter } from "next/navigation";

export function PurchaseButton({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePurchase() {
    setLoading(true);
    try {
      await purchaseArticle(articleId);
      router.refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "購入に失敗しました";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" onClick={handlePurchase} disabled={loading}>
      {loading ? "処理中..." : "購入する"}
    </Button>
  );
}
