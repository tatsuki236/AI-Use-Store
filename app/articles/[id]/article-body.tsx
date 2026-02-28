"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
