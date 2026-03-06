"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "./actions";
import { Button } from "@/components/ui/button";

export function DisplayNameEditor({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanged = name !== currentName;

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateDisplayName(name);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        表示名（ニックネーム）
      </p>
      <p className="text-[11px] text-muted-foreground mb-2">
        サイト内で表示される名前です。実名でなくても構いません。
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ニックネームを入力"
          maxLength={50}
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanged || isPending}
        >
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>
      {saved && (
        <p className="text-xs text-emerald-600 mt-1">保存しました</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
