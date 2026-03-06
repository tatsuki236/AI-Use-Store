"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function MetadataForm({
  article,
  formAction,
}: {
  article: {
    id: string;
    title: string;
    price: number;
    is_free: boolean;
    thumbnail_url: string | null;
  };
  formAction: (formData: FormData) => void;
}) {
  const [isFree, setIsFree] = useState(article.is_free);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    article.thumbnail_url ?? ""
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleThumbnailUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "アップロードに失敗しました");
        return;
      }

      setThumbnailUrl(data.url);
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">タイトル</label>
        <input
          name="title"
          type="text"
          defaultValue={article.title}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Free toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_free"
          id="is_free"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          className="rounded border-border"
        />
        <label htmlFor="is_free" className="text-sm">
          無料で公開
        </label>
      </div>

      {/* Price */}
      {!isFree && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            価格（円）
          </label>
          <input
            name="price"
            type="number"
            min={100}
            step={100}
            defaultValue={article.price}
            required={!isFree}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      )}

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          サムネイル画像
        </label>
        {thumbnailUrl && (
          <div className="mb-2">
            <img
              src={thumbnailUrl}
              alt="サムネイル"
              className="w-32 h-20 object-cover rounded-lg border"
            />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleThumbnailUpload}
          className="text-sm"
        />
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
        {uploading && (
          <p className="text-xs text-muted-foreground mt-1">
            アップロード中...
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={uploading}>
          保存
        </Button>
      </div>
    </form>
  );
}
