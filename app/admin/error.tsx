"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
      <p className="text-sm text-muted-foreground mb-1">
        {error.message}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-4">
          Digest: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
      >
        再試行
      </button>
    </div>
  );
}
