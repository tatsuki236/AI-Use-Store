import Link from "next/link";

const categories = [
  { label: "ChatGPT活用", href: "/search?q=ChatGPT" },
  { label: "プロンプト設計", href: "/search?q=プロンプト" },
  { label: "画像生成AI", href: "/search?q=画像生成" },
  { label: "AI自動化・効率化", href: "/search?q=自動化" },
  { label: "AI × プログラミング", href: "/search?q=プログラミング" },
  { label: "AIビジネス活用", href: "/search?q=ビジネス" },
];

const popularTags = [
  "GPT-4o", "Claude", "Gemini", "Midjourney",
  "Stable Diffusion", "RAG", "LangChain", "AI副業",
  "プロンプト", "業務効率化", "初心者向け", "実践",
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            カテゴリー
          </h3>
          <nav className="space-y-0.5">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors hover:font-medium"
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Popular Tags */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            人気タグ
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 text-xs rounded-full bg-muted/80 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
