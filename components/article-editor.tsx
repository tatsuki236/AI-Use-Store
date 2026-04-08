"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Node, mergeAttributes, type Editor } from "@tiptap/core";
import { marked } from "marked";

// Extend commands interface for PaywallDivider
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paywallDivider: {
      setPaywallDivider: () => ReturnType;
    };
  }
}
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

// Custom paywall divider node
const PaywallDivider = Node.create({
  name: "paywallDivider",
  group: "block",
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-paywall]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-paywall": "true" })];
  },

  addCommands() {
    return {
      setPaywallDivider:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },
});

type ArticleEditorProps = {
  formAction: (formData: FormData) => void;
  article?: {
    id: string;
    title: string;
    content: string;
    price: number;
    is_free: boolean;
    thumbnail_url: string | null;
    slug?: string | null;
  };
  rejectionNotice?: React.ReactNode;
};

/** Detect if content is Markdown (vs HTML from Tiptap) */
function isMarkdownContent(content: string): boolean {
  return !/<(?:p|h[1-6]|div|ul|ol|blockquote|pre|figure)\b/i.test(content);
}

/** Convert old Markdown content to HTML for Tiptap loading */
function convertMarkdownToHtml(markdown: string): string {
  // Convert custom directives first
  let processed = markdown.replace(
    /::youtube\[([^\]]+)\]/g,
    (_match, url: string) => {
      const m = url
        .trim()
        .match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
        );
      if (m) {
        return `<div data-youtube-video><iframe src="https://www.youtube.com/embed/${m[1]}"></iframe></div>`;
      }
      return _match;
    }
  );

  // Convert <!-- paywall --> to div
  processed = processed.replace(
    /<!--\s*paywall\s*-->/g,
    '<div data-paywall="true"></div>'
  );

  return marked.parse(processed) as string;
}

const TEXT_COLORS = [
  { label: "黒", value: "#000000", bg: "bg-black" },
  { label: "赤", value: "#ef4444", bg: "bg-red-500" },
  { label: "青", value: "#3b82f6", bg: "bg-blue-500" },
  { label: "緑", value: "#22c55e", bg: "bg-green-500" },
  { label: "紫", value: "#a855f7", bg: "bg-purple-500" },
  { label: "オレンジ", value: "#f97316", bg: "bg-orange-500" },
  { label: "ピンク", value: "#ec4899", bg: "bg-pink-500" },
  { label: "黄", value: "#eab308", bg: "bg-yellow-500" },
  { label: "シアン", value: "#06b6d4", bg: "bg-cyan-500" },
];

const CODE_LANGUAGES = [
  "javascript", "typescript", "python", "html", "css",
  "bash", "json", "sql", "go", "rust", "java",
];

async function uploadImage(file: File): Promise<string | null> {
  const MAX_SIZE = 50 * 1024 * 1024;
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!ALLOWED.includes(file.type)) {
    alert("許可されていないファイル形式です (JPEG, PNG, WebP, GIF のみ)");
    return null;
  }
  if (file.size > MAX_SIZE) {
    alert("ファイルサイズは50MB以下にしてください");
    return null;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("ログインが必要です");
    return null;
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("article-images")
    .upload(filePath, file, { contentType: file.type });

  if (error) {
    alert("アップロードに失敗しました: " + error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("article-images")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export function ArticleEditor({
  formAction,
  article,
  rejectionNotice,
}: ArticleEditorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [price, setPrice] = useState(article?.price ?? 0);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    article?.thumbnail_url ?? ""
  );
  const [isFree, setIsFree] = useState(article?.is_free ?? true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [content, setContent] = useState("");
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [uploading, setUploading] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);

  // Prepare initial content
  const initialContent = article?.content
    ? isMarkdownContent(article.content)
      ? convertMarkdownToHtml(article.content)
      : article.content
    : "";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: "code-block" },
        },
      }),
      TextStyle,
      Color,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "editor-image" },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: "youtube-embed" },
      }),
      Placeholder.configure({
        placeholder: "ここに本文を書く...",
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: "editor-table" },
      }),
      TableRow,
      TableHeader,
      TableCell,
      PaywallDivider,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "article-content editor-area outline-none",
      },
    },
  });

  // Set initial content state
  useEffect(() => {
    if (editor && !content) {
      setContent(editor.getHTML());
    }
  }, [editor, content]);

  function handleSubmit(actionType: "draft" | "submit") {
    if (!formRef.current) return;
    const hiddenAction = formRef.current.querySelector(
      'input[name="action"]'
    ) as HTMLInputElement;
    if (hiddenAction) hiddenAction.value = actionType;
    formRef.current.requestSubmit();
  }

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URLを入力", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleBodyImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      setUploading(true);
      try {
        const url = await uploadImage(file);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [editor]
  );

  const handleThumbnailUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadImage(file);
        if (url) {
          setThumbnailUrl(url);
        }
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    []
  );

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URLを入力");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const setColor = useCallback(
    (color: string) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
      setColorMenuOpen(false);
    },
    [editor]
  );

  const unsetColor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetColor().run();
    setColorMenuOpen(false);
  }, [editor]);

  const insertCodeBlock = useCallback(
    (language: string) => {
      if (!editor) return;
      editor.chain().focus().toggleCodeBlock().run();
      // Set language attribute on the code block
      if (language) {
        editor.chain().focus().updateAttributes("codeBlock", { language }).run();
      }
      setLangMenuOpen(false);
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <form ref={formRef} action={formAction}>
      {/* Hidden inputs */}
      <input type="hidden" name="action" value="draft" />
      <input type="hidden" name="price" value={price} />
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
      <input type="hidden" name="content" value={content} />
      {isFree && <input type="hidden" name="is_free" value="on" />}
      <input type="hidden" name="slug" value={slug} />

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
              <div className="sticky top-14 z-40 bg-white border-b border-border/60 -mx-4 px-4 py-1.5 mb-4 flex flex-wrap items-center gap-0.5 relative">
                {/* Headings */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "is-active" : ""}`}
                  title="大見出し"
                >
                  大見出し
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "is-active" : ""}`}
                  title="見出し"
                >
                  見出し
                </button>

                <span className="toolbar-sep" />

                {/* Formatting */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`toolbar-btn font-bold ${editor.isActive("bold") ? "is-active" : ""}`}
                  title="太字"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`toolbar-btn italic ${editor.isActive("italic") ? "is-active" : ""}`}
                  title="斜体"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`toolbar-btn line-through ${editor.isActive("strike") ? "is-active" : ""}`}
                  title="取り消し線"
                >
                  S
                </button>

                <span className="toolbar-sep" />

                {/* Lists */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`toolbar-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
                  title="箇条書き"
                >
                  &bull;
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`toolbar-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
                  title="番号付き"
                >
                  1.
                </button>

                <span className="toolbar-sep" />

                {/* Block */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`toolbar-btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
                  title="引用"
                >
                  &gt;
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`toolbar-btn font-mono text-xs ${editor.isActive("code") ? "is-active" : ""}`}
                  title="インラインコード"
                >
                  &lt;/&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`toolbar-btn ${editor.isActive("codeBlock") ? "is-active" : ""}`}
                  title="コードブロック"
                >
                  {"{ }"}
                </button>

                <span className="toolbar-sep" />

                {/* Insert */}
                <button type="button" onClick={setLink} className={`toolbar-btn ${editor.isActive("link") ? "is-active" : ""}`} title="リンク">
                  🔗
                </button>
                <label className={`toolbar-btn cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`} title="画像">
                  {uploading ? "..." : "\uD83D\uDDBC"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleBodyImageUpload}
                  />
                </label>
                <button type="button" onClick={addYoutube} className="toolbar-btn" title="YouTube">
                  ▶
                </button>

                <span className="toolbar-sep" />

                {/* Color */}
                <button
                  type="button"
                  onClick={() => setColorMenuOpen(!colorMenuOpen)}
                  className="toolbar-btn"
                  title="文字色"
                >
                  <span className="bg-gradient-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent font-bold">A</span>
                </button>

                {/* Separator */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className="toolbar-btn"
                  title="区切り線"
                >
                  ―
                </button>

                {/* Table */}
                <button
                  type="button"
                  onClick={() => setTableMenuOpen(!tableMenuOpen)}
                  className={`toolbar-btn ${editor.isActive("table") ? "is-active" : ""}`}
                  title="表"
                >
                  表
                </button>

                {/* Paywall */}
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => editor.commands.setPaywallDivider()}
                    className="px-3 py-1 text-xs rounded bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 font-medium transition-colors"
                    title="有料エリアの開始位置"
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
                          onClick={() => setColor(c.value)}
                          className={`w-7 h-7 rounded-full ${c.bg} hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-offset-2 hover:ring-gray-300`}
                          title={c.label}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={unsetColor}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:scale-110 transition-transform flex items-center justify-center text-xs"
                        title="色をリセット"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setColorMenuOpen(false)}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      閉じる
                    </button>
                  </div>
                )}

                {/* Language picker for code blocks */}
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
                        onClick={() => insertCodeBlock("")}
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

                {/* Table menu */}
                {tableMenuOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-lg shadow-lg mt-1 p-3 z-50">
                    <p className="text-xs text-muted-foreground mb-2">表の操作</p>
                    <div className="flex flex-wrap gap-1">
                      {!editor.isActive("table") ? (
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                            setTableMenuOpen(false);
                          }}
                          className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          3×3の表を挿入
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            列を右に追加
                          </button>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            列を左に追加
                          </button>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().deleteColumn().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          >
                            列を削除
                          </button>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().addRowAfter().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            行を下に追加
                          </button>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().addRowBefore().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            行を上に追加
                          </button>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().deleteRow().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          >
                            行を削除
                          </button>
                          <button
                            type="button"
                            onClick={() => { editor.chain().focus().deleteTable().run(); setTableMenuOpen(false); }}
                            className="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          >
                            表を削除
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTableMenuOpen(false)}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      閉じる
                    </button>
                  </div>
                )}
              </div>

              {/* Tiptap Editor */}
              <EditorContent
                editor={editor}
                className="min-h-[calc(100vh-16rem)]"
              />
            </>
          ) : (
            /* Preview tab */
            <div className="min-h-[calc(100vh-16rem)]">
              {content ? (
                <ArticleBody content={content} />
              ) : (
                <p className="text-muted-foreground">
                  プレビューする内容がありません
                </p>
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
            <div className="space-y-2">
              <Label htmlFor="dialog-slug">カスタムURL（スラッグ）</Label>
              <Input
                id="dialog-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="例: chatgpt-beginner-guide"
                pattern="[a-z0-9-]*"
              />
              <p className="text-xs text-muted-foreground">
                半角英数字とハイフンのみ。未設定の場合はIDがURLになります。
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded border-border"
              />
              無料記事
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
              <Label>サムネイル画像</Label>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                サムネイルを設定すると記事一覧での見栄えが良くなります。未設定の場合はデフォルトのロゴ画像が表示されます。
              </p>
              <div className="flex items-center gap-2">
                <label
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {uploading ? "アップロード中..." : "画像を選択"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                </label>
                {thumbnailUrl && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    設定済み
                  </span>
                )}
              </div>
              {thumbnailUrl && (
                <div className="mt-2 relative">
                  <img
                    src={thumbnailUrl}
                    alt="サムネイルプレビュー"
                    className="w-full max-h-40 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl("")}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              )}
              <Input
                id="dialog-thumbnail"
                type="url"
                placeholder="または URLを直接入力..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="text-xs"
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
