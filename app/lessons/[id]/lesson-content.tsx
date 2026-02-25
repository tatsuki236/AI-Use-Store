"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonContent({ content }: { content: string }) {
  return (
    <div className="article-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
