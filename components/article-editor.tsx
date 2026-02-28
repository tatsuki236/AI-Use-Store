"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArticleBody } from "@/app/articles/[id]/article-body";

type ArticleEditorProps = {
  formAction: (formData: FormData) => void;
  article?: {
    id: string;
    title: string;
    content: string;
    price: number;
    is_free: boolean;
    thumbnail_url: string | null;
  };
  rejectionNotice?: React.ReactNode;
};

const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "bash",
  "json",
  "sql",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
];

export function ArticleEditor({
  formAction,
  article,
  rejectionNotice,
}: ArticleEditorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [price, setPrice] = useState(article?.price ?? 0);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    article?.thumbnail_url ?? ""
  );
  const [isFree, setIsFree] = useState(article?.is_free ?? true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [content, setContent] = useState(article?.content ?? "");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  function handleSubmit(actionType: "draft" | "submit") {
    if (!formRef.current) return;
    const hiddenAction = formRef.current.querySelector(
      'input[name="action"]'
    ) as HTMLInputElement;
    if (hiddenAction) hiddenAction.value = actionType;
    formRef.current.requestSubmit();
  }

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = content.slice(start, end);
      const before = content.slice(0, start);
      const after = content.slice(end);

      const newText = before + prefix + selected + suffix + after;
      setContent(newText);

      // Restore focus and cursor position after React re-renders
      requestAnimationFrame(() => {
        ta.focus();
        const cursorPos = selected
          ? start + prefix.length + selected.length + suffix.length
          : start + prefix.length;
        ta.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [content]
  );

  const insertBlock = useCallback(
    (block: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const before = content.slice(0, start);
      const after = content.slice(start);

      // Ensure newlines around block
      const needNewlineBefore = before.length > 0 && !before.endsWith("\n\n");
      const needNewlineAfter = after.length > 0 && !after.startsWith("\n\n");
      const pre = needNewlineBefore ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      const post = needNewlineAfter ? (after.startsWith("\n") ? "\n" : "\n\n") : "";

      const newText = before + pre + block + post + after;
      setContent(newText);

      requestAnimationFrame(() => {
        ta.focus();
        const cursorPos = before.length + pre.length + block.length;
        ta.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [content]
  );

  const toolbarButtons = [
    {
      group: "heading",
      items: [
        { label: "H2", title: "見出し2", action: () => insertMarkdown("## ") },
        { label: "H3", title: "見出し3", action: () => insertMarkdown("### ") },
      ],
    },
    {
      group: "format",
      items: [
        { label: "B", title: "太字", action: () => insertMarkdown("**", "**"), bold: true },
        { label: "I", title: "斜体", action: () => insertMarkdown("*", "*"), italic: true },
        { label: "S", title: "取り消し線", action: () => insertMarkdown("~~", "~~"), strike: true },
      ],
    },
    {
      group: "list",
      items: [
        { label: "•", title: "箇条書き", action: () => insertMarkdown("- ") },
        { label: "1.", title: "番号付きリスト", action: () => insertMarkdown("1. ") },
      ],
    },
    {
      group: "block",
      items: [
        { label: ">", title: "引用", action: () => insertMarkdown("> ") },
        { label: "</>", title: "インラインコード", action: () => insertMarkdown("`", "`") },
        {
          label: "{ }",
          title: "コードブロック",
          action: () => setLangMenuOpen(true),
        },
      ],
    },
    {
      group: "rich",
      items: [
        {
          label: "A",
          title: "文字色",
          action: () => setColorMenuOpen(true),
          colorBtn: true,
        },
        { label: "▶", title: "YouTube埋め込み", action: () => {
          const url = prompt("YouTube URLを入力してください");
          if (url) insertBlock(`::youtube[${url}]`);
        }},
      ],
    },
    {
      group: "insert",
      items: [
        { label: "🔗", title: "リンク", action: () => insertMarkdown("[", "](url)") },
        { label: "🖼", title: "画像", action: () => insertMarkdown("![alt](", ")") },
        { label: "―", title: "区切り線", action: () => insertBlock("---") },
      ],
    },
  ];

  const TEXT_COLORS = [
    { label: "赤", value: "#ef4444", bg: "bg-red-500" },
    { label: "青", value: "#3b82f6", bg: "bg-blue-500" },
    { label: "緑", value: "#22c55e", bg: "bg-green-500" },
    { label: "紫", value: "#a855f7", bg: "bg-purple-500" },
    { label: "オレンジ", value: "#f97316", bg: "bg-orange-500" },
    { label: "ピンク", value: "#ec4899", bg: "bg-pink-500" },
    { label: "黄", value: "#eab308", bg: "bg-yellow-500" },
    { label: "シアン", value: "#06b6d4", bg: "bg-cyan-500" },
  ];

  const insertColor = (color: string) => {
    insertMarkdown(`<span style="color:${color}">`, "</span>");
    setColorMenuOpen(false);
  };

  const insertCodeBlock = (lang: string) => {
    insertBlock("```" + lang + "\n\n```");
    setLangMenuOpen(false);
    // Place cursor inside the code block
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const idx = content.indexOf("```" + lang + "\n");
      if (idx === -1) {
        // After insertBlock, find the inserted block
        const pos = ta.selectionStart - 4; // before closing ```
        ta.setSelectionRange(pos, pos);
      }
    });
  };

  return (
    <form ref={formRef} action={formAction}>
      {/* Hidden inputs for server action compatibility */}
      <input type="hidden" name="action" value="draft" />
      <input type="hidden" name="price" value={price} />
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
      <input type="hidden" name="content" value={content} />
      {isFree && <input type="hidden" name="is_free" value="on" />}

      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="mx-auto max-w-[720px] h-14 flex items-center justify-between px-4">
          <Link
            href="/sell"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; 戻る
          </Link>

          {/* Tab switcher */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "edit"
                  ? "bg-white text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "preview"
                  ? "bg-white text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              プレビュー
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSubmit("draft")}
            >
              下書き保存
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              公開設定
            </Button>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="min-h-screen bg-white pt-14">
        <div className="mx-auto max-w-[720px] px-4 py-8">
          {rejectionNotice}

          <input
            name="title"
            required
            defaultValue={article?.title ?? ""}
            placeholder="タイトル"
            className="w-full text-2xl sm:text-[2rem] font-bold border-none outline-none bg-transparent placeholder:text-muted-foreground/50 mb-6"
          />

          {activeTab === "edit" ? (
            <>
              {/* Toolbar */}
              <div className="sticky top-14 z-40 bg-white border-b border-border/60 -mx-4 px-4 py-2 mb-4 flex flex-wrap items-center gap-1">
                {toolbarButtons.map((group) => (
                  <div key={group.group} className="flex items-center gap-0.5 mr-2">
                    {group.items.map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        title={btn.title}
                        onClick={btn.action}
                        className={`px-2 py-1 text-sm rounded hover:bg-muted transition-colors ${
                          "bold" in btn && btn.bold ? "font-bold" : ""
                        } ${
                          "italic" in btn && btn.italic ? "italic" : ""
                        } ${
                          "strike" in btn && btn.strike ? "line-through" : ""
                        } ${
                          "colorBtn" in btn && btn.colorBtn ? "bg-gradient-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent font-bold" : ""
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Paywall marker button */}
                <div className="ml-auto">
                  <button
                    type="button"
                    title="有料エリアの開始位置を挿入"
                    onClick={() => insertBlock("<!-- paywall -->")}
                    className="px-3 py-1 text-sm rounded bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 font-medium transition-colors"
                  >
                    ここから有料
                  </button>
                </div>

                {/* Color picker dropdown */}
                {colorMenuOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-lg shadow-lg mt-1 p-3 z-50">
                    <p className="text-xs text-muted-foreground mb-2">文字色を選択</p>
                    <div className="flex flex-wrap gap-2">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => insertColor(c.value)}
                          className={`w-7 h-7 rounded-full ${c.bg} hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-offset-2 hover:ring-gray-300`}
                          title={c.label}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setColorMenuOpen(false)}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      キャンセル
                    </button>
                  </div>
                )}

                {/* Language selection dropdown for code blocks */}
                {langMenuOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-lg shadow-lg mt-1 p-2 z-50">
                    <p className="text-xs text-muted-foreground mb-2 px-1">言語を選択</p>
                    <div className="flex flex-wrap gap-1">
                      {CODE_LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => insertCodeBlock(lang)}
                          className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {lang}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          insertBlock("```\n\n```");
                          setLangMenuOpen(false);
                        }}
                        className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        なし
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLangMenuOpen(false)}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      キャンセル
                    </button>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ここに本文を書く（Markdown対応）..."
                className="w-full text-base leading-[1.9] border-none outline-none bg-transparent resize-none placeholder:text-muted-foreground/50 min-h-[calc(100vh-16rem)]"
              />
            </>
          ) : (
            /* Preview tab */
            <div className="min-h-[calc(100vh-16rem)]">
              {content ? (
                <ArticleBody content={content} />
              ) : (
                <p className="text-muted-foreground">プレビューする内容がありません</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>公開設定</DialogTitle>
            <DialogDescription>
              価格やサムネイルを設定して審査に提出します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded border-border"
              />
              無料教材
            </label>

            {!isFree && (
              <div className="space-y-2">
                <Label htmlFor="dialog-price">価格 (円)</Label>
                <Input
                  id="dialog-price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dialog-thumbnail">サムネイルURL</Label>
              <Input
                id="dialog-thumbnail"
                type="url"
                placeholder="https://..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                handleSubmit("submit");
              }}
            >
              審査に提出する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
