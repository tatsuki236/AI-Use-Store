"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBookmark } from "./actions";

export function BookmarkButton({
  articleId,
  initialBookmarked,
  isLoggedIn,
}: {
  articleId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { bookmarked: initialBookmarked },
    (state) => ({ bookmarked: !state.bookmarked })
  );

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      setOptimistic(optimistic);
      await toggleBookmark(articleId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 ${
        optimistic.bookmarked
          ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
          : "bg-card border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-amber-500"
      } disabled:opacity-50`}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${optimistic.bookmarked ? "scale-110" : ""}`}
        fill={optimistic.bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        />
      </svg>
      <span>{optimistic.bookmarked ? "保存済み" : "保存"}</span>
    </button>
  );
}
