"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview, deleteReview } from "./actions";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  articleId: string;
  existingReview?: {
    rating: number;
    comment: string | null;
  } | null;
}

export function ReviewForm({ articleId, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isEditing = !!existingReview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("星をクリックして評価を選択してください");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await submitReview(articleId, rating, comment);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "レビューの投稿に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("レビューを削除しますか？")) return;
    setLoading(true);
    try {
      await deleteReview(articleId);
      setRating(0);
      setComment("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "レビューの削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const displayRating = hoveredStar || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {isEditing ? "評価を変更" : "評価"}
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-0.5 transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
            >
              <svg
                className={`w-7 h-7 transition-colors ${
                  star <= displayRating
                    ? "text-amber-400"
                    : "text-gray-200 dark:text-gray-600"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {displayRating}.0
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          コメント（任意）
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="この記事の感想を書いてください..."
          rows={3}
          maxLength={1000}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "送信中..." : isEditing ? "レビューを更新" : "レビューを投稿"}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive"
          >
            削除
          </Button>
        )}
      </div>
    </form>
  );
}
