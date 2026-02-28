"use client";

import { useState, useCallback } from "react";
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

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Transform ::youtube[URL] directives into <div data-youtube="VIDEO_ID"> before markdown parsing */
function preprocessContent(content: string): string {
  return content.replace(
    /::youtube\[([^\]]+)\]/g,
    (_match, url: string) => {
      const videoId = extractYouTubeId(url.trim());
      if (videoId) {
        return `<div data-youtube="${videoId}"></div>`;
      }
      return _match;
    }
  );
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden shadow-md">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function ArticleBody({ content }: { content: string }) {
  const processed = preprocessContent(content);

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
            const youtubeId = (node?.properties?.dataYoutube as string) ?? null;
            if (youtubeId) {
              return <YouTubeEmbed videoId={youtubeId} />;
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
