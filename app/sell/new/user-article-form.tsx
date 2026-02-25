"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createUserArticle } from "./actions";
import { useRef } from "react";

export function UserArticleForm() {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(actionType: string) {
    if (!formRef.current) return;
    const hiddenInput = formRef.current.querySelector(
      'input[name="action"]'
    ) as HTMLInputElement;
    if (hiddenInput) hiddenInput.value = actionType;
    formRef.current.requestSubmit();
  }

  return (
    <form ref={formRef} action={createUserArticle} className="space-y-6">
      <input type="hidden" name="action" value="draft" />

      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          required
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
          placeholder="Markdown形式で教材の内容を入力..."
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">価格 (円)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">サムネイルURL</Label>
          <Input
            id="thumbnail_url"
            name="thumbnail_url"
            type="url"
            placeholder="https://..."
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_free"
          defaultChecked
          className="rounded border-border"
        />
        無料教材
      </label>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit("draft")}
        >
          下書き保存
        </Button>
        <Button type="button" onClick={() => handleSubmit("submit")}>
          審査に提出する
        </Button>
      </div>
    </form>
  );
}
