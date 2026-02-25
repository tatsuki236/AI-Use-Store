"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function PurchaseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handlePurchase() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("purchases").insert({
        user_id: user.id,
        course_id: courseId,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          alert("既にこのコースを購入済みです");
        } else {
          alert("購入に失敗しました: " + error.message);
        }
      } else {
        router.refresh();
      }
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
