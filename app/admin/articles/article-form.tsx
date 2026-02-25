"use client";

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
};

export function ArticleForm({ article }: { article?: Article }) {
  const action = article
    ? updateArticle.bind(null, article.id)
    : createArticle;

  return (
    <form action={action} className="space-y-4">
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
        <Label htmlFor="content">内容 (Markdown)</Label>
        <Textarea
          id="content"
          name="content"
          rows={16}
          required
          defaultValue={article?.content}
          placeholder="Markdown形式で教材の内容を入力..."
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
          <Label htmlFor="thumbnail_url">サムネイルURL</Label>
          <Input
            id="thumbnail_url"
            name="thumbnail_url"
            type="url"
            defaultValue={article?.thumbnail_url ?? ""}
            placeholder="https://..."
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
          無料教材
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
