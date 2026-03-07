"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createArticle, updateArticle } from "./actions";

type Article = {
  id: string;
  title: string;
  content: string;
  price: number;
  rating: number;
  is_free: boolean;
  published: boolean;
  thumbnail_url: string | null;
  slug?: string | null;
};

export function ArticleForm({ article }: { article?: Article }) {
  const action = article
    ? updateArticle.bind(null, article.id)
    : createArticle;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(article?.thumbnail_url ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setThumbnailUrl(data.url);
      } else {
        alert(data.error || "アップロードに失敗しました");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={article?.title}
          placeholder="例: AI入門ガイド"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">カスタムURL（スラッグ）</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={article?.slug ?? ""}
          placeholder="例: chatgpt-beginner-guide"
          pattern="[a-z0-9-]*"
        />
        <p className="text-xs text-muted-foreground">
          半角英数字とハイフンのみ。未設定の場合はIDがURLになります。
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">内容 (Markdown)</Label>
        <Textarea
          id="content"
          name="content"
          rows={16}
          required
          defaultValue={article?.content}
          placeholder="Markdown形式で記事の内容を入力..."
          className="font-mono text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">価格 (円)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={article?.price ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">評価 (0-5)</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            defaultValue={article?.rating ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label>サムネイル画像</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "アップロード中..." : "画像を選択"}
            </Button>
            {thumbnailUrl && (
              <button
                type="button"
                onClick={() => setThumbnailUrl("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                削除
              </button>
            )}
          </div>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="サムネイル"
              className="mt-1 w-full max-h-32 object-cover rounded border"
            />
          )}
          <Input
            type="url"
            placeholder="または URLを直接入力..."
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="text-xs"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleThumbnailUpload}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_free"
            defaultChecked={article?.is_free ?? true}
            className="rounded border-border"
          />
          無料記事
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={article?.published ?? false}
            className="rounded border-border"
          />
          公開する
        </label>
      </div>
      <Button type="submit">{article ? "更新する" : "作成する"}</Button>
    </form>
  );
}
