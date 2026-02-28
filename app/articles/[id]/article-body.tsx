"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
      aria-label="コードをコピー"
    >
      {copied ? "コピーしました" : "コピー"}
    </button>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const el = node as { props: { children?: React.ReactNode } };
    return extractText(el.props.children);
  }
  return "";
}

/** Detect if content is HTML (from Tiptap) rather than Markdown */
function isHtmlContent(content: string): boolean {
  return /<(?:p|h[1-6]|div|ul|ol|blockquote|pre|figure)\b/i.test(content);
}

/** HTML rendering component with copy buttons on code blocks */
function HtmlArticleBody({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const container = containerRef.current;
    if (!container) return;

    // Add copy buttons to code blocks
    container.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const code = pre.querySelector("code");
      if (!code) return;

      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.className =
        "copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-gray-300 transition-colors";
      btn.textContent = "コピー";
      btn.onclick = async () => {
        await navigator.clipboard.writeText(code.textContent || "");
        btn.textContent = "コピーしました";
        setTimeout(() => {
          btn.textContent = "コピー";
        }, 2000);
      };
      wrapper.insertBefore(btn, pre);
    });

    // Apply syntax highlighting
    container.querySelectorAll("pre code").forEach((block) => {
      if (!(block as HTMLElement).classList.contains("hljs")) {
        import("highlight.js").then((hljs) => {
          hljs.default.highlightElement(block as HTMLElement);
        });
      }
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export function ArticleBody({ content }: { content: string }) {
  // HTML content from Tiptap editor
  if (isHtmlContent(content)) {
    return <HtmlArticleBody content={content} />;
  }

  // Legacy Markdown content
  // Preprocess ::youtube directives
  const processed = content.replace(
    /::youtube\[([^\]]+)\]/g,
    (_match, url: string) => {
      const m = url
        .trim()
        .match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
        );
      if (m) {
        return `<div data-youtube="${m[1]}"></div>`;
      }
      return _match;
    }
  );

  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          pre({ children, ...props }) {
            const code = extractText(children);
            return (
              <div className="relative group">
                <CopyButton code={code} />
                <pre {...props}>{children}</pre>
              </div>
            );
          },
          div({ node, children, ...props }) {
            const youtubeId =
              (node?.properties?.dataYoutube as string) ?? null;
            if (youtubeId) {
              return (
                <div className="my-6 rounded-xl overflow-hidden shadow-md">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            }
            return <div {...props}>{children}</div>;
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
