"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PurchaseButton({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "購入に失敗しました";
      alert(message);
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" onClick={handlePurchase} disabled={loading}>
      {loading ? "決済ページへ移動中..." : "購入する"}
    </Button>
  );
}
