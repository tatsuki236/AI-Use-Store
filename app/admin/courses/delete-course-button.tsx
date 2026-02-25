"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteCourse } from "./actions";

export function DeleteCourseButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${courseTitle}」を削除しますか？この操作は取り消せません。`)) return;
    setLoading(true);
    try {
      await deleteCourse(courseId);
    } catch {
      alert("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
      {loading ? "削除中..." : "削除"}
    </Button>
  );
}
