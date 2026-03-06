"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "./actions";

export function LikeButton({
  articleId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  articleId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      setOptimistic(optimistic);
      await toggleLike(articleId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 ${
        optimistic.liked
          ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
          : "bg-card border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-rose-500"
      } disabled:opacity-50`}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${optimistic.liked ? "scale-110" : ""}`}
        fill={optimistic.liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>{optimistic.count}</span>
    </button>
  );
}
