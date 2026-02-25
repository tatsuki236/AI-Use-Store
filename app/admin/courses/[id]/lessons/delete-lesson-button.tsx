"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteLesson } from "../../actions";

export function DeleteLessonButton({
  lessonId,
  courseId,
  lessonTitle,
}: {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${lessonTitle}」を削除しますか？`)) return;
    setLoading(true);
    try {
      await deleteLesson(lessonId, courseId);
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
