"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="教材を検索..."
        className="w-full h-10 pl-4 pr-12 rounded-lg bg-white border-2 border-primary/40 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-10 w-11 flex items-center justify-center bg-primary/90 hover:bg-primary rounded-r-lg transition-colors"
      >
        <svg
          className="w-5 h-5 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
}
